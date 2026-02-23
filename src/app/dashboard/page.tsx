import React from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/StatsCard';

export default function DashboardPage() {
    const stats = [
        {
            label: "Agendamentos Hoje",
            value: "12",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
            color: "indigo",
            trend: { value: "12%", positive: true }
        },
        {
            label: "Conversas Ativas",
            value: "45",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
            color: "blue",
            trend: { value: "5%", positive: true }
        },
        {
            label: "Taxa de Conversão",
            value: "85%",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7.63 7.63a9 9 0 0 0 12.74 12.74L21 21" /><path d="m9 9 6.63 6.63" /><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6" /></svg>,
            color: "emerald",
            trend: { value: "2%", positive: false }
        },
        {
            label: "Receita Hoje",
            value: "R$ 1.250",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
            color: "rose",
            trend: { value: "18%", positive: true }
        },
    ];

    return (
        <div className="max-w-[1600px] mx-auto pb-20 animate-fade-up">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Resumo Executivo</h1>
                    <p className="text-slate-500 font-medium">Bem-vindo de volta, Beautfy Manager. O seu negócio está progredindo bem hoje.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        Sistemas Operacionais
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <section className="glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Atividade Recente</h3>
                                <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">Últimos Agendamentos</p>
                            </div>
                            <Link href="/dashboard/calendar" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all">
                                Ver Tudo
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: "João Silva", service: "Corte de Cabelo", time: "14:30", status: "Confirmado" },
                                { name: "Maria Clara", service: "Manicure", time: "15:45", status: "Confirmado" },
                                { name: "Ricardo Alves", service: "Barba", time: "16:15", status: "Pendente" },
                                { name: "Ana Beatriz", service: "Coloração", time: "17:00", status: "Confirmado" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] hover:bg-white/[0.05] rounded-3xl border border-white/5 transition-all group cursor-pointer premium-glow">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform">
                                            {item.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-black text-white tracking-tight">{item.name}</p>
                                            <p className="text-xs text-slate-500 font-medium">{item.service} • Hoje às {item.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`px-5 py-2 text-[10px] font-black rounded-full uppercase tracking-widest ${item.status === 'Confirmado'
                                                ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10'
                                                : 'text-amber-400 bg-amber-500/5 border border-amber-500/10'
                                            }`}>
                                            {item.status}
                                        </span>
                                        <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:text-white hover:bg-white/10">
                                            →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="space-y-8">
                    <section className="glass p-8 rounded-[2.5rem] border-white/5">
                        <h3 className="text-xl font-black text-white tracking-tight mb-8">Ferramentas de Gestão</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <Link href="/dashboard/agent" className="group flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-indigo-500/40 transition-all">
                                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    🤖
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm tracking-tight">Otimizar Agente</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">IA Performance</p>
                                </div>
                            </Link>

                            <Link href="/dashboard/whatsapp" className="group flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/40 transition-all">
                                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    🔌
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm tracking-tight">Instância WhatsApp</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Conectividade</p>
                                </div>
                            </Link>
                        </div>
                    </section>

                    <section className="glass p-10 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white tracking-tight mb-4 leading-tight">Suporte<br />Boutique</h3>
                            <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">Atendimento humanizado para escalar seu negócio.</p>
                            <button className="w-full py-4 bg-white text-[#020617] text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                                Falar Agora
                            </button>
                        </div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-700" />
                    </section>
                </aside>
            </div>
        </div>
    );
}
