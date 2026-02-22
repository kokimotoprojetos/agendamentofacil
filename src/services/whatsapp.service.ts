import axios from 'axios';

const evolutionApi = axios.create({
    baseURL: process.env.EVOLUTION_API_URL,
    headers: {
        'apikey': process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
    }
});

export const whatsappService = {
    instanceExists: async (instanceName: string) => {
        try {
            console.log(`Checking instance existence: ${instanceName}`);
            const response = await evolutionApi.get(`/instance/connectionState/${instanceName}`);
            return response.status === 200;
        } catch (error: any) {
            console.log(`Instance state check for ${instanceName} failed with status: ${error.response?.status}`);
            if (error.response?.status === 404) return false;
            // Some versions might return 400 for non-existent instances in connectionState
            if (error.response?.status === 400) return false;
            throw error;
        }
    },

    createInstance: async (instanceName: string) => {
        try {
            const payload: any = {
                instanceName,
                qrcode: true,
                webhook: `${process.env.APP_URL}/api/webhooks/whatsapp`,
                events: ['MESSAGES_UPSERT', 'QRCODE_UPDATED', 'CONNECTION_UPDATE']
            };

            console.log('Creating WhatsApp Instance with URL:', `${process.env.EVOLUTION_API_URL}/instance/create`);
            console.log('Payload:', JSON.stringify(payload, null, 2));

            const response = await evolutionApi.post('/instance/create', payload);
            return response.data;
        } catch (error: any) {
            console.error('Error creating WhatsApp instance details:', error.response?.data || error.message);
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
