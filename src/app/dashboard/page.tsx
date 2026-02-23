import React from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/StatsCard';

export default function DashboardPage() {
    const stats = [
        { label: "Agendamentos Hoje", value: "12", icon: "📅", color: "purple" },
        { label: "Conversas Ativas", value: "45", icon: "blue", color: "blue" },
        { label: "Taxa de Conversão", value: "85%", icon: "📈", color: "green" },
        { label: "Receita Hoje", value: "R$ 1.250", icon: "💰", color: "pink" },
    ];

    return (
        <div className="animate-fade-up">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Olá, Bem-vindo de volta! 👋</h1>
                <p className="text-slate-400">Aqui está o resumo do seu negócio para hoje.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} icon={stat.label === "Conversas Ativas" ? "💬" : stat.icon} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass p-8 rounded-[2rem] border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white tracking-tight">Agendamentos Recentes</h3>
                        <Link href="/dashboard/calendar" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">Ver Agenda Completa</Link>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-all group">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mr-5 group-hover:scale-110 transition-transform">
                                        JD
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">João Silva</p>
                                        <p className="text-xs text-slate-500">Corte de Cabelo • Hoje às 14:30</p>
                                    </div>
                                </div>
                                <span className="px-4 py-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full uppercase tracking-widest">Confirmado</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl">
                        <h3 className="text-lg font-bold mb-6 text-white tracking-tight">Atalhos</h3>
                        <div className="space-y-4">
                            <Link href="/dashboard/agent" className="flex items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-xl mr-4 group-hover:rotate-12 transition-transform">🤖</div>
                                <div>
                                    <p className="font-bold text-white text-sm">Configurar IA</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Ajuste a personalidade</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/whatsapp" className="flex items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-xl mr-4 group-hover:rotate-12 transition-transform">🔌</div>
                                <div>
                                    <p className="font-bold text-white text-sm">WhatsApp</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Conectar conta</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[2rem] border-white/5 bg-indigo-600/5 overflow-hidden relative group cursor-pointer shadow-2xl">
                        <div className="relative z-10">
                            <h3 className="text-white font-bold mb-2">Precisa de ajuda?</h3>
                            <p className="text-slate-400 text-xs mb-4">Nossa equipe de suporte está online agora para te ajudar.</p>
                            <button className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Falar com suporte</button>
                        </div>
                        <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full -m-6 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
