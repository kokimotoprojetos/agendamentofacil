'use client';

import React, { useState } from 'react';

export default function AgentConfig() {
    const [config, setConfig] = useState({
        name: "Assistente AgendamentoIA",
        personality: "Amigável e profissional",
        greeting: "Olá! Como posso ajudar você a agendar seu horário hoje?",
        workingHours: {
            start: "09:00",
            end: "18:00"
        }
    });

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Configuração do Agente IA</h1>
                    <p className="text-gray-600">Personalize o comportamento e as regras do seu robô.</p>
                </div>
                <button className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all">
                    Salvar Alterações
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Personalidade e Identidade</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Agente</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-purple-600"
                                value={config.name}
                                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Personalidade</label>
                            <textarea
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-purple-600 h-32"
                                placeholder="Ex: Amigável, consultivo, direto ao ponto..."
                                value={config.personality}
                                onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem de Saudação</label>
                            <textarea
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-purple-600 h-24"
                                value={config.greeting}
                                onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Horário de Funcionamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Início do Expediente</label>
                            <input
                                type="time"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-purple-600"
                                value={config.workingHours.start}
                                onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, start: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fim do Expediente</label>
                            <input
                                type="time"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-purple-600"
                                value={config.workingHours.end}
                                onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, end: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Regras de Agendamento</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-bold">Coletar Nome do Cliente</p>
                                <p className="text-xs text-gray-500">Obrigatório antes de confirmar</p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-purple-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-bold">Confirmar Disponibilidade Manualmente</p>
                                <p className="text-xs text-gray-500">IA perguntará se você aprova antes de marcar</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 accent-purple-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
