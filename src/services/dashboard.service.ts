import { supabaseAdmin } from '@/lib/supabase-admin';
import { startOfDay, endOfDay } from 'date-fns';

export const dashboardService = {
    getStats: async (tenantId: string) => {
        const today = new Date();
        const start = startOfDay(today).toISOString();
        const end = endOfDay(today).toISOString();

        // 1. Appointments Today
        const { count: appointmentsToday } = await supabaseAdmin
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .gte('start_time', start)
            .lte('start_time', end);

        // 2. Total Conversations (Active)
        const { count: activeConversations } = await supabaseAdmin
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);

        // 3. Revenue Today
        // We fetch appointments and join with services to get prices
        const { data: appointments } = await supabaseAdmin
            .from('appointments')
            .select('service:services(price)')
            .eq('tenant_id', tenantId)
            .gte('start_time', start)
            .lte('start_time', end);

        const revenueToday = appointments?.reduce((acc, app: any) => {
            // Handle potential array or object return from Supabase join
            const price = app.service?.price || 0;
            return acc + price;
        }, 0) || 0;

        // 4. Conversion Rate (Simple: appointments / conversations)
        const conversionRate = activeConversations && activeConversations > 0
            ? Math.round(((appointmentsToday || 0) / activeConversations) * 100)
            : 0;

        return {
            appointmentsToday: appointmentsToday || 0,
            activeConversations: activeConversations || 0,
            revenueToday,
            conversionRate
        };
    },

    getRecentActivity: async (tenantId: string) => {
        const { data } = await supabaseAdmin
            .from('appointments')
            .select('*, customer_name, start_time, status, service:services(name)')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(4);

        return data?.map(item => ({
            name: item.customer_name || "Cliente",
            service: item.service?.name || "Serviço",
            time: item.start_time ? new Date(item.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : "--:--",
            status: item.status === 'scheduled' ? 'Confirmado' : 'Pendente'
        })) || [];
    }
};
