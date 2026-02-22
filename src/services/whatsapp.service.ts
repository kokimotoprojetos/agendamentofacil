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

        // Wrapped payload as required by some v2 versions
        const wrappedPayload = {
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
                    'TYPEBOT_START',
                    'TYPEBOT_CHANGE_STATUS'
                ]
            }
        };

        const simplePayload = {
            enabled: true,
            url: webhookUrl,
            webhook_by_events: false,
            events: wrappedPayload.webhook.events
        };

        try {
            console.log('Syncing Webhook (v2-instance-set):', instanceName);
            // Try wrapping first as the error message suggested
            const response = await evolutionApi.post(`/webhook/instance/set/${instanceName}`, wrappedPayload);
            return response.data;
        } catch (error: any) {
            console.warn('v2-instance-set wrapped failed, trying alternative v2 simple:', error.message);
            try {
                const response = await evolutionApi.post(`/webhook/set/${instanceName}`, simplePayload);
                return response.data;
            } catch (err: any) {
                console.warn('Alternative v2 failed, trying global set with instance in body:', err.message);
                try {
                    const response = await evolutionApi.post(`/webhook/set`, {
                        ...simplePayload,
                        instance: instanceName
                    });
                    return response.data;
                } catch (lastErr: any) {
                    console.error('All webhook set endpoints failed');
                    throw lastErr;
                }
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
