'use client';

import React, { useState, useEffect } from 'react';

export default function AgentConfig() {
    const [config, setConfig] = useState({
        personality: "Amigável e profissional",
        location: "",
        workingHours: {
            start: "09:00",
            end: "18:00"
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/tenant/settings');
            const data = await res.json();
            if (res.ok) {
                setConfig({
                    personality: data.personality || "Amigável e profissional",
                    location: data.location || "",
                    workingHours: data.workingHours || { start: "09:00", end: "18:00" }
                });
            }
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/tenant/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (res.ok) alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Falha ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 font-sans">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Configuração do Agente IA</h1>
                    <p className="text-gray-400">Personalize o comportamento e as regras do seu robô.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50"
                >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-[#0f0f0f] p-8 rounded-2xl border border-white/5 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-white">📖 Conhecimento e Personalidade</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Comportamento/Personalidade</label>
                            <textarea
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-purple-600 h-32 transition-colors placeholder:text-gray-600"
                                placeholder="Ex: Amigável, consultivo, direto ao ponto..."
                                value={config.personality}
                                onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-2">Dica: Descreva como o agente deve tratar os clientes (ex: usar emojis, ser formal, etc).</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">📍 Localização / Endereço</label>
                            <input
                                type="text"
                                placeholder="Rua Exemplo, 123 - Centro, São Paulo"
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-purple-600 transition-colors"
                                value={config.location}
                                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 mt-2">O agente usará este campo para responder quando alguém perguntar "onde fica?".</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f0f0f] p-8 rounded-2xl border border-white/5 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-white">⏰ Horário de Funcionamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Início do Expediente</label>
                            <input
                                type="time"
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-purple-600 transition-colors"
                                value={config.workingHours.start}
                                onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, start: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Fim do Expediente</label>
                            <input
                                type="time"
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-purple-600 transition-colors"
                                value={config.workingHours.end}
                                onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, end: e.target.value } })}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">A IA não permitirá agendamentos fora deste intervalo.</p>
                </div>
            </div>
        </div>
    );
}
