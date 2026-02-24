import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export const aiAgentService = {
  processMessage: async (message: string, context: any): Promise<string> => {
    console.log('[AI] Processing message with context services count:', context.services?.length);
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
        ${context.services.length > 0 ? context.services.map((s: any) => `- ${s.name}: R$ ${s.price} (${s.duration} min)`).join('\n        ') : "Nenhum serviço cadastrado."}

      DIRETRIZES DE CONVERSA (MUITO IMPORTANTE):
      1. NÃO envie todas as informações acima de uma vez. Responda apenas o que foi perguntado.
      2. Se o cliente apenas cumprimentar (ex: "Oi", "Bom dia"), responda com uma saudação amigável e pergunte como pode ajudar, sem listar serviços ou endereços ainda.
      3. Seja profissional mas amigável. Use a personalidade indicada.
      4. Mantenha as respostas concisas (máximo 2 a 3 frases).
      5. Somente liste os serviços se o cliente solicitar ou se for relevante para o fluxo de agendamento.
    `;

    // Log the prompt for debugging
    await supabaseAdmin.from('agent_logs').insert({
      event_type: 'debug_ai_prompt',
      description: 'System Prompt sent to AI',
      metadata: { systemPrompt: systemPrompt.substring(0, 1000) }
    });

    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...context.history,
          { role: 'user', content: message }
        ],
        temperature: 0.1,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error('Error processing AI message:', error);
      return "Desculpe, estou com uma instabilidade técnica momentânea. Pode repetir por favor?";
    }
  },

  async processResponse(tenantId: string, customerPhone: string, messageText: string, context: any): Promise<string> {
    console.log('[AI] Starting processResponse for tenant:', tenantId);
    console.log('[AI] Context services count:', context.services?.length);

    // Log context in DB for visibility
    await supabaseAdmin.from('agent_logs').insert({
      tenant_id: tenantId,
      event_type: 'debug_ai_context',
      description: `Iniciando processamento. Serviços recebidos: ${context.services?.length || 0}`,
      metadata: { services: context.services }
    });

    try {
      // 1. Get or Create Conversation
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

      // 2. Fetch recent message history for context
      const { data: history } = await supabaseAdmin
        .from('messages')
        .select('direction, content')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const formattedHistory = history?.reverse().map(msg => ({
        role: msg.direction === 'inbound' ? 'user' : 'assistant',
        content: msg.content
      })) || [];

      // 3. Save Inbound Message
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversation.id,
        direction: 'inbound',
        content: messageText
      });

      // 4. AI Processing

      // Check for confirmation first if there is a pending intent
      const pendingIntent = (conversation.context as any)?.pending_intent;
      const isConfirmation = await this.checkConfirmation(messageText);

      let aiResponse = "";

      if (pendingIntent && isConfirmation) {
        // EXECUTE BOOKING
        const success = await this.executeBooking(tenantId, pendingIntent, customerPhone);
        if (success) {
          aiResponse = `Confirmado! Seu agendamento para ${pendingIntent.serviceName} no dia ${pendingIntent.date} às ${pendingIntent.time} foi realizado com sucesso.`;
          // Clear pending intent
          await supabaseAdmin.from('conversations').update({
            context: { ...(conversation.context as any), pending_intent: null }
          }).eq('id', conversation.id);
        } else {
          aiResponse = "Tive um problema ao finalizar seu agendamento. Poderia tentar novamente em alguns instantes?";
        }
      } else {
        // Check for new intent
        const intent = await this.extractBookingIntent(messageText);

        if (intent && intent.serviceName && intent.date) {
          const isAvailable = await this.checkAvailability(tenantId, intent.date, intent.time);

          if (isAvailable) {
            aiResponse = `Perfeito! Tenho disponibilidade para ${intent.serviceName} no dia ${intent.date} às ${intent.time}. Posso confirmar o seu agendamento?`;
            // Save as pending intent
            await supabaseAdmin.from('conversations').update({
              context: { ...(conversation.context as any), pending_intent: intent }
            }).eq('id', conversation.id);
          } else {
            // Suggest other time via AI
            aiResponse = (await this.processMessage(
              `O cliente tentou agendar ${intent.serviceName} para ${intent.date} às ${intent.time}, mas esse horário está ocupado. Sugira outro horário amigavelmente.`,
              { ...context, history: formattedHistory }
            )) || "";
          }
        } else {
          // Normal conversation flow
          aiResponse = await this.processMessage(messageText, { ...context, history: formattedHistory }) || "Olá! Como posso ajudar você hoje?";
        }
      }

      // 5. Save Outbound Message
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversation.id,
        direction: 'outbound',
        content: aiResponse
      });

      return aiResponse;
    } catch (error) {
      console.error("Erro no processamento da IA:", error);
      return "Desculpe, tive um problema técnico. Pode repetir?";
    }
  },

  extractBookingIntent: async (message: string) => {
    const prompt = `Extraia a intenção de agendamento desta mensagem: "${message}". 
    Retorne APENAS um JSON com { "date": "YYYY-MM-DD", "time": "HH:MM", "serviceName": "string" } ou null se não houver intenção clara de novo agendamento.
    Considere a data atual como ${new Date().toISOString().split('T')[0]}.`;

    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      const result = JSON.parse(response.choices[0].message.content || 'null');
      return result;
    } catch {
      return null;
    }
  },

  checkAvailability: async (tenantId: string, date: string, time: string) => {
    try {
      // Check internally in our appointments table for conflicts
      const startTime = `${date}T${time}:00`;
      const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();

      const { count } = await supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .neq('status', 'cancelled')
        .lt('start_time', endTime)
        .gt('end_time', startTime);

      return (count ?? 0) === 0; // true = available
    } catch (error) {
      console.error('Error checking availability:', error);
      return true; // Fallback: allow booking
    }
  },

  checkConfirmation: async (message: string) => {
    const prompt = `Avalie se a mensagem a seguir é uma confirmação positiva (ex: sim, claro, pode confirmar, ok): "${message}". Retorne apenas "true" ou "false".`;
    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
      });
      return response.choices[0].message.content?.toLowerCase().includes('true');
    } catch {
      return false;
    }
  },

  executeBooking: async (tenantId: string, intent: any, customerPhone: string) => {
    try {
      // 1. Get Service ID from catalog
      const { data: service } = await supabaseAdmin
        .from('services')
        .select('id, duration')
        .eq('tenant_id', tenantId)
        .ilike('name', `%${intent.serviceName}%`)
        .limit(1)
        .single();

      // 2. Calculate start/end times
      const startTime = `${intent.date}T${intent.time}:00`;
      const duration = service?.duration || 60;
      const endTime = new Date(new Date(startTime).getTime() + duration * 60 * 1000).toISOString();

      // 3. Create Appointment directly in Supabase (no Google Calendar needed)
      const { error: appError } = await supabaseAdmin
        .from('appointments')
        .insert({
          tenant_id: tenantId,
          service_id: service?.id || null,
          customer_name: `WhatsApp: ${customerPhone}`,
          customer_phone: customerPhone,
          start_time: startTime,
          end_time: endTime,
          status: 'scheduled',
          notes: `Agendado automaticamente via IA - ${intent.serviceName}`
        });

      if (appError) throw appError;

      return true;
    } catch (error) {
      console.error('Error executing booking:', error);
      return false;
    }
  }
};
