import React from 'react';
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
                <h1 className="text-2xl font-bold text-gray-900">Olá, Bem-vindo de volta! 👋</h1>
                <p className="text-gray-600">Aqui está o que está acontecendo no seu negócio hoje.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                        <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center text-2xl mr-4`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Agendamentos Recentes</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-4">
                                        JD
                                    </div>
                                    <div>
                                        <p className="font-bold">João Silva</p>
                                        <p className="text-sm text-gray-500">Corte de Cabelo • 14:30</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">Confirmado</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Ações Rápidas</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center p-4 border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all text-left group">
                            <span className="mr-3 p-2 bg-gray-100 rounded-lg group-hover:bg-purple-100">🤖</span>
                            <div>
                                <p className="font-bold">Configurar Agente</p>
                                <p className="text-xs text-gray-500">Ajuste a personalidade da IA</p>
                            </div>
                        </button>
                        <button className="w-full flex items-center p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left group">
                            <span className="mr-3 p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100">🔌</span>
                            <div>
                                <p className="font-bold">Conectar WhatsApp</p>
                                <p className="text-xs text-gray-500">Escaneie o QR Code</p>
                            </div>
                        </button>
                        <button className="w-full flex items-center p-4 border border-gray-100 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all text-left group">
                            <span className="mr-3 p-2 bg-gray-100 rounded-lg group-hover:bg-green-100">📅</span>
                            <div>
                                <p className="font-bold">Sinalizar Google</p>
                                <p className="text-xs text-gray-500">Integrar calendário</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
