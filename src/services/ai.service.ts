import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

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
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: opts?.temp ?? 0.3,
    ...(opts?.json ? { response_format: { type: 'json_object' } } : {}),
  });
  return response.choices[0].message.content || '';
}

async function callDeepSeek(messages: any[], opts?: { json?: boolean; temp?: number }): Promise<string> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.warn('[deepseek] API key not found, falling back to GPT-4o for notification formatting');
      return callAI(messages, opts);
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: opts?.temp ?? 0.7,
      })
    });

    const data = await response.json();
    return data.choices[0].message.content || '';
  } catch (error) {
    console.error('[deepseek] Error calling DeepSeek:', error);
    return callAI(messages, opts);
  }
}

// ─── Audio transcription ───────────────────────────────────────────────────────
async function transcribeAudio(audioBuffer: Buffer, mimeType: string = 'audio/ogg'): Promise<string> {
  try {
    // Map common MIME types to file extensions
    const extMap: Record<string, string> = {
      'audio/ogg': 'ogg',
      'audio/ogg; codecs=opus': 'ogg',
      'audio/mpeg': 'mp3',
      'audio/mp4': 'mp4',
      'audio/wav': 'wav',
      'audio/webm': 'webm',
    };
    const ext = extMap[mimeType] || 'ogg';

    // Create a File-like object from the buffer for the OpenAI SDK
    const uint8 = new Uint8Array(audioBuffer);
    const file = new File([uint8], `audio.${ext}`, { type: mimeType });

    const transcription = await getOpenAI().audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'pt',
    });

    console.log(`[audio] Transcribed ${audioBuffer.length} bytes → "${transcription.text.substring(0, 80)}..."`);
    return transcription.text;
  } catch (error) {
    console.error('[audio] Transcription failed:', error);
    return '';
  }
}

