import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export const aiAgentService = {
  processMessage: async (message: string, context: any) => {
    const systemPrompt = `
      Você é um assistente virtual inteligente para agendamento de serviços em um(a) ${context.businessName}.
      Seu objetivo é ajudar o cliente a agendar um horário, responder dúvidas sobre serviços e preços.
      
      Configurações:
      - Personalidade: ${context.personality}
      - Horário: ${context.workingHours.start} às ${context.workingHours.end}
      - Serviços Disponíveis: ${JSON.stringify(context.services)}
      
      Regras de Negócio:
      - Seja sempre educado e profissional.
      - Se o cliente quiser agendar, peça o nome e o serviço desejado.
      - Verifique se o horário solicitado está dentro do expediente.
      - Responda de forma concisa (máximo 3 frases).
    `;

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

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error processing AI message:', error);
      return "Desculpe, estou com uma instabilidade técnica momentânea. Pode repetir por favor?";
    }
  },

  async processResponse(tenantId: string, customerPhone: string, message: string, context: any) {
    try {
      // 1. Get or Create Conversation
      let { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('customer_phone', customerPhone)
        .single();

      if (!conversation) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({ tenant_id: tenantId, customer_phone: customerPhone })
          .select()
          .single();
        conversation = newConv;
      }

      // 2. Save Inbound Message
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        direction: 'inbound',
        content: message
      });

      // 3. AI Processing
      const intent = await this.extractBookingIntent(message);

      let aiResponse = "";
      if (intent && intent.serviceName && intent.date) {
        const isAvailable = await this.checkAvailability(tenantId, intent.date, intent.time);
        aiResponse = isAvailable
          ? `Perfeito! Tenho disponibilidade para ${intent.serviceName} no dia ${intent.date} às ${intent.time}. Gostaria de confirmar?`
          : `Sinto muito, esse horário para ${intent.serviceName} já está ocupado. Poderíamos tentar outro horário?`;
      } else {
        // Se não for intenção de agendamento clara, usa o processMessage normal para conversa fluida
        aiResponse = await this.processMessage(message, context) || "Olá! Como posso ajudar você hoje?";
      }

      // 4. Save Outbound Message
      await supabase.from('messages').insert({
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
    const prompt = `Extraia a intenção de agendamento desta mensagem: "${message}". Retorne JSON com { "date": "YYYY-MM-DD", "time": "HH:MM", "serviceName": "string" } ou null se não houver intenção clara.`;

    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content || 'null');
    } catch {
      return null;
    }
  },

  checkAvailability: async (tenantId: string, date: string, time: string) => {
    // Mock checking logic
    console.log(`Checking availability for ${tenantId} on ${date} at ${time}`);
    return true; // Simplified for this stage
  }
};
