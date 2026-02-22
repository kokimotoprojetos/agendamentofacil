import React from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/StatsCard';

export default function DashboardPage() {
    // In a real app, we would fetch this from Supabase
    const stats = [
        { label: "Agendamentos Hoje", value: "12", icon: "📅", color: "purple" },
        { label: "Conversas Ativas", value: "45", icon: "💬", color: "blue" },
        { label: "Taxa de Conversão", value: "85%", icon: "📈", color: "green" },
        { label: "Receita Hoje", value: "R$ 1.250", icon: "💰", color: "pink" },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Olá, Bem-vindo de volta! 👋</h1>
                <p className="text-gray-400">Aqui está o que está acontecendo no seu negócio hoje.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#0f0f0f] p-8 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-6 text-white">Agendamentos Recentes</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-purple-900/30 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold mr-4">
                                        JD
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">João Silva</p>
                                        <p className="text-sm text-gray-500">Corte de Cabelo • 14:30</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 text-xs font-bold text-green-400 bg-green-900/30 border border-green-500/20 rounded-full">Confirmado</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0f0f0f] p-8 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-6 text-white">Ações Rápidas</h3>
                    <div className="space-y-3">
                        <Link href="/dashboard/agent" className="w-full flex items-center p-4 border border-white/5 rounded-xl hover:bg-purple-900/20 hover:border-purple-500/30 transition-all text-left group">
                            <span className="mr-3 p-2 bg-[#1a1a1a] rounded-lg group-hover:bg-purple-900/40">🤖</span>
                            <div>
                                <p className="font-bold text-white">Configurar Agente</p>
                                <p className="text-xs text-gray-500">Ajuste a personalidade da IA</p>
                            </div>
                        </Link>
                        <Link href="/dashboard/whatsapp" className="w-full flex items-center p-4 border border-white/5 rounded-xl hover:bg-blue-900/20 hover:border-blue-500/30 transition-all text-left group">
                            <span className="mr-3 p-2 bg-[#1a1a1a] rounded-lg group-hover:bg-blue-900/40">🔌</span>
                            <div>
                                <p className="font-bold text-white">Conectar WhatsApp</p>
                                <p className="text-xs text-gray-500">Escaneie o QR Code</p>
                            </div>
                        </Link>
                        <Link href="/dashboard/calendar" className="w-full flex items-center p-4 border border-white/5 rounded-xl hover:bg-green-900/20 hover:border-green-500/30 transition-all text-left group">
                            <span className="mr-3 p-2 bg-[#1a1a1a] rounded-lg group-hover:bg-green-900/40">📅</span>
                            <div>
                                <p className="font-bold text-white">Sinalizar Google</p>
                                <p className="text-xs text-gray-500">Integrar calendário</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
