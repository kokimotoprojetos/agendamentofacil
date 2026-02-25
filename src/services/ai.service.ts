import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

// ─── Booking state machine ─────────────────────────────────────────────────────
// idle → collecting_name → collecting_service → collecting_date →
// collecting_time → awaiting_confirmation → (booked / back to idle)
// ─────────────────────────────────────────────────────────────────────────────

type BookingData = {
  stage: string;
  customer_name?: string;
  service_name?: string;
  date?: string;
  time?: string;
};

export const aiAgentService = {
  // ─── Core LLM call for free conversation ───────────────────────────────────
  processMessage: async (message: string, context: any): Promise<string> => {
    const dayMap: Record<string, string> = {
      mon: 'Segunda-feira', tue: 'Terça-feira', wed: 'Quarta-feira',
      thu: 'Quinta-feira', fri: 'Sexta-feira', sat: 'Sábado', sun: 'Domingo'
    };
    const openDays = (context.workingDays || []).map((d: string) => dayMap[d]).join(', ');

    const systemPrompt = `
      Você é o assistente virtual de atendimento do(a) "${context.businessName}".
      Personalidade: ${context.personality}.

      INFORMAÇÕES DO NEGÓCIO (use APENAS quando o cliente perguntar):
      - Localização: ${context.location}
      - Dias de Funcionamento: ${openDays}
      - Horário: ${context.workingHours?.start} às ${context.workingHours?.end}
      - Serviços:
        ${context.services?.length > 0
        ? context.services.map((s: any) => `• ${s.name} — R$ ${s.price} (${s.duration} min)`).join('\n        ')
        : 'Nenhum serviço cadastrado.'}

      REGRAS IMPORTANTES:
      1. Responda APENAS o que o cliente perguntou. Não liste serviços, preços ou endereços sem ser perguntado.
      2. Em saudações simples ("Oi", "Bom dia"), responda de forma amigável e pergunte em que pode ajudar.
      3. Respostas curtas e naturais (1-3 frases).
      4. Não seja robótico. Converse como um atendente real.
    `;

    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(context.history || []),
          { role: 'user', content: message }
        ],
        temperature: 0.4,
      });
      return response.choices[0].message.content || '';
    } catch {
      return 'Desculpe, tive uma instabilidade. Pode repetir?';
    }
  },

  // ─── Main entry point ───────────────────────────────────────────────────────
  async processResponse(tenantId: string, customerPhone: string, messageText: string, context: any): Promise<string> {
    try {
      // 1. Get or create conversation
      let { data: conversation } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('customer_phone', customerPhone)
        .single();

      if (!conversation) {
        const { data: newConv } = await supabaseAdmin
          .from('conversations')
          .insert({ tenant_id: tenantId, customer_phone: customerPhone })
          .select()
          .single();
        conversation = newConv;
      }

      // 2. Fetch message history
      const { data: history } = await supabaseAdmin
        .from('messages')
        .select('direction, content')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(12);

      const formattedHistory = history?.reverse().map(msg => ({
        role: msg.direction === 'inbound' ? 'user' : 'assistant',
        content: msg.content
      })) || [];

      // 3. Save inbound message
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversation.id,
        direction: 'inbound',
        content: messageText
      });

      // 4. Read booking state
      const convCtx = (conversation.context as any) || {};
      const booking: BookingData = convCtx.booking || { stage: 'idle' };

      let aiResponse = '';
      let updatedBooking = { ...booking };

      // ── BOOKING STATE MACHINE ─────────────────────────────────────────────
      switch (booking.stage) {

        // ── Waiting for client confirmation ──────────────────────────────────
        case 'awaiting_confirmation': {
          const confirmed = await this.checkConfirmation(messageText);
          if (confirmed) {
            const success = await this.executeBooking(tenantId, booking, customerPhone);
            if (success) {
              const dateFormatted = booking.date
                ? new Date(booking.date + 'T12:00:00').toLocaleDateString('pt-BR')
                : booking.date;
              aiResponse = `✅ Perfeito, ${booking.customer_name}! Agendamento confirmado:\n\n✂️ *${booking.service_name}*\n📅 ${dateFormatted} às ${booking.time}\n\nTe esperamos! 😊`;
            } else {
              aiResponse = 'Houve um problema ao salvar. Pode tentar novamente?';
            }
            updatedBooking = { stage: 'idle' };
          } else {
            aiResponse = 'Sem problema! Deseja alterar alguma informação ou prefere não agendar agora?';
            updatedBooking = { stage: 'idle' };
          }
          break;
        }

        // ── Got the name, now ask WHAT they want (not listing services yet) ──
        case 'collecting_name': {
          const name = messageText.trim();
          updatedBooking = { ...booking, customer_name: name, stage: 'collecting_service' };
          // Ask about the service naturally, without dumping the whole list
          aiResponse = `Prazer em falar com você, ${name}! 😊 O que você gostaria de fazer hoje?`;
          break;
        }

        // ── Client responds about what they want — extract service naturally ─
        case 'collecting_service': {
          // Try to match a service from the catalog
          const serviceMatch = await this.matchService(messageText, context.services || []);
          if (serviceMatch) {
            updatedBooking = { ...booking, service_name: serviceMatch, stage: 'collecting_date' };
            const dayMap: Record<string, string> = {
              mon: 'Segunda', tue: 'Terça', wed: 'Quarta',
              thu: 'Quinta', fri: 'Sexta', sat: 'Sábado', sun: 'Domingo'
            };
            const openDays = (context.workingDays || []).map((d: string) => dayMap[d] || d).join(', ');
            aiResponse = `Ótima escolha! Atendemos nos dias: ${openDays}. Qual data você prefere? (Ex: 28/02/2026)`;
          } else {
            // Client may have asked about services or said something vague
            const serviceList = (context.services || []).map((s: any) => `• ${s.name} — R$ ${s.price}`).join('\n');
            if (serviceList) {
              aiResponse = `Aqui estão os nossos serviços:\n${serviceList}\n\nQual deles te interessa?`;
            } else {
              aiResponse = 'Quais serviços te interessam? Posso ajudar a escolher o melhor para você!';
            }
          }
          break;
        }

        // ── Got the date ─────────────────────────────────────────────────────
        case 'collecting_date': {
          const parsedDate = await this.parseDate(messageText);
          if (parsedDate) {
            updatedBooking = { ...booking, date: parsedDate, stage: 'collecting_time' };
            aiResponse = `Perfeito! Qual horário você prefere? Atendemos das ${context.workingHours?.start || '08:00'} às ${context.workingHours?.end || '18:00'}.`;
          } else {
            aiResponse = 'Não consegui identificar a data. Pode informar assim: 28/02/2026?';
          }
          break;
        }

        // ── Got the time ─────────────────────────────────────────────────────
        case 'collecting_time': {
          const parsedTime = await this.parseTime(messageText);
          if (parsedTime) {
            const available = await this.checkAvailability(tenantId, booking.date!, parsedTime);
            if (available) {
              updatedBooking = { ...booking, time: parsedTime, stage: 'awaiting_confirmation' };
              const dateFormatted = booking.date
                ? new Date(booking.date + 'T12:00:00').toLocaleDateString('pt-BR')
                : booking.date;
              aiResponse =
                `📋 *Confirme seu agendamento:*\n\n` +
                `👤 Nome: ${booking.customer_name}\n` +
                `✂️ Serviço: ${booking.service_name}\n` +
                `📅 Data: ${dateFormatted}\n` +
                `🕐 Horário: ${parsedTime}\n\n` +
                `Confirmar? (Sim / Não)`;
            } else {
              aiResponse = `Que pena! O horário das ${parsedTime} já está ocupado. Qual outro horário você prefere?`;
            }
          } else {
            aiResponse = 'Não entendi o horário. Pode informar assim: 14:30?';
          }
          break;
        }

        // ── Idle: normal conversation or booking start ─────────────────────
        default: {
          const wantsToBook = await this.detectBookingIntent(messageText);
          if (wantsToBook) {
            updatedBooking = { stage: 'collecting_name' };
            aiResponse = 'Fico feliz em ajudar! Para começar, qual é o seu nome completo?';
          } else {
            aiResponse = await this.processMessage(messageText, { ...context, history: formattedHistory }) || 'Como posso ajudar?';
          }
          break;
        }
      }
      // ─────────────────────────────────────────────────────────────────────

      // 5. Persist updated booking state
      await supabaseAdmin.from('conversations').update({
        context: { ...convCtx, booking: updatedBooking }
      }).eq('id', conversation.id);

      // 6. Save outbound message
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversation.id,
        direction: 'outbound',
        content: aiResponse
      });

      return aiResponse;
    } catch (error) {
      console.error('Erro no processamento da IA:', error);
      return 'Desculpe, tive um problema técnico. Pode repetir?';
    }
  },

  // ─── Detect booking intent ─────────────────────────────────────────────────
  detectBookingIntent: async (message: string): Promise<boolean> => {
    const prompt = `O cliente quer fazer um agendamento, reserva, marcar horário ou perguntar sobre disponibilidade? Mensagem: "${message}". Responda apenas "true" ou "false".`;
    try {
      const r = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      return r.choices[0].message.content?.toLowerCase().includes('true') || false;
    } catch { return false; }
  },

  // ─── Match service from catalog ────────────────────────────────────────────
  matchService: async (message: string, services: any[]): Promise<string | null> => {
    if (!services.length) return null;
    const list = services.map((s: any) => s.name).join(', ');
    const prompt = `Dado o catálogo de serviços: [${list}], o cliente pediu: "${message}". Retorne APENAS o nome exato do serviço correspondente ou "null" se não houver correspondência clara.`;
    try {
      const r = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      const result = r.choices[0].message.content?.trim() || '';
      return result === 'null' || result === '' ? null : result;
    } catch { return null; }
  },

  // ─── Parse date ────────────────────────────────────────────────────────────
  parseDate: async (message: string): Promise<string | null> => {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `Converta a data da mensagem "${message}" para YYYY-MM-DD. Hoje é ${today}. Retorne APENAS a data YYYY-MM-DD ou "null".`;
    try {
      const r = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      const result = r.choices[0].message.content?.trim() || '';
      return /^\d{4}-\d{2}-\d{2}$/.test(result) ? result : null;
    } catch { return null; }
  },

  // ─── Parse time ────────────────────────────────────────────────────────────
  parseTime: async (message: string): Promise<string | null> => {
    const prompt = `Converta o horário da mensagem "${message}" para HH:MM (24h). Retorne APENAS HH:MM ou "null".`;
    try {
      const r = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      const result = r.choices[0].message.content?.trim() || '';
      return /^\d{2}:\d{2}$/.test(result) ? result : null;
    } catch { return null; }
  },

  // ─── Check availability ────────────────────────────────────────────────────
  checkAvailability: async (tenantId: string, date: string, time: string): Promise<boolean> => {
    try {
      const startTime = `${date}T${time}:00`;
      const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .neq('status', 'cancelled')
        .lt('start_time', endTime)
        .gt('end_time', startTime);
      return (count ?? 0) === 0;
    } catch { return true; }
  },

  // ─── Check confirmation ────────────────────────────────────────────────────
  checkConfirmation: async (message: string): Promise<boolean> => {
    const prompt = `A mensagem "${message}" é uma confirmação positiva (sim, ok, pode, confirmar, yes)? Retorne "true" ou "false".`;
    try {
      const r = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      return r.choices[0].message.content?.toLowerCase().includes('true') || false;
    } catch { return false; }
  },

  // ─── Save appointment ──────────────────────────────────────────────────────
  executeBooking: async (tenantId: string, booking: BookingData, customerPhone: string): Promise<boolean> => {
    try {
      const { data: service } = await supabaseAdmin
        .from('services')
        .select('id, duration')
        .eq('tenant_id', tenantId)
        .ilike('name', `%${booking.service_name}%`)
        .limit(1)
        .single();

      const startTime = `${booking.date}T${booking.time}:00`;
      const duration = service?.duration || 60;
      const endTime = new Date(new Date(startTime).getTime() + duration * 60 * 1000).toISOString();

      const { error } = await supabaseAdmin
        .from('appointments')
        .insert({
          tenant_id: tenantId,
          service_id: service?.id || null,
          customer_name: booking.customer_name || `WhatsApp: ${customerPhone}`,
          customer_phone: customerPhone,
          start_time: startTime,
          end_time: endTime,
          status: 'scheduled',
          notes: `Agendado via IA pelo WhatsApp. Serviço: ${booking.service_name}`
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error executing booking:', error);
      return false;
    }
  }
};
