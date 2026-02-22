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
            const response = await evolutionApi.get(`/instance/connectionState/${instanceName}`);
            return response.status === 200;
        } catch (error: any) {
            if (error.response?.status === 404 || error.response?.status === 400) return false;
            throw error;
        }
    },

    getConnectionStatus: async (instanceName: string) => {
        try {
            const response = await evolutionApi.get(`/instance/connectionState/${instanceName}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404 || error.response?.status === 400) {
                return { instance: { state: 'disconnected' } };
            }
            throw error;
        }
    },

    createInstance: async (instanceName: string) => {
        try {
            const payload = {
                instanceName,
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS'
            };

            const response = await evolutionApi.post('/instance/create', payload);
            return response.data;
        } catch (error: any) {
            console.error('Error creating WhatsApp instance:', error.response?.data || error.message);
            throw error;
        }
    },

    setWebhook: async (instanceName: string) => {
        const webhookUrl = `${process.env.APP_URL}/api/webhooks/whatsapp`;
        const payload = {
            enabled: true,
            url: webhookUrl,
            webhook_by_events: false,
            events: [
                'MESSAGES_UPSERT',
                'MESSAGES_UPDATE',
                'MESSAGES_DELETE',
                'SEND_MESSAGE',
                'CONTACTS_UPSERT',
                'CONTACTS_UPDATE',
                'PRESENCE_UPDATE',
                'CHAT_STATE_UPDATE',
                'QRCODE_UPDATED',
                'CONNECTION_UPDATE',
                'INSTANCE_RELOADED'
            ]
        };

        try {
            console.log('Syncing Webhook (v2-instance):', instanceName, 'at', webhookUrl);
            const response = await evolutionApi.post(`/webhook/instance/set/${instanceName}`, payload);
            return response.data;
        } catch (error: any) {
            console.warn('v2-instance webhook set failed, trying v1-style:', error.message);
            try {
                const response = await evolutionApi.post(`/webhook/set/${instanceName}`, payload);
                return response.data;
            } catch (err: any) {
                console.error('All webhook set endpoints failed');
                throw err;
            }
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
