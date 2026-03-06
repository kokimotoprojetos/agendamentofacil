import React from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { RevenueBarChart, ServicesDonutChart } from '@/components/dashboard/DashboardCharts';
import { RealTimeTodayAppointments } from '@/components/dashboard/RealTimeTodayAppointments';
import { Users, LayoutDashboard, Calendar, MessageCircle, DollarSign, Activity } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { dashboardService } from '@/services/dashboard.service';

const WhatsAppIcon = ({ size = 20, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single();

    if (!profile?.tenant_id) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-slate-600">Perfil ou Tenant não configurado.</p>
            </div>
        );
    }

    const tenantId = profile.tenant_id;

    // Parallel data fetching
    const [statsData, recentActivity, weeklyRevenue, serviceDistribution, todayAppointments] = await Promise.all([
        dashboardService.getStats(tenantId),
        dashboardService.getRecentActivity(tenantId),
        dashboardService.getWeeklyRevenue(tenantId),
        dashboardService.getServiceDistribution(tenantId),
        dashboardService.getTodayAppointments(tenantId)
    ]);

    const stats = [
        {
            label: "Agendados Hoje",
            value: statsData.appointmentsToday.toString(),
            icon: <Calendar />,
            color: "orange" as const,
            trend: { value: "12%", positive: true }
        },
        {
            label: "Confirmados",
            value: (statsData.appointmentsToday * 0.8).toFixed(0), // Mocked for design
            icon: <Users />,
            color: "emerald" as const,
            trend: { value: "8%", positive: true }
        },
        {
            label: "Conversas Ativas",
            value: statsData.activeConversations.toString(),
            icon: <MessageCircle />,
            color: "rose" as const,
            trend: { value: "3%", positive: false }
        },
        {
            label: "Receita Hoje",
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(statsData.revenueToday),
            icon: <DollarSign />,
            color: "blue" as const,
            trend: { value: "15%", positive: true }
        },
    ];

    return (
        <div className="max-w-[1600px] mx-auto pb-20 p-6 lg:p-12 pt-24 lg:pt-12">
            <header className="mb-12">
                <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-2">Painel de Controle</h1>
                <p className="text-lg text-slate-600 font-semibold">Acompanhe seus agendamentos e métricas do dia</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    <DateSelector />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <RevenueBarChart data={weeklyRevenue} />
                        <ServicesDonutChart data={serviceDistribution} />
                    </div>
                </div>

                <div>
                    <RealTimeTodayAppointments initialAppointments={todayAppointments} tenantId={tenantId} />
                </div>
            </div>
        </div>
    );
}
