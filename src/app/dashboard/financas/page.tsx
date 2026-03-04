import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default async function FinancasPage() {
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

    // Fetch payment stats
    const { data: paidAppointments } = await supabaseAdmin
        .from('appointments')
        .select('id, customer_name, start_time, payment_status, payment_id, payment_url, service:services(name, price)')
        .eq('tenant_id', tenantId)
        .eq('payment_status', 'paid')
        .order('start_time', { ascending: false })
        .limit(20);

    const { data: pendingPayments } = await supabaseAdmin
        .from('appointments')
        .select('id, customer_name, start_time, payment_status, payment_id, payment_url, service:services(name, price)')
        .eq('tenant_id', tenantId)
        .eq('payment_status', 'pending')
        .order('start_time', { ascending: false })
        .limit(20);

    const { data: allPaidAppointments } = await supabaseAdmin
        .from('appointments')
        .select('service:services(price)')
        .eq('tenant_id', tenantId)
        .eq('payment_status', 'paid');

    const { data: allPendingAppointments } = await supabaseAdmin
        .from('appointments')
        .select('service:services(price)')
        .eq('tenant_id', tenantId)
        .eq('payment_status', 'pending');

    const totalReceived = allPaidAppointments?.reduce((acc: number, a: any) => acc + (a.service?.price || 0), 0) || 0;
    const totalPending = allPendingAppointments?.reduce((acc: number, a: any) => acc + (a.service?.price || 0), 0) || 0;
    const paidCount = allPaidAppointments?.length || 0;
    const pendingCount = allPendingAppointments?.length || 0;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Finanças</h1>
                    <p className="text-sm text-white/50">Acompanhe seus pagamentos e receitas.</p>
                </div>
                <div className="px-4 py-2 bg-[#00e676]/5 border border-[#00e676]/20 rounded-xl text-xs font-medium text-[#00e676] flex items-center gap-2">
                    <DollarSign size={14} />
                    AbacatePay {process.env.ABACATEPAY_API_KEY?.startsWith('abc_dev_') ? '(Dev Mode)' : '(Produção)'}
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <TrendingUp size={20} className="text-emerald-400" />
                        </div>
                        <span className="text-xs text-white/40 font-medium">Total Recebido</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalReceived)}</p>
                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                        <ArrowUpRight size={12} />
                        {paidCount} pagamentos
                    </p>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                            <Clock size={20} className="text-amber-400" />
                        </div>
                        <span className="text-xs text-white/40 font-medium">Pendente</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalPending)}</p>
                    <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {pendingCount} aguardando
                    </p>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <CheckCircle size={20} className="text-blue-400" />
                        </div>
                        <span className="text-xs text-white/40 font-medium">Pagamentos Confirmados</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{paidCount}</p>
                    <p className="text-xs text-blue-400 mt-1">via PIX</p>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <DollarSign size={20} className="text-purple-400" />
                        </div>
                        <span className="text-xs text-white/40 font-medium">Ticket Médio</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {paidCount > 0 ? formatCurrency(totalReceived / paidCount) : 'R$ 0,00'}
                    </p>
                    <p className="text-xs text-purple-400 mt-1">por agendamento</p>
                </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Payments */}
                <section className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <Clock size={18} className="text-amber-400" />
                            Pagamentos Pendentes
                        </h3>
                        <span className="text-xs bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full font-medium border border-amber-400/20">
                            {pendingCount}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {pendingPayments && pendingPayments.length > 0 ? (
                            pendingPayments.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 font-bold text-xs">
                                            {item.customer_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{item.customer_name}</p>
                                            <p className="text-[10px] text-white/40">
                                                {item.service?.name} • {formatDate(item.start_time)} às {formatTime(item.start_time)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-amber-400">{formatCurrency(item.service?.price || 0)}</p>
                                        <span className="text-[9px] text-white/30">PIX pendente</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Clock size={32} className="text-white/10 mx-auto mb-3" />
                                <p className="text-white/30 text-sm">Nenhum pagamento pendente.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Paid */}
                <section className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <CheckCircle size={18} className="text-emerald-400" />
                            Pagamentos Confirmados
                        </h3>
                        <span className="text-xs bg-emerald-400/10 text-emerald-400 px-3 py-1 rounded-full font-medium border border-emerald-400/20">
                            {paidCount}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {paidAppointments && paidAppointments.length > 0 ? (
                            paidAppointments.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400 font-bold text-xs">
                                            {item.customer_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{item.customer_name}</p>
                                            <p className="text-[10px] text-white/40">
                                                {item.service?.name} • {formatDate(item.start_time)} às {formatTime(item.start_time)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-400">{formatCurrency(item.service?.price || 0)}</p>
                                        <span className="text-[9px] text-emerald-400/50">✅ Pago</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <CheckCircle size={32} className="text-white/10 mx-auto mb-3" />
                                <p className="text-white/30 text-sm">Nenhum pagamento confirmado ainda.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
