import OpenAI from 'openai';

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

    extractBookingIntent: async (message: string) => {
        // Logic to extract date, time, and service from natural language
        // This could also use DeepSeek with a specific tool-calling or structured output instruction
        const prompt = `Extraia a intenção de agendamento desta mensagem: "${message}". Retorne JSON com {date: YYYY-MM-DD, time: HH:MM, serviceName: string} ou null se não houver intenção clara.`;

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
    }
};
