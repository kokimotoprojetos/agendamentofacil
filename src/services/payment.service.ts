import axios from 'axios';

const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com/v1';

function getHeaders() {
    return {
        'Authorization': `Bearer ${process.env.ABACATEPAY_API_KEY}`,
        'Content-Type': 'application/json',
    };
}

export interface CreateBillingParams {
    serviceName: string;
    price: number; // in cents
    customerName: string;
    customerPhone: string;
    appointmentId: string;
}

export interface BillingResponse {
    id: string;
    url: string;
    amount: number;
    status: string;
    devMode: boolean;
}

export const paymentService = {
    /**
     * Create a PIX billing for an appointment
     */
    createBilling: async (params: CreateBillingParams): Promise<BillingResponse | null> => {
        try {
            const response = await axios.post(
                `${ABACATEPAY_BASE_URL}/billing/create`,
                {
                    frequency: 'ONE_TIME',
                    methods: ['PIX'],
                    products: [
                        {
                            externalId: params.appointmentId,
                            name: params.serviceName,
                            quantity: 1,
                            price: params.price,
                        },
                    ],
                    returnUrl: `${process.env.APP_URL || 'https://beautfy.vercel.app'}`,
                    completionUrl: `${process.env.APP_URL || 'https://beautfy.vercel.app'}/pagamento/sucesso`,
                    customer: {
                        name: params.customerName,
                        cellphone: params.customerPhone,
                        email: `${params.customerPhone}@whatsapp.customer`,
                        taxId: '00000000000', // Required by API, placeholder for WhatsApp customers
                    },
                },
                { headers: getHeaders() }
            );

            return response.data?.data || null;
        } catch (error: any) {
            console.error('[payment] Error creating billing:', error.response?.data || error.message);
            return null;
        }
    },

    /**
     * List all billings
     */
    listBillings: async (): Promise<any[]> => {
        try {
            const response = await axios.get(
                `${ABACATEPAY_BASE_URL}/billing/list`,
                { headers: getHeaders() }
            );
            return response.data?.data || [];
        } catch (error: any) {
            console.error('[payment] Error listing billings:', error.response?.data || error.message);
            return [];
        }
    },

    /**
     * Get payment stats for a tenant
     */
    getPaymentStats: async (tenantId: string, supabaseAdmin: any) => {
        const { data: paidAppointments } = await supabaseAdmin
            .from('appointments')
            .select('payment_status, service:services(price)')
            .eq('tenant_id', tenantId)
            .eq('payment_status', 'paid');

        const { data: pendingAppointments } = await supabaseAdmin
            .from('appointments')
            .select('payment_status, service:services(price)')
            .eq('tenant_id', tenantId)
            .eq('payment_status', 'pending');

        const totalReceived = paidAppointments?.reduce((acc: number, a: any) => {
            return acc + (a.service?.price || 0);
        }, 0) || 0;

        const totalPending = pendingAppointments?.reduce((acc: number, a: any) => {
            return acc + (a.service?.price || 0);
        }, 0) || 0;

        return {
            totalReceived,
            totalPending,
            paidCount: paidAppointments?.length || 0,
            pendingCount: pendingAppointments?.length || 0,
        };
    },
};
