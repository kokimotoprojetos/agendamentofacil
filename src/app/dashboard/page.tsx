import React from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Users } from 'lucide-react';
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
    const statsData = await dashboardService.getStats(tenantId);
    const recentActivity = await dashboardService.getRecentActivity(tenantId);

    const stats = [
        {
            label: "Agendamentos Hoje",
            value: statsData.appointmentsToday.toString(),
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
            color: "indigo",
            trend: { value: "12%", positive: true }
        },
        {
            label: "Conversas Ativas",
            value: statsData.activeConversations.toString(),
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
            color: "blue",
            trend: { value: "5%", positive: true }
        },
        {
            label: "Taxa de Conversão",
            value: `${statsData.conversionRate}%`,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m16 8-8 8" /><path d="M12 16a4 4 0 1 0 4-4" /></svg>,
            color: "emerald",
            trend: { value: "2%", positive: true }
        },
        {
            label: "Receita Hoje",
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(statsData.revenueToday),
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
            color: "rose",
            trend: { value: "18%", positive: true }
        },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Visão Geral</h1>
                    <p className="text-sm text-slate-500">Acompanhe o desempenho do seu salão em tempo real.</p>
                </div>
                <div className="px-4 py-2 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl text-xs font-medium text-[var(--primary)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
                    Sistemas Ativos
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <section className="bg-white p-8 rounded-3xl border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Atividade Recente</h3>
                            <Link href="/dashboard/calendar" className="text-xs font-semibold text-[var(--primary)] hover:underline transition-all">
                                Ver Agenda Completa
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm transition-transform">
                                                {item.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                                <p className="text-[11px] text-slate-500">{item.service} • Hoje às {item.time}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${item.status === 'Confirmado'
                                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                                            : 'text-amber-600 bg-amber-50 border-amber-100'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 text-sm">Nenhuma atividade recente.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <aside className="space-y-6">
                    <section className="bg-white p-6 rounded-3xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Atalhos</h3>
                        <div className="space-y-3">
                            <Link href="/dashboard/agent" className="group flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[var(--primary)]/30 transition-all">
                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all text-slate-600">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">Agente IA</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Configurações</p>
                                </div>
                            </Link>

                            <Link href="/dashboard/whatsapp" className="group flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[var(--primary)]/30 transition-all">
                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all text-slate-600">
                                    <WhatsAppIcon size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">WhatsApp</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Conectividade</p>
                                </div>
                            </Link>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-[var(--primary)]/5 to-transparent relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Suporte</h3>
                            <p className="text-slate-500 text-[11px] font-medium mb-6">Precisa de ajuda com o sistema?</p>
                            <button className="w-full py-3 bg-[var(--primary)] text-white text-xs font-bold rounded-xl shadow-lg shadow-[var(--primary)]/10 hover:brightness-110 transition-all">
                                Abrir Chamado
                            </button>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
