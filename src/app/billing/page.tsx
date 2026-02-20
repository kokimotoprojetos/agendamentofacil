'use client';

import React from 'react';
import { saasConfig } from '@/config/saas-config';

export default function BillingPage() {
    const plans = saasConfig.modules.find(m => m.name === 'subscription')?.config.plans || [];
    const currentPlan = plans[1]; // Mock current plan (Professional)

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Assinatura e Faturamento</h1>
                <p className="text-gray-600">Gerencie seu plano e visualize seu histórico de pagamentos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Plano Atual</h3>
                            <span className="px-3 py-1 text-xs font-bold text-purple-700 bg-purple-100 rounded-full uppercase">Ativo</span>
                        </div>
                        <div className="flex items-baseline mb-4">
                            <h2 className="text-3xl font-bold">{currentPlan.name}</h2>
                            <span className="ml-2 text-gray-500">R$ {currentPlan.price}/mês</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl mb-6">
                            <p className="text-sm text-gray-600">Próxima cobrança em: <span className="font-bold text-gray-900">15 de Março, 2024</span></p>
                        </div>
                        <div className="flex space-x-4">
                            <button className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all">
                                Mudar de Plano
                            </button>
                            <button className="px-6 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-all">
                                Cancelar Assinatura
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-6">Histórico de Cobrança</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="font-bold">Ciclo de {i === 0 ? 'Fevereiro' : i === 1 ? 'Janeiro' : 'Dezembro'}</p>
                                        <p className="text-xs text-gray-500">Pago em 15/{i + 2}/2024</p>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <span className="font-bold">R$ 197,00</span>
                                        <a href="#" className="text-purple-600 hover:text-purple-800 text-sm font-medium underline">PDF</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-purple-600 p-8 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10 text-white">
                            <h3 className="text-lg font-bold mb-4 italic">Upgrade para Business</h3>
                            <p className="text-sm opacity-90 mb-6 leading-relaxed">
                                Desbloqueie atendimento ilimitado e múltiplos profissionais.
                            </p>
                            <button className="w-full py-3 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                                Ver Benefícios
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 -m-12 w-48 h-48 bg-purple-500 rounded-full opacity-20 transform translate-x-12 translate-y--12"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
