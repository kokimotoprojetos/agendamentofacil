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

        // Confirmed working payload format for this Evolution API version
        // Endpoint: POST /webhook/set/{instance}
        // Payload must have config wrapped in a "webhook" key
        const payload = {
            webhook: {
                enabled: true,
                url: webhookUrl,
                webhook_by_events: false,
                events: [
                    'MESSAGES_UPSERT',
                    'MESSAGES_UPDATE',
                    'MESSAGES_DELETE',
                    'SEND_MESSAGE',
                    'CONNECTION_UPDATE',
                    'QRCODE_UPDATED'
                ]
            }
        };

        console.log('Setting Webhook for:', instanceName, '-> URL:', webhookUrl);
        const response = await evolutionApi.post(`/webhook/set/${instanceName}`, payload);
        console.log('Webhook set successfully:', response.data);
        return response.data;
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

    getContactProfile: async (instanceName: string, remoteJid: string) => {
        try {
            const number = remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
            const response = await evolutionApi.post(`/chat/fetchProfile/${instanceName}`, {
                number
            });
            return {
                name: response.data?.name || response.data?.pushname || null,
                picture: response.data?.profilePictureUrl || null
            };
        } catch (error) {
            console.error('Error fetching contact profile:', error);
            return { name: null, picture: null };
        }
    },

    sendMessage: async (instanceName: string, remoteJid: string, text: string) => {
        try {
            // Evolution API expects a clean phone number (no @s.whatsapp.net suffix)
            const number = remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
            const response = await evolutionApi.post(`/message/sendText/${instanceName}`, {
                number,
                text,
                linkPreview: false,
                delay: 1200,
                presence: "composing"
            });
            return response.data;
        } catch (error: any) {
            console.error('Error sending WhatsApp message:', error.response?.data || error.message);
            throw error;
        }
    }
};
