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

      // 4. Read conversation context ─────────────────────────────────────────────
      const convCtx = (conversation.context as any) || {};
      const awaitingConfirmation: boolean = convCtx.awaiting_confirmation === true;
      const pendingBooking: BookingExtract | null = convCtx.pending_booking || null;

      let aiResponse = '';
      let updatedCtx = { ...convCtx };

      // ── A: In confirmation stage ──────────────────────────────────────────────
      if (awaitingConfirmation && pendingBooking) {
        const confirmed = await this.checkConfirmation(messageText);

        if (confirmed) {
          const success = await this.executeBooking(tenantId, pendingBooking, customerPhone);
          if (success) {
            const dateFormatted = pendingBooking.date
              ? new Date(pendingBooking.date + 'T12:00:00').toLocaleDateString('pt-BR')
              : '';
            aiResponse =
              `✅ Agendamento confirmado, ${pendingBooking.customer_name}!\n\n` +
              `✂️ *${pendingBooking.service_name}*\n` +
              `📅 ${dateFormatted} às ${pendingBooking.time}\n\n` +
              `Te esperamos! 😊`;
          } else {
            aiResponse = 'Houve um problema técnico ao salvar. Pode tentar novamente?';
          }
          updatedCtx = { ...updatedCtx, awaiting_confirmation: false, pending_booking: null };

        } else {
          // Client said no or wants to change something — let LLM handle naturally
          updatedCtx = { ...updatedCtx, awaiting_confirmation: false, pending_booking: null };
          aiResponse = await this.generateResponse(
            context,
            chatHistory,
            messageText,
            'O cliente recusou ou quer alterar o agendamento. Pergunte o que ele gostaria de mudar ou se prefere cancelar.',
          );
        }

      } else {
        // ── B: Normal conversation — LLM drives ────────────────────────────────
        aiResponse = await this.generateResponse(context, chatHistory, messageText);

        // ── C: Try to extract booking data from the FULL conversation ──────────
        // (Runs after LLM response, no extra roundtrip for the user)
        const allMessages = [
          ...chatHistory,
          { role: 'user', content: messageText },
          { role: 'assistant', content: aiResponse },
        ];
        const extract = await this.extractBookingData(allMessages, context.services || []);

        if (extract.complete && extract.hasIntent && extract.activeNow) {
          // Check availability
          const available = await this.checkAvailability(tenantId, extract.date!, extract.time!);
          if (available) {
            // Overwrite response with confirmation summary
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
            // Slot is taken — ask for another time
            aiResponse = await this.generateResponse(
              context,
              allMessages.slice(0, -1),
              messageText,
              `O horário das ${extract.time} em ${extract.date} está ocupado. Informe isso de forma amigável e sugira que o cliente escolha outro horário.`,
            );
          }
        }
      }

      // 5. Persist context ────────────────────────────────────────────────────────
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
      return 'Desculpe, tive um problema técnico. Pode repetir?';
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
      .map((s: any) => `• ${s.name} — R$ ${s.price} (${s.duration} min)`)
      .join('\n');

    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const systemPrompt = `Você é o atendente virtual do(a) "${context.businessName}".
Personalidade: ${context.personality || 'amigável e profissional'}.
Data de hoje: ${today}.

INFORMAÇÕES DO NEGÓCIO:
- Endereço: ${context.location || 'não informado'}
- Dias de atendimento: ${openDays || 'não informado'}
- Horário: ${context.workingHours?.start || '08:00'} às ${context.workingHours?.end || '18:00'}
- Serviços:
${serviceList || '  (nenhum serviço cadastrado)'}

COMO SE COMPORTAR:
- Converse de forma NATURAL, como um atendente real de salão.
- Use o histórico da conversa. NUNCA repita perguntas que já foram respondidas.
- Se o cliente já disse o nome em algum momento, use-o.
- Quando o cliente quiser agendar, colete naturalmente as informações que AINDA FALTAM: nome, serviço, data e horário.
- Não liste serviços a menos que o cliente pergunte ou seja necessário para o agendamento.
- Respostas curtas (1-4 frases). Sem listas desnecessárias.
${extraInstruction ? `\nINSTRUÇÃO ESPECIAL: ${extraInstruction}` : ''}`;

    try {
      return await callAI([
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: latestMessage },
      ], { temp: 0.4 });
    } catch {
      return 'Desculpe, tive um problema técnico. Pode repetir?';
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

  // ─── Create appointment in Supabase ───────────────────────────────────────────
  executeBooking: async (tenantId: string, booking: BookingExtract, customerPhone: string): Promise<boolean> => {
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
