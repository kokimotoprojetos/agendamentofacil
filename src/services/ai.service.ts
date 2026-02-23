import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export const aiAgentService = {
  processMessage: async (message: string, context: any): Promise<string> => {
    console.log('[AI] Processing message with context services count:', context.services?.length);
    const systemPrompt = `
      Você é o assistente oficial de agendamento do(a) "${context.businessName}".
      SUA PRIORIDADE: Responder SEMPRE com base nas informações abaixo. Se a lista de serviços estiver vazia, diga que estamos atualizando o catálogo.
      
      INFORMAÇÕES REAIS DO NEGÓCIO:
      - Localização Exata: ${context.location}
      - Horário de Atendimento: ${context.workingHours.start} até ${context.workingHours.end}
      - Catálogo de Serviços e Preços: ${context.services.length > 0 ? JSON.stringify(context.services.map((s: any) => ({ serviço: s.name, preço: `R$ ${s.price}`, duração: `${s.duration} min` }))) : "Nenhum serviço cadastrado no momento."}
      
      DIRETRIZES DE RESPOSTA:
      1. Use a personalidade: ${context.personality}.
      2. Se perguntarem o endereço, responda exatamente: "${context.location}".
      3. Se perguntarem os serviços, liste todos os itens do "Catálogo de Serviços" acima com seus respectivos preços.
      4. Para agendamentos, verifique se o horário está entre ${context.workingHours.start} e ${context.workingHours.end}.
      5. Seja extremamente conciso (máximo 2 a 3 frases).
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
        temperature: 0.7,
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
      const { data: tokens } = await supabaseAdmin
        .from('google_calendar_tokens')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (!tokens) {
        console.warn('Google Calendar tokens not found for tenant:', tenantId);
        return true; // Fallback to allowing if no calendar connected
      }

      const { calendarService } = await import('./calendar.service');
      calendarService.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      });

      const start = `${date}T${time}:00Z`;
      // Assume 1 hour duration if not specified
      const end = new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();

      return await calendarService.checkAvailability(start, end, tokens.calendar_id);
    } catch (error) {
      console.error('Error checking real availability:', error);
      return true; // Fallback
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
      // 1. Get Service ID
      const { data: service } = await supabaseAdmin
        .from('services')
        .select('id, duration')
        .eq('tenant_id', tenantId)
        .ilike('name', `%${intent.serviceName}%`)
        .limit(1)
        .single();

      // 2. Create Appointment in DB
      const startTime = `${intent.date}T${intent.time}:00Z`;
      const duration = service?.duration || 60;
      const endTime = new Date(new Date(startTime).getTime() + duration * 60 * 1000).toISOString();

      const { data: appointment, error: appError } = await supabaseAdmin
        .from('appointments')
        .insert({
          tenant_id: tenantId,
          service_id: service?.id,
          customer_name: "Cliente WhatsApp",
          customer_phone: customerPhone,
          start_time: startTime,
          end_time: endTime,
          status: 'scheduled'
        })
        .select()
        .single();

      if (appError) throw appError;

      // 3. Sync with Google Calendar
      const { data: tokens } = await supabaseAdmin
        .from('google_calendar_tokens')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (tokens) {
        const { calendarService } = await import('./calendar.service');
        calendarService.setCredentials({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date
        });

        const gEvent = await calendarService.createEvent({
          title: `${intent.serviceName} - WhatsApp`,
          description: `Agendamento via IA para ${customerPhone}`,
          start: startTime,
          end: endTime
        }, tokens.calendar_id);

        if (gEvent?.id) {
          await supabaseAdmin
            .from('appointments')
            .update({ google_event_id: gEvent.id })
            .eq('id', appointment.id);
        }
      }

      return true;
    } catch (error) {
      console.error('Error executing booking:', error);
      return false;
    }
  }
};