// ─── Main service ──────────────────────────────────────────────────────────────
export const aiAgentService = {

  /**
   * Transcribe an audio buffer to text using OpenAI Whisper.
   * Exposed so the webhook can call it before processResponse.
   */
  transcribeAudio,

  async processResponse(
    tenantId: string,
    customerPhone: string,
    messageText: string,
    context: any,
  ): Promise<string> {
    try {
      // 0. Guard — only respond if the tenant has at least one service registered ─
      const { count: serviceCount } = await supabaseAdmin
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      if (!serviceCount || serviceCount === 0) {
        console.log(`[ai] Tenant ${tenantId} has no services — skipping response.`);
        return '';
      }

      // 1. Get or create conversation ───────────────────────────────────────────
      let { data: conversation } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('customer_phone', customerPhone)
        .single();

      const updateData: any = {
        last_message_at: new Date().toISOString()
      };

      if (context.customerName) updateData.customer_name = context.customerName;
      if (context.customerPicture) updateData.customer_picture = context.customerPicture;

      if (!conversation) {
        const { data: newConv } = await supabaseAdmin
          .from('conversations')
          .insert({
            tenant_id: tenantId,
            customer_phone: customerPhone,
            ...updateData
          })
          .select()
          .single();
        conversation = newConv;
      } else {
        // Update existing conversation with latest name/picture/time
        await supabaseAdmin
          .from('conversations')
          .update(updateData)
          .eq('id', conversation.id);
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
        lastBotContent.includes('Você quer cancelar') ||
        lastBotContent.includes('quer cancelar o agendamento') ||
        (lastBotContent.toLowerCase().includes('cancelar') && lastBotContent.toLowerCase().includes('confirma'));
      const historyShowsAwaitingBooking =
        lastBotContent.includes('Posso confirmar') ||
        lastBotContent.includes('posso agendar') ||
        (lastBotContent.includes('Confirma') && lastBotContent.includes('Agendamento')) ||
        (lastBotContent.toLowerCase().includes('certo?') && lastBotContent.toLowerCase().includes('posso'));

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
            const success = await this.executeCancellation(appointmentId, tenantId);
            if (success) {
              aiResponse = `Prontinho! Agendamento cancelado. Se quiser marcar outro dia, é só me falar 😊`;
            } else {
              aiResponse = 'Hmm, não consegui cancelar. Pode tentar de novo?';
            }
          } else {
            aiResponse = await this.generateResponse(
              context, chatHistory, messageText,
              'O cliente confirmou cancelamento mas não encontramos nenhum agendamento futuro para ele no banco de dados. Informe isso de forma amigável e NÃO finja que cancelou.',
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
        const isKeywordConfirmation = /^(sim|s|pode|pode ser|pode sim|confirma|confirmar|ok|yes|claro|vai|vai sim|bora|isso|sss|ss|siim|simm|pode agendar|agenda|marca|marcar|agendar|por favor)/i.test(messageText.trim());
        const confirmed = isKeywordConfirmation || await this.checkConfirmation(messageText);

        if (confirmed) {
          console.log(`[booking] Confirmed! Executing booking for tenant ${tenantId}:`, pendingBooking);
          const bookingResult = await this.executeBooking(tenantId, pendingBooking, customerPhone, context.instanceName);
          if (bookingResult) {
            const dateFormatted = pendingBooking.date
              ? new Date(pendingBooking.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
              : '';
            const firstName = pendingBooking.customer_name?.split(' ')[0] || '';
            aiResponse = `agendado ${firstName}! te espero ${dateFormatted} às ${pendingBooking.time} pra ${pendingBooking.service_name} 😊`;
            updatedCtx = {
              ...updatedCtx,
              awaiting_confirmation: false,
              pending_booking: null,
            };
          } else {
            aiResponse = 'hmm deu um probleminha aqui, tenta de novo?';
            updatedCtx = { ...updatedCtx, awaiting_confirmation: false, pending_booking: null };
          }

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
        // BR-PT: cover every natural way someone says "I want to cancel"
        const hasCancelKeyword = /cancelar|desmarcar|desmarque|cancela|cancele|nao vou mais|não vou mais|nao vou comparecer|não vou comparecer|desistir do agendamento|remover meu agendamento|remove meu agendamento|me tira do horario|me tira do horário|tirar meu horario|tirar meu horário|quero desmarcar|quero cancelar|pode cancelar|pode desmarcar|muda meu horario|muda meu horário|desmarca|desmarcamento/i.test(messageText);
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
              'O cliente quer cancelar mas não há agendamentos futuros para o número dele no sistema. Informe isso de forma amigável e explique que não encontrou agendamentos. Se ele insistir, diga que pode ter havido um erro e NÃO finja que cancelou.',
            );
            updatedCtx = { ...updatedCtx, awaiting_cancellation: false, pending_cancellation: null };
          }

          // ── C2: Booking intent ───────────────────────────────────────────────────
        } else {
          const extract = await this.extractBookingData(allMessages, context.services || []);
          console.log(`[booking] Extract result:`, JSON.stringify(extract));
          if (extract.complete && extract.hasIntent && extract.activeNow) {
            const available = await this.checkAvailability(tenantId, extract.date!, extract.time!);
            console.log(`[booking] Availability for ${extract.date} ${extract.time}: ${available}`);
            if (available) {
              const dateObj = new Date(extract.date + 'T12:00:00');
              const dateFormatted = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

              const firstName = extract.customer_name?.split(' ')[0] || '';
              // OVERRIDE the AI response with a proper confirmation prompt
              aiResponse = `${firstName}, deixa eu confirmar: ${extract.service_name} ${dateFormatted} às ${extract.time}, certo? posso agendar?`;
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
          } else if (extract.hasIntent && extract.activeNow && !extract.complete) {
            // Booking is in progress but incomplete.
            // Check if the LLM response already confirms/schedules (phantom booking).
            // If so, replace with a proper follow-up question.
            const phantomBooking = /te vejo|te espero|está agendado|agendado!|confirmado!|tá marcado|tá agendado|reservado/i.test(aiResponse);
            if (phantomBooking) {
              const missing = [];
              if (!extract.customer_name) missing.push('nome');
              if (!extract.service_name) missing.push('serviço');
              if (!extract.date) missing.push('data');
              if (!extract.time) missing.push('horário');
              console.log(`[booking] ⚠️ Phantom booking detected! Missing: ${missing.join(', ')}. Overriding AI response.`);
              aiResponse = await this.generateResponse(
                context, allMessages.slice(0, -1), messageText,
                `O cliente está querendo agendar mas ainda faltam dados: ${missing.join(', ')}. Pergunte o que falta de forma natural, UMA coisa por vez. NÃO confirme nenhum agendamento.`,
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

    // Use Brazil/Sao Paulo timezone for greetings as it's the primary market
    const nowBR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const hour = nowBR.getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const today = nowBR.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    const personality = context.personality || 'amigável e descontraído';
    const businessName = context.businessName || 'o salão';

    const systemPrompt = `Você é o atendente virtual do(a) "${businessName}". Seu nome é a identidade do salão — você NÃO é um robô genérico, mas sim o assistente especializado deste estabelecimento.

Sua personalidade: ${personality}.
Hoje é ${today}. Saudação: "${greeting}".

INSTRUÇÃO DE SAUDAÇÃO (MUITO IMPORTANTE):
Sempre que iniciar uma conversa ou for a primeira interação do dia, você DEVE se identificar da seguinte forma: "Olá! Sou o atendente virtual do salão ${businessName}. Como posso te ajudar hoje?" (adapte levemente a saudação para ser natural, mas mantenha a identificação).

INFORMAÇÕES DO NEGÓCIO:
- Endereço: ${context.location || 'não informado'}
- Dias de atendimento: ${openDays || 'não informado'}
- Horário: ${context.workingHours?.start || '08:00'} às ${context.workingHours?.end || '18:00'}
- Serviços e preços: ${serviceList || 'sem cadastro'}

COMO VOCÊ SE COMPORTA (isso é sua essência):
- Você escreve EXATAMENTE como uma pessoa normal no WhatsApp: abreviações, tom informal, sem formalidades
- Use "vc", "tá", "pra", "tbm", "dps", "blz" naturalmente
- Às vezes comece com letras minúsculas, como gente real faz
- Seja calorosa e simpática mas sem exagero — como uma colega de trabalho legal
- Use no máximo 1-2 frases por mensagem. Ninguém manda textão no WhatsApp
- Pode usar emoji com moderação (1-2 por mensagem no máximo), de forma natural

FLUXO DE AGENDAMENTO (siga esta ordem naturalmente):
1. Quando o cliente quer agendar, PRIMEIRO pergunte o nome dele de forma natural: "qual seu nome?" ou "como é seu nome?"
2. Depois pergunte qual serviço quer
3. Depois pergunte que dia seria bom
4. Depois pergunte o horário
5. Confirme tudo antes de finalizar. NUNCA diga que agendou ANTES de eu (o sistema) confirmar que o horário está disponível e você ter perguntado "posso agendar?".
- NUNCA pule etapas. Pergunte UMA coisa por vez, como humano faz
- Se o cliente já disse alguma info (nome, serviço), não pergunte de novo

REGRAS QUE NÃO PODEM SER QUEBRADAS:
1. Pergunta informativa (preço, horário, endereço) = responda APENAS o que foi perguntado. Não sugira agendamento
2. NUNCA revele que é IA/bot/sistema. Se perguntarem, você É a recepcionista do salão
3. Leia TODO o histórico antes de responder. Não repita perguntas já respondidas
4. Se já sabe o nome do cliente, use naturalmente: "tá bom Maria", "beleza João"
5. NUNCA comece com "Ótimo!", "Perfeito!", "Claro!" — gente real não fala assim toda hora
6. Quando não souber algo, diga naturalmente: "vou confirmar e te falo", "deixa eu ver aqui"
7. ESCOPO: Você fala APENAS sobre o salão, serviços, preços, horários e agendamentos. Se o cliente perguntar qualquer coisa fora disso (ex: matemática, política, fatos gerais, piadas), recuse educadamente dizendo que você está aqui apenas para ajudar com o salão.
8. ALUCINAÇÃO PROIBIDA: Você não tem acesso direto ao banco de dados para criar/deletar. Eu (o sistema) gerencio isso. Portanto, NUNCA diga que "agendou", "cancelou" ou "desmarcou" a menos que eu tenha fornecido uma INSTRUÇÃO EXTRA dizendo que foi confirmado. Se constar que não há agendamento e o cliente insistir, seja firme e diga que não encontrou nada no sistema.

EXEMPLOS DE COMO RESPONDER:
Cliente: "oi" → "${greeting}! tudo bem? 😊 Sou o atendente virtual do ${businessName}, como posso te ajudar hoje?"
Cliente: "quanto custa corte?" → "o corte tá R$ 40"  
Cliente: "vcs atendem sabado?" → "atendemos sim, das ${context.workingHours?.start || '08:00'} às ${context.workingHours?.end || '18:00'}"
Cliente: "quero marcar um horário" → "bora! qual seu nome?"
Cliente: "Ana" → "oi Ana! que serviço vc quer fazer?"
Cliente: "chapinha" → "beleza! qual dia fica bom pra vc?"
Cliente: "amanhã" → "de manhã ou de tarde?"
Cliente: "14h" → (confirma o agendamento)
Cliente: "quanto é 1+1?" → "vish, sou ruim de conta kkkk tô aqui mais pra te ajudar com os horários do salão, quer marcar algo?"
${extraInstruction ? `\nINSTRUÇÃO EXTRA: ${extraInstruction}` : ''}`;

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

    // Only the most recent 8 messages to check active intent (covers step-by-step booking flow)
    const recentMessages = conversationMessages.slice(-8);
    const recentText = recentMessages
      .map(m => `${m.role === 'user' ? 'Cliente' : 'Agente'}: ${m.content}`)
      .join('\n');

    const prompt = `Você é um extrator de dados de agendamento. Retorne SOMENTE o JSON, sem texto extra.
Hoje é ${today}. Serviços disponíveis: ${serviceNames || 'não especificado'}.

CONVERSA COMPLETA:
${fullText}

MENSAGENS RECENTES (últimas 8):
${recentText}

REGRAS:
- "hasIntent": true se em QUALQUER momento da conversa o cliente expressou intenção de agendar (ex: "quero marcar", "quero agendar", "reservar", "me marca", "agenda pra mim", "quero um horário"). Perguntas APENAS sobre preço sem intenção de agendar = false.
- "activeNow": true se o FLUXO DE AGENDAMENTO está em andamento. Isso inclui:
  * O cliente pediu pra agendar E o agente está perguntando nome/serviço/dia/horário
  * O cliente está RESPONDENDO perguntas do agente sobre o agendamento (ex: dando o nome, escolhendo serviço, dizendo o dia/horário)
  * O cliente acabou de fornecer a última informação que faltava
  activeNow = false SOMENTE se a conversa mudou de assunto ou se o cliente APENAS fez pergunta informativa sem querer agendar.
- "customer_name": nome do cliente mencionado na conversa ou null
- "service_name": serviço pedido ou null (deve corresponder a um dos serviços disponíveis)
- "date": YYYY-MM-DD ou null (interprete "amanhã", "sexta", etc. com base na data de hoje)
- "time": HH:MM ou null
- "complete": true SOMENTE se hasIntent=true AND activeNow=true AND customer_name, service_name, date E time não são null

EXEMPLOS:
Pergunta "Quanto custa chapinha?" → {"hasIntent":false,"activeNow":false,"complete":false,"customer_name":null,"service_name":null,"date":null,"time":null}
Conversa onde agendamento já começou e cliente responde "14h" → {"hasIntent":true,"activeNow":true,...}
Pedido "Quero marcar chapinha amanhã 10h sou João" → {"hasIntent":true,"activeNow":true,"complete":true,"customer_name":"João","service_name":"chapinha","date":"YYYY-MM-DD","time":"10:00"}`;

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
      // Brazil Timezone Offset (UTC-3)
      const startTime = `${date}T${time}:00-03:00`;
      const startDateTime = new Date(startTime);
      // Assume 1h duration for availability check if service is unknown
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

      const { count } = await supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .neq('status', 'cancelled')
        .lt('start_time', endDateTime.toISOString())
        .gt('end_time', startDateTime.toISOString());

      return (count ?? 0) === 0;
    } catch (error) {
      console.error('[availability] Error:', error);
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
  // Tries multiple phone formats to maximise match chances:
  // - raw JID (55119999@s.whatsapp.net), clean (55119999), without country code (119999)
  findNextAppointmentByPhone: async (tenantId: string, phone: string): Promise<any | null> => {
    try {
      const jid = phone.trim();
      // Strip @s.whatsapp.net / @g.us suffix
      const withCountry = jid.replace(/@s\.whatsapp\.net|@g\.us/gi, '').replace(/\D/g, '');
      // Also try without Brazilian country code (55)
      const withoutCountry = withCountry.startsWith('55') ? withCountry.slice(2) : withCountry;
      const phoneCandidates = [...new Set([jid, withCountry, withoutCountry])];

      const now = new Date().toISOString();

      for (const candidate of phoneCandidates) {
        const { data } = await supabaseAdmin
          .from('appointments')
          .select('id, start_time, service:services(name)')
          .eq('tenant_id', tenantId)
          .eq('customer_phone', candidate)
          .eq('status', 'scheduled')
          .gte('start_time', now)
          .order('start_time', { ascending: true })
          .limit(1);
        if (data && data.length > 0) return data[0];
      }
      return null;
    } catch {
      return null;
    }
  },

  // ─── Mark appointment as cancelled in Supabase ───────────────────────────────
  // tenantId guard ensures cross-tenant cancellation is impossible
  executeCancellation: async (appointmentId: string, tenantId?: string): Promise<boolean> => {
    try {
      if (!appointmentId) throw new Error('appointmentId is required');
      let query = supabaseAdmin
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);
      // Always scope to tenant when provided (security)
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query.select('id');
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
  executeBooking: async (tenantId: string, booking: BookingExtract, customerPhone: string, instanceName?: string): Promise<{ appointmentId: string; price: number } | null> => {
    try {
      // Strip WhatsApp JID suffix — store clean phone number only
      const cleanPhone = customerPhone.replace(/@s\.whatsapp\.net|@g\.us/g, '').replace(/\D+$/, '');

      console.log(`[booking] Looking for service "${booking.service_name}" in tenant ${tenantId}`);
      // Sanitize service name to prevent SQL wildcard injection
      const safeName = (booking.service_name || '').replace(/[%_\\]/g, '');
      const { data: service, error: serviceError } = await supabaseAdmin
        .from('services')
        .select('id, duration, price')
        .eq('tenant_id', tenantId)
        .ilike('name', `%${safeName}%`)
        .limit(1)
        .single();

      if (serviceError) {
        console.log(`[booking] Service lookup warning:`, serviceError.message);
      }
      console.log(`[booking] Service found:`, service ? `${service.id} (duration: ${service.duration})` : 'none (using defaults)');

      // Timezone Handling: All times are treated as Brazil/Sao Paulo (UTC-3)
      const startTime = `${booking.date}T${booking.time}:00-03:00`;
      const startDateTime = new Date(startTime);
      const duration = service?.duration || 60;
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

      const insertData = {
        tenant_id: tenantId,
        service_id: service?.id || null,
        customer_name: booking.customer_name || `WhatsApp: ${cleanPhone}`,
        customer_phone: cleanPhone,
        start_time: startDateTime.toISOString(), // Standard UTC in DB
        end_time: endDateTime.toISOString(),     // Standard UTC in DB
        status: 'scheduled',
        notes: `Agendado via WhatsApp. Serviço: ${booking.service_name}`,
      };
      console.log(`[booking] Inserting appointment:`, JSON.stringify(insertData));

      const { data: appointment, error } = await supabaseAdmin
        .from('appointments')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        await supabaseAdmin.from('agent_logs').insert({
          tenant_id: tenantId,
          event_type: 'booking_insert_error',
          description: `Erro ao inserir no banco: ${error.message}`,
          metadata: { insertData, error }
        });
        throw error;
      }

      console.log(`[booking] ✅ Appointment created successfully!`);
      await supabaseAdmin.from('agent_logs').insert({
        tenant_id: tenantId,
        event_type: 'appointment_created',
        description: `Agendamento criado: ${insertData.customer_name} - ${booking.service_name}`,
        metadata: { appointmentId: appointment?.id, customerPhone }
      });

      // ─── Trigger dynamic notification to owner ───────────────────────────────
      if (instanceName) {
        aiAgentService.notifyOwnerOfBooking(tenantId, instanceName, {
          customer_name: insertData.customer_name || 'Cliente',
          service_name: booking.service_name || 'Serviço',
          date: booking.date || '',
          time: booking.time || '',
          price: service?.price || 0
        }).catch(err => console.error('[booking] Error notifying owner:', err));
      }

      return { appointmentId: appointment?.id, price: service?.price || 0 };
    } catch (error: any) {
      console.error('[booking] ❌ Error executing booking:', error);
      await supabaseAdmin.from('agent_logs').insert({
        tenant_id: tenantId,
        event_type: 'booking_execution_fatal',
        description: `Erro fatal no executeBooking: ${error.message}`,
        metadata: { error: error.message, stack: error.stack, booking }
      });
      return null;
    }
  },

  notifyOwnerOfBooking: async (tenantId: string, instanceName: string, data: any) => {
    try {
      // 1. Get the instance owner's number (the "me" number)
      const evolutionUrl = process.env.EVOLUTION_API_URL;
      const evolutionKey = process.env.EVOLUTION_API_KEY;

      const res = await fetch(`${evolutionUrl}/instance/connectionState/${instanceName}`, {
        headers: { 'apikey': evolutionKey! }
      });
      const state = await res.json();
      const ownerNumber = state?.instance?.owner?.replace(/\D/g, '');

      if (!ownerNumber) {
        console.warn(`[notify] Could not find owner number for instance ${instanceName}`);
        return;
      }

      // 2. Format message with DeepSeek
      const prompt = `Formate uma notificação curta e animada para o dono de um salão de beleza sobre um novo agendamento. Seja direto e use emojis.
DADOS:
- Cliente: ${data.customer_name}
- Serviço: ${data.service_name}
- Data: ${data.date}
- Horário: ${data.time}
- Valor: R$ ${data.price}

Exemplo: "Ei! 🎉 Novo agendamento: Maria Silva marcou Corte para amanhã às 14h. R$ 50."`;

      const humanizedMessage = await callDeepSeek([{ role: 'user', content: prompt }]);

      // 3. Send message
      const { whatsappService } = await import('./whatsapp.service');
      await whatsappService.sendMessage(instanceName, ownerNumber, humanizedMessage);
      console.log(`[notify] Owner notified at ${ownerNumber}`);

    } catch (error) {
      console.error('[notify] Error in owner notification:', error);
    }
  }
};
