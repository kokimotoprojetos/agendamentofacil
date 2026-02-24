import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

// ─── Booking state machine stages ─────────────────────────────────────────────
// idle → collecting_name → collecting_service → collecting_date →
// collecting_time → awaiting_confirmation → booked
// ─────────────────────────────────────────────────────────────────────────────

type BookingData = {
  stage: string;
  customer_name?: string;
  service_name?: string;
  date?: string;
  time?: string;
};

export const aiAgentService = {
  // ─── Core LLM call (general conversation) ──────────────────────────────────
  processMessage: async (message: string, context: any): Promise<string> => {
    const dayMap: Record<string, string> = {
      mon: 'Segunda-feira', tue: 'Terça-feira', wed: 'Quarta-feira',
      thu: 'Quinta-feira', fri: 'Sexta-feira', sat: 'Sábado', sun: 'Domingo'
    };
    const openDays = (context.workingDays || []).map((d: string) => dayMap[d]).join(', ');

    const systemPrompt = `
      Você é o assistente virtual de atendimento e agendamento do(a) "${context.businessName}".
      Seu objetivo é ajudar os clientes de forma natural, amigável e eficiente, seguindo a personalidade: ${context.personality}.

      INFORMAÇÕES DO NEGÓCIO (USE SOMENTE SE NECESSÁRIO):
      - Localização: ${context.location}
      - Dias de Funcionamento: ${openDays}
      - Horário: ${context.workingHours.start} até ${context.workingHours.end}
      - Catálogo de Serviços:
        ${context.services.length > 0
        ? context.services.map((s: any) => `- ${s.name}: R$ ${s.price} (${s.duration} min)`).join('\n        ')
        : 'Nenhum serviço cadastrado.'}

      DIRETRIZES DE CONVERSA (MUITO IMPORTANTE):
      1. NÃO envie todas as informações acima de uma vez. Responda apenas o que foi perguntado.
      2. Se o cliente apenas cumprimentar (ex: "Oi", "Bom dia"), responda com uma saudação amigável e pergunte como pode ajudar.
      3. Seja profissional mas amigável. Use a personalidade indicada.
      4. Mantenha as respostas concisas (máximo 2 a 3 frases).
      5. Somente liste os serviços se o cliente solicitar ou se for relevante para o fluxo de agendamento.
    `;

    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(context.history || []),
          { role: 'user', content: message }
        ],
        temperature: 0.2,
      });
      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error processing AI message:', error);
      return 'Desculpe, estou com uma instabilidade técnica momentânea. Pode repetir?';
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

      // 4. Read current booking stage from conversation context
      const convCtx = (conversation.context as any) || {};
      const booking: BookingData = convCtx.booking || { stage: 'idle' };

      let aiResponse = '';
      let updatedBooking = { ...booking };

      // ── BOOKING STATE MACHINE ──────────────────────────────────────────────
      if (booking.stage === 'awaiting_confirmation') {
        // Client is confirming or declining a complete booking
        const confirmed = await this.checkConfirmation(messageText);
        if (confirmed) {
          const success = await this.executeBooking(tenantId, booking, customerPhone);
          if (success) {
            const dateFormatted = booking.date ? new Date(booking.date + 'T12:00:00').toLocaleDateString('pt-BR') : booking.date;
            aiResponse = `✅ Perfeito, ${booking.customer_name}! Seu agendamento para *${booking.service_name}* no dia *${dateFormatted}* às *${booking.time}* foi confirmado! Até lá! 😊`;
            updatedBooking = { stage: 'idle' };
          } else {
            aiResponse = 'Tive um problema ao finalizar o agendamento. Poderia tentar novamente?';
            updatedBooking = { stage: 'idle' };
          }
        } else {
          // Client declined or wants to change something
          aiResponse = 'Tudo bem! Deseja alterar alguma informação ou prefere cancelar o agendamento?';
          updatedBooking = { stage: 'idle' };
        }

      } else if (booking.stage === 'collecting_name') {
        updatedBooking = { ...booking, customer_name: messageText.trim(), stage: 'collecting_service' };
        const serviceList = context.services.map((s: any) => `• ${s.name} (R$ ${s.price})`).join('\n');
        aiResponse = `Olá, ${messageText.trim()}! Nossos serviços disponíveis são:\n${serviceList}\n\nQual serviço você gostaria?`;

      } else if (booking.stage === 'collecting_service') {
        updatedBooking = { ...booking, service_name: messageText.trim(), stage: 'collecting_date' };
        const dayMap: Record<string, string> = {
          mon: 'Segunda', tue: 'Terça', wed: 'Quarta',
          thu: 'Quinta', fri: 'Sexta', sat: 'Sábado', sun: 'Domingo'
        };
        const openDays = (context.workingDays || []).map((d: string) => dayMap[d] || d).join(', ');
        aiResponse = `Ótima escolha! 😊 Atendemos nos dias: ${openDays}. Qual data você prefere? (Ex: 28/02/2026)`;

      } else if (booking.stage === 'collecting_date') {
        const parsedDate = await this.parseDate(messageText);
        if (parsedDate) {
          updatedBooking = { ...booking, date: parsedDate, stage: 'collecting_time' };
          aiResponse = `Perfeito! E qual horário você prefere? Atendemos das ${context.workingHours?.start || '08:00'} às ${context.workingHours?.end || '18:00'}. (Ex: 14:00)`;
        } else {
          aiResponse = 'Não consegui entender a data. Pode informar no formato DD/MM/AAAA? Ex: 28/02/2026';
        }

      } else if (booking.stage === 'collecting_time') {
        const parsedTime = await this.parseTime(messageText);
        if (parsedTime) {
          const isAvailable = await this.checkAvailability(tenantId, booking.date!, parsedTime);
          if (isAvailable) {
            updatedBooking = { ...booking, time: parsedTime, stage: 'awaiting_confirmation' };
            const dateFormatted = booking.date ? new Date(booking.date + 'T12:00:00').toLocaleDateString('pt-BR') : booking.date;
            aiResponse = `📋 *Resumo do Agendamento:*\n👤 Nome: ${booking.customer_name}\n✂️ Serviço: ${booking.service_name}\n📅 Data: ${dateFormatted}\n🕐 Horário: ${parsedTime}\n\nPosso confirmar? (Sim/Não)`;
          } else {
            aiResponse = `Que pena! O horário das ${parsedTime} já está ocupado nesse dia. Pode me dizer outro horário?`;
          }
        } else {
          aiResponse = 'Não entendi o horário. Pode informar no formato HH:MM? Ex: 14:30';
        }

      } else {
        // ── IDLE: check if client wants to book ────────────────────────────
        const wantsToBook = await this.detectBookingIntent(messageText);
        if (wantsToBook) {
          updatedBooking = { stage: 'collecting_name' };
          aiResponse = 'Que ótimo! Fico feliz em ajudar com o agendamento 😊 Para começar, qual o seu nome completo?';
        } else {
          // Normal conversation
          aiResponse = await this.processMessage(messageText, { ...context, history: formattedHistory }) || 'Como posso ajudar?';
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

  // ─── Detect if client wants to book ────────────────────────────────────────
  detectBookingIntent: async (message: string): Promise<boolean> => {
    const prompt = `Você deve detectar se o cliente quer fazer um agendamento, consulta, reserva, ou perguntar sobre horários disponíveis na mensagem: "${message}". Retorne apenas "true" ou "false".`;
    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      return response.choices[0].message.content?.toLowerCase().includes('true') || false;
    } catch {
      return false;
    }
  },

  // ─── Parse date from natural language ──────────────────────────────────────
  parseDate: async (message: string): Promise<string | null> => {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `Converta a data mencionada na mensagem "${message}" para o formato YYYY-MM-DD. Hoje é ${today}. Retorne APENAS a data no formato YYYY-MM-DD ou null se não for possível identificar.`;
    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      const result = response.choices[0].message.content?.trim() || '';
      // Validate format YYYY-MM-DD
      return /^\d{4}-\d{2}-\d{2}$/.test(result) ? result : null;
    } catch {
      return null;
    }
  },

  // ─── Parse time from natural language ──────────────────────────────────────
  parseTime: async (message: string): Promise<string | null> => {
    const prompt = `Converta o horário mencionado na mensagem "${message}" para o formato HH:MM (24h). Retorne APENAS o horário no formato HH:MM ou null se não for possível identificar.`;
    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      const result = response.choices[0].message.content?.trim() || '';
      return /^\d{2}:\d{2}$/.test(result) ? result : null;
    } catch {
      return null;
    }
  },

  // ─── Check for time slot conflicts ─────────────────────────────────────────
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
    } catch {
      return true; // Fallback: allow booking
    }
  },

  // ─── Check if client confirmed ─────────────────────────────────────────────
  checkConfirmation: async (message: string): Promise<boolean> => {
    const prompt = `Avalie se a mensagem é uma confirmação positiva (ex: sim, claro, pode confirmar, ok, yes, confirmar): "${message}". Retorne apenas "true" ou "false".`;
    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      return response.choices[0].message.content?.toLowerCase().includes('true') || false;
    } catch {
      return false;
    }
  },

  // ─── Create appointment in Supabase ────────────────────────────────────────
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
          notes: `Agendado via IA pelo WhatsApp. Serviço solicitado: ${booking.service_name}`
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error executing booking:', error);
      return false;
    }
  }
};
