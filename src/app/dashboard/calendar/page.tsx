'use client';

import React, { useState } from 'react';

export default function CalendarIntegration() {
    const [isConnected, setIsConnected] = useState(false);
    const [selectedCalendar, setSelectedCalendar] = useState("");

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-[#0f0f0f] p-8 rounded-2xl border border-white/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Google Calendar</h1>
                        <p className="text-gray-400">Sincronize seus agendamentos com sua agenda pessoal ou empresarial.</p>
                    </div>
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-8 h-8" />
                    </div>
                </div>

                {!isConnected ? (
                    <div className="p-12 bg-blue-900/10 border border-blue-500/20 rounded-2xl text-center">
                        <h3 className="text-xl font-bold text-blue-400 mb-4">Aumente sua produtividade</h3>
                        <p className="text-blue-300/70 mb-8 max-w-md mx-auto">
                            Ao conectar o Google Calendar, nossa IA verificará sua disponibilidade real antes de agendar qualquer cliente.
                        </p>
                        <button
                            onClick={() => setIsConnected(true)}
                            className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            Conectar com Google
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-green-900/20 border border-green-500/20 rounded-xl flex items-center">
                            <span className="text-2xl mr-3 text-green-400">✅</span>
                            <div>
                                <p className="font-bold text-green-400">Conta conectada com sucesso</p>
                                <p className="text-sm text-green-300/60">seu-email@gmail.com</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Selecione o Calendário Principal</label>
                            <select
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-purple-600 transition-colors"
                                value={selectedCalendar}
                                onChange={(e) => setSelectedCalendar(e.target.value)}
                            >
                                <option value="" className="bg-[#1a1a1a]">Selecione um calendário...</option>
                                <option value="primary" className="bg-[#1a1a1a]">Pessoal (Principal)</option>
                                <option value="business" className="bg-[#1a1a1a]">Trabalho / Salão</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                            <div>
                                <p className="font-bold text-white">Sincronização Bidirecional</p>
                                <p className="text-xs text-gray-500">Alterações no Google também afetam o sistema</p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-purple-600 bg-transparent border-white/10 rounded" />
                        </div>

                        <button className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-900/20 transition-all">
                            Configurar Sincronização
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
