import axios from 'axios';

const evolutionApi = axios.create({
    baseURL: process.env.EVOLUTION_API_URL,
    headers: {
        'apikey': process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
    }
});

export const whatsappService = {
    createInstance: async (instanceName: string) => {
        try {
            const response = await evolutionApi.post('/instance/create', {
                instanceName,
                token: '', // Optional token
                webhook: `${process.env.APP_URL}/api/webhooks/whatsapp`,
                events: ['MESSAGES_UPSERT', 'QRCODE_UPDATED', 'CONNECTION_UPDATE']
            });
            return response.data;
        } catch (error) {
            console.error('Error creating WhatsApp instance:', error);
            throw error;
        }
    },

    getQrCode: async (instanceName: string) => {
        try {
            const response = await evolutionApi.get(`/instance/connect/${instanceName}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching QR code:', error);
            throw error;
        }
    },

    logout: async (instanceName: string) => {
        try {
            await evolutionApi.delete(`/instance/logout/${instanceName}`);
        } catch (error) {
            console.error('Error logging out WhatsApp instance:', error);
        }
    },

    deleteInstance: async (instanceName: string) => {
        try {
            await evolutionApi.delete(`/instance/delete/${instanceName}`);
        } catch (error) {
            console.error('Error deleting WhatsApp instance:', error);
        }
    },

    sendMessage: async (instanceName: string, remoteJid: string, text: string) => {
        try {
            const response = await evolutionApi.post(`/message/sendText/${instanceName}`, {
                number: remoteJid,
                options: {
                    delay: 1200,
                    presence: "composing"
                },
                textMessage: {
                    text
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw error;
        }
    }
};
