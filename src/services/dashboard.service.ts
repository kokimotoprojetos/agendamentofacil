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
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false })
            .limit(5);

        return data?.map(item => ({
            name: item.customer_name || "Cliente",
            service: item.service?.name || "Serviço",
            time: item.start_time ? new Date(item.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : "--:--",
            status: item.status === 'scheduled' ? 'Confirmado' : item.status === 'completed' ? 'Concluído' : 'Pendente'
        })) || [];
    },

    getWeeklyRevenue: async (tenantId: string) => {
        const today = new Date();
        const data = [];

        // Fetch last 7 days revenue
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const start = startOfDay(date).toISOString();
            const end = endOfDay(date).toISOString();

            const { data: appointments } = await supabaseAdmin
                .from('appointments')
                .select('service:services(price)')
                .eq('tenant_id', tenantId)
                .gte('start_time', start)
                .lte('start_time', end);

            const revenue = appointments?.reduce((acc, app: any) => acc + (app.service?.price || 0), 0) || 0;

            data.push({
                day: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
                revenue
            });
        }
        return data;
    },

    getServiceDistribution: async (tenantId: string) => {
        const { data: appointments } = await supabaseAdmin
            .from('appointments')
            .select('service:services(name)')
            .eq('tenant_id', tenantId);

        const counts: { [key: string]: number } = {};
        let total = 0;

        appointments?.forEach((app: any) => {
            const name = app.service?.name || "Outros";
            counts[name] = (counts[name] || 0) + 1;
            total++;
        });

        const sortedServices = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);

        let percentageSum = 0;
        const result = sortedServices.map(([name, count]) => {
            const percentage = Math.round((count / total) * 100);
            percentageSum += percentage;
            return { name, percentage };
        });

        if (total > 0 && percentageSum < 100) {
            result.push({ name: 'Outros', percentage: 100 - percentageSum });
        }

        return result;
    },

    getTodayAppointments: async (tenantId: string) => {
        // Adjust for Brazil timezone (UTC-3)
        const todayBR = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        const start = startOfDay(todayBR).toISOString();
        const end = endOfDay(todayBR).toISOString();

        const { data } = await supabaseAdmin
            .from('appointments')
            .select('*, customer_name, start_time, duration, service:services(name)')
            .eq('tenant_id', tenantId)
            .eq('status', 'scheduled') // Only show active appointments
            .gte('start_time', start)
            .lte('start_time', end)
            .order('start_time', { ascending: true });

        return data?.map(item => {
            const startTime = new Date(item.start_time);
            const endTime = new Date(startTime.getTime() + (item.duration || 60) * 60000);

            // Force America/Sao_Paulo timezone for server-side rendering/API
            const formatter = new Intl.DateTimeFormat('pt-BR', {
                hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
            });

            return {
                id: item.id,
                name: item.customer_name || "Cliente",
                service: item.service?.name || "Serviço",
                timeRange: `${formatter.format(startTime)} - ${formatter.format(endTime)}`,
                startTime: item.start_time
            };
        }) || [];
    }
};
