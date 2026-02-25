import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

// ─── Types ─────────────────────────────────────────────────────────────────────
type BookingExtract = {
  hasIntent: boolean;
  activeNow: boolean;   // true only if client is ACTIVELY trying to book right now
  customer_name: string | null;
  service_name: string | null;
  date: string | null;  // YYYY-MM-DD
  time: string | null;  // HH:MM
  complete: boolean;    // true when all 4 fields are present AND activeNow is true
};

type CancellationCtx = {
  appointment_id: string;
  service_name: string;
  date_formatted: string;
  time: string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
async function callAI(messages: any[], opts?: { json?: boolean; temp?: number }): Promise<string> {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    temperature: opts?.temp ?? 0.3,
    ...(opts?.json ? { response_format: { type: 'json_object' } } : {}),
  });
  return response.choices[0].message.content || '';
}

// ─── Main service ──────────────────────────────────────────────────────────────
export const aiAgentService = {

  async processResponse(
    tenantId: string,
    customerPhone: string,
    messageText: string,
    context: any,
  ): Promise<string> {
    try {
      // 1. Get or create conversation ───────────────────────────────────────────
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

      // 2. Fetch message history (last 20 messages) ─────────────────────────────
      const { data: history } = await supabaseAdmin
        .from('messages')
        .select('direction, content')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const chatHistory = (history?.reverse() || []).map(msg => ({
        role: msg.direction === 'inbound' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // 3. Save inbound message ──────────────────────────────────────────────────
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversation.id,
        direction: 'inbound',
        content: messageText,
      });

      // 4. State detection — use CONVERSATION HISTORY as primary signal ──────────
      // This is more reliable than context because it doesn't depend on a
      // successful DB write between messages.
      const convCtx = (conversation.context as any) || {};
      const pendingBooking: BookingExtract | null = convCtx.pending_booking || null;
      const pendingCancellation: CancellationCtx | null = convCtx.pending_cancellation || null;

      // Detect state from last bot message in history (crash-resistant)
      const lastBotContent = [...chatHistory].reverse().find(m => m.role === 'assistant')?.content || '';
      const historyShowsAwaitingCancellation =
        lastBotContent.includes('quer cancelar') ||
        (lastBotContent.toLowerCase().includes('cancelar') && lastBotContent.includes('Confirma'));
      const historyShowsAwaitingBooking =
        lastBotContent.includes('Posso confirmar') || lastBotContent.includes('Confirma') && lastBotContent.includes('Agendamento');

      // Merge context flags with conversation history evidence
      const awaitingCancellation = convCtx.awaiting_cancellation === true || historyShowsAwaitingCancellation;
      const awaitingConfirmation = (convCtx.awaiting_confirmation === true || historyShowsAwaitingBooking) && !!pendingBooking;

      let aiResponse = '';
      let updatedCtx = { ...convCtx };

      // ── A0: Awaiting cancellation confirmation ─────────────────────────────────
      if (awaitingCancellation) {
        const isKeywordConfirmation = /^(sim|s|pode|pode ser|confirma|confirmar|ok|yes|claro|vai|vai sim|cancelar|pode cancelar|sim pode)/i.test(messageText.trim());
        const confirmed = isKeywordConfirmation || await this.checkConfirmation(messageText);

        if (confirmed) {
          // Re-fetch the appointment live (most reliable — avoids stale IDs in context)
          const appt = await this.findNextAppointmentByPhone(tenantId, customerPhone);
          const appointmentId = appt?.id || pendingCancellation?.appointment_id;

          if (appointmentId) {
            const success = await this.executeCancellation(appointmentId);
            if (success) {
              aiResponse = `Prontinho! Agendamento cancelado. Se quiser marcar outro dia, é só me falar 😊`;
            } else {
              aiResponse = 'Hmm, não consegui cancelar. Pode tentar de novo?';
            }
          } else {
            aiResponse = await this.generateResponse(
              context, chatHistory, messageText,
              'O cliente confirmou cancelamento mas não encontramos nenhum agendamento futuro para ele. Informe isso de forma amigável.',
            );
          }
          updatedCtx = { ...updatedCtx, awaiting_cancellation: false, pending_cancellation: null };

        } else {
          // Declined or changed mind
          aiResponse = await this.generateResponse(
            context, chatHistory, messageText,
            'O cliente desistiu de cancelar. Responda de forma simples e amigável.',
          );
          updatedCtx = { ...updatedCtx, awaiting_cancellation: false, pending_cancellation: null };
        }

        // ── A: Awaiting booking confirmation ────────────────────────────────────────
      } else if (awaitingConfirmation && pendingBooking) {
        const confirmed = await this.checkConfirmation(messageText);

        if (confirmed) {
          const success = await this.executeBooking(tenantId, pendingBooking, customerPhone);
          if (success) {
            const dateFormatted = pendingBooking.date
              ? new Date(pendingBooking.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
              : '';
            const firstName = pendingBooking.customer_name?.split(' ')[0] || '';
            aiResponse =
              `Agendado, ${firstName}! Te esperamos ${dateFormatted} às ${pendingBooking.time} para ${pendingBooking.service_name}. Qualquer coisa é só chamar 😊`;
          } else {
            aiResponse = 'Hmm, tive um probleminha técnico. Pode tentar de novo?';
          }
          updatedCtx = { ...updatedCtx, awaiting_confirmation: false, pending_booking: null };

        } else {
          updatedCtx = { ...updatedCtx, awaiting_confirmation: false, pending_booking: null };
          aiResponse = await this.generateResponse(
            context, chatHistory, messageText,
            'O cliente recusou ou quer alterar o agendamento. Pergunte o que ele gostaria de mudar.',
          );
        }

      } else {
        // ── B: Normal conversation — LLM drives ─────────────────────────────────
        aiResponse = await this.generateResponse(context, chatHistory, messageText);

        const allMessages = [
          ...chatHistory,
          { role: 'user', content: messageText },
          { role: 'assistant', content: aiResponse },
        ];

        // ── C1: Keyword-first cancellation detection (fast + reliable) ───────────
        const hasCancelKeyword = /cancelar|desmarcar|não vou|nao vou mais|desistir do agendamento/i.test(messageText);
        const cancelIntent = hasCancelKeyword || await this.detectCancellationIntent(messageText);

        if (cancelIntent) {
          const appt = await this.findNextAppointmentByPhone(tenantId, customerPhone);
          if (appt) {
            const dateFormatted = new Date(appt.start_time)
              .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
            const timeFormatted = new Date(appt.start_time)
              .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            aiResponse =
              `Você quer cancelar o agendamento de ${appt.service?.name || 'serviço'} na ${dateFormatted} às ${timeFormatted}? Confirma? (Sim / Não)`;
            updatedCtx = {
              ...updatedCtx,
              awaiting_cancellation: true,
              pending_cancellation: {
                appointment_id: appt.id,
                service_name: appt.service?.name || 'Serviço',
                date_formatted: dateFormatted,
                time: timeFormatted,
              },
            };
          } else {
            aiResponse = await this.generateResponse(
              context, allMessages.slice(0, -1), messageText,
              'O cliente quer cancelar mas não há agendamentos futuros para o número dele. Informe isso de forma amigável.',
            );
            updatedCtx = { ...updatedCtx, awaiting_cancellation: false, pending_cancellation: null };
          }

          // ── C2: Booking intent ───────────────────────────────────────────────────
        } else {
          const extract = await this.extractBookingData(allMessages, context.services || []);
          if (extract.complete && extract.hasIntent && extract.activeNow) {
            const available = await this.checkAvailability(tenantId, extract.date!, extract.time!);
            if (available) {
              const dateFormatted = extract.date
                ? new Date(extract.date + 'T12:00:00').toLocaleDateString('pt-BR')
                : '';
              aiResponse =
                `📋 *Confirmação do Agendamento:*\n\n` +
                `👤 ${extract.customer_name}\n` +
                `✂️ ${extract.service_name}\n` +
                `📅 ${dateFormatted} às ${extract.time}\n\n` +
                `Posso confirmar? (Sim / Não)`;
              updatedCtx = {
                ...updatedCtx,
                awaiting_confirmation: true,
                pending_booking: extract,
              };
            } else {
              aiResponse = await this.generateResponse(
                context, allMessages.slice(0, -1), messageText,
                `O horário das ${extract.time} em ${extract.date} está ocupado. Informe de forma amigável e sugira outro horário.`,
              );
            }
          }
        }
      }

      // 5. Persist context ───────────────────────────────────────────────────────
      await supabaseAdmin
        .from('conversations')
        .update({ context: updatedCtx })
        .eq('id', conversation.id);

      // 6. Save outbound message ─────────────────────────────────────────────────
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversation.id,
        direction: 'outbound',
        content: aiResponse,
      });

      return aiResponse;

    } catch (error) {
      console.error('Erro no processamento da IA:', error);
      return 'Me dá um segundo, tive um problema técnico aqui. Pode repetir?';
    }
  },

  // ─── Generate a natural response using the full conversation history ──────────
  generateResponse: async (
    context: any,
    history: any[],
    latestMessage: string,
    extraInstruction: string = '',
  ): Promise<string> => {
    const dayMap: Record<string, string> = {
      mon: 'Segunda', tue: 'Terça', wed: 'Quarta',
      thu: 'Quinta', fri: 'Sexta', sat: 'Sábado', sun: 'Domingo',
    };
    const openDays = (context.workingDays || []).map((d: string) => dayMap[d] || d).join(', ');
    const serviceList = (context.services || [])
      .map((s: any) => `${s.name} — R$ ${s.price}`)
      .join(', ');

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const today = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    const personality = context.personality || 'amigável e descontraído';
    const businessName = context.businessName || 'o salão';

    const systemPrompt = `Você é a atendente do(a) "${businessName}".
Sua personalidade é: ${personality}.
Hoje é ${today}. Cumprimento-padrão para primeiro contato: "${greeting}!"

INFORMAÇÕES DO NEGÓCIO:
- Endereço: ${context.location || 'não informado'}
- Dias de atendimento: ${openDays || 'não informado'}
- Horário: ${context.workingHours?.start || '08:00'} às ${context.workingHours?.end || '18:00'}
- Serviços: ${serviceList || 'sem cadastro'}

REGRAS ABSOLUTAS (nunca quebre essas regras):
1. NUNCA comece com "Ótimo!", "Perfeito!", "Claro!" ou qualquer outro elogio vazio. Varie os começos.
2. NUNCA liste serviços em forma de lista a menos que o cliente peça especificamente. Mencione-os de forma casual.
3. NUNCA pergunte informações que já foram dadas na conversa. Leia o histórico ANTES de responder.
4. Respostas curtas: máximo 3 frases, exceto quando precisar listar algo pedido.
5. Não use estruturas de lista (hífen, números) para informações simples. Escreva em texto corrido.
6. NUNCA diga que é uma IA, bot, ou atendente virtual. Aja como atendente humana.
7. Use linguagem casual e warmth: "é só me falar", "pode deixar", "com certeza", "que bom!"
8. Se o cliente já disse o nome, use-o naturalmente na resposta.
9. Quando o cliente quiser agendar, colete SO AS INFORMAÇÕES QUE AINDA FALTAM — uma de cada vez, de forma natural.
10. Emojis: apenas 1 por mensagem, e apenas quando genuinamente relevante. Não abuse.

EXEMPLOS DE TOM CERTO:
- "Que bom! Temos horário livre na quinta, te serve?"
- "Pode ser sim! Me conta qual serviço você quer fazer."
- "Âs 14h está ótimo. Fica para confirmar?"

EXEMPLOS DE TOM ERRADO (nunca faça isso):
- "Ótimo! Vou precisar das seguintes informações: 1) Nome 2) Serviço 3) Data..."
- "Com prazer! Poderia me informar qual o nome completo?"
- "Perfeito! Nossos serviços são: \n• Corte...\n• Tintura..."
${extraInstruction ? `\nINSTRUÇÃO IMPORTANTE: ${extraInstruction}` : ''}`;

    try {
      return await callAI([
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: latestMessage },
      ], { temp: 0.7 });
    } catch {
      return 'Me dá um segundo, tive um problema técnico aqui. Pode repetir?';
    }
  },

  // ─── Extract structured booking data from conversation ────────────────────────
  // Checks the FULL history for data, but only marks activeNow=true if booking
  // intent appears in the LAST 4 messages (so mid-conversation questions don't interrupt).
  extractBookingData: async (
    conversationMessages: any[],
    services: any[],
  ): Promise<BookingExtract> => {
    const today = new Date().toISOString().split('T')[0];
    const serviceNames = services.map((s: any) => s.name).join(', ');

    // Full conversation for data extraction
    const fullText = conversationMessages
      .map(m => `${m.role === 'user' ? 'Cliente' : 'Agente'}: ${m.content}`)
      .join('\n');

    // Only the most recent 4 messages to check active intent
    const recentMessages = conversationMessages.slice(-4);
    const recentText = recentMessages
      .map(m => `${m.role === 'user' ? 'Cliente' : 'Agente'}: ${m.content}`)
      .join('\n');

    const prompt = `Você é um extrator de dados de agendamento.
Hoje é ${today}. Serviços: ${serviceNames || 'não especificado'}.

CONVERSA COMPLETA (para extração de dados):
${fullText}

MENSAGENS RECENTES (para verificar intenção ativa):
${recentText}

Retorne JSON:
{
  "hasIntent": true/false,
  "activeNow": true/false,  // TRUE somente se nas MENSAGENS RECENTES o cliente está ATIVAMENTE tentando agendar (pedindo data, horário, ou confirmando serviço). FALSE se o cliente está fazendo outra pergunta qualquer.
  "customer_name": "nome ou null",
  "service_name": "nome do serviço ou null",
  "date": "YYYY-MM-DD ou null",
  "time": "HH:MM ou null",
  "complete": true/false  // true SOMENTE se hasIntent=true, activeNow=true E todos os 4 campos não forem nulos
}`;

    try {
      const raw = await callAI([{ role: 'user', content: prompt }], { json: true, temp: 0 });
      const parsed = JSON.parse(raw);
      return parsed as BookingExtract;
    } catch {
      return { hasIntent: false, activeNow: false, customer_name: null, service_name: null, date: null, time: null, complete: false };
    }
  },

  // ─── Check for conflicting appointments ───────────────────────────────────────
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
      return true;
    }
  },

  // ─── Check if message is a confirmation ───────────────────────────────────────
  checkConfirmation: async (message: string): Promise<boolean> => {
    try {
      const result = await callAI([{
        role: 'user',
        content: `A mensagem "${message}" é uma confirmação positiva (sim, ok, pode, confirmar, s, yes)? Responda apenas "true" ou "false".`
      }], { temp: 0 });
      return result.toLowerCase().includes('true');
    } catch {
      return false;
    }
  },

  // ─── Detect cancellation intent in a message ────────────────────────────────
  detectCancellationIntent: async (message: string): Promise<boolean> => {
    try {
      const result = await callAI([{
        role: 'user',
        content: `A mensagem "${message}" expressa intenção de CANCELAR um agendamento existente (cancelar, desmarcar, remover, não vou mais, etc.)? Responda apenas "true" ou "false".`
      }], { temp: 0 });
      return result.toLowerCase().includes('true');
    } catch {
      return false;
    }
  },

  // ─── Find the next upcoming appointment for a phone number ───────────────────
  findNextAppointmentByPhone: async (tenantId: string, phone: string): Promise<any | null> => {
    try {
      const cleanPhone = phone.replace(/@s\.whatsapp\.net|@g\.us/g, '').replace(/\D+$/, '');
      const now = new Date().toISOString();
      // Search by clean number OR full JID (for backward compatibility)
      const { data } = await supabaseAdmin
        .from('appointments')
        .select('id, start_time, service:services(name)')
        .eq('tenant_id', tenantId)
        .or(`customer_phone.eq.${cleanPhone},customer_phone.eq.${phone}`)
        .eq('status', 'scheduled')
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(1);
      return data?.[0] || null;
    } catch {
      return null;
    }
  },

  // ─── Mark appointment as cancelled in Supabase ───────────────────────────────
  executeCancellation: async (appointmentId: string): Promise<boolean> => {
    try {
      if (!appointmentId) throw new Error('appointmentId is required');
      // Use .select('id') so we can verify the row was actually updated
      const { data, error } = await supabaseAdmin
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .select('id');
      if (error) throw error;
      if (!data || data.length === 0) throw new Error(`No rows updated for id=${appointmentId}`);
      console.log(`[cancel] ✅ Appointment ${appointmentId} cancelled`);
      return true;
    } catch (err) {
      console.error('[cancel] ❌ Error cancelling appointment:', err);
      return false;
    }
  },

  // ─── Create appointment in Supabase ───────────────────────────────────────────
  executeBooking: async (tenantId: string, booking: BookingExtract, customerPhone: string): Promise<boolean> => {
    try {
      // Strip WhatsApp JID suffix — store clean phone number only
      const cleanPhone = customerPhone.replace(/@s\.whatsapp\.net|@g\.us/g, '').replace(/\D+$/, '');

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
          customer_name: booking.customer_name || `WhatsApp: ${cleanPhone}`,
          customer_phone: cleanPhone,
          start_time: startTime,
          end_time: endTime,
          status: 'scheduled',
          notes: `Agendado via WhatsApp. Serviço: ${booking.service_name}`,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error executing booking:', error);
      return false;
    }
  },
};
