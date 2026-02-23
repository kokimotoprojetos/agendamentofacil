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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-up">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Configuração do Agente IA</h1>
                    <p className="text-slate-400 mt-1">Personalize como sua IA atende seus clientes.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-xl">📖</div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Conhecimento e Personalidade</h3>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Comportamento do Agente</label>
                            <textarea
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 h-40 transition-all placeholder:text-slate-600 leading-relaxed shadow-inner"
                                placeholder="Descreva como o agente deve conversar... Ex: Seja amigável, use emojis e sempre tente marcar um horário."
                                value={config.personality}
                                onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                            ></textarea>
                            <p className="text-[10px] text-slate-500 mt-3 font-medium uppercase tracking-tight italic">O agente usará isso como base para todas as respostas.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">📍 Localização / Endereço</label>
                            <input
                                type="text"
                                placeholder="Rua Exemplo, 123 - Centro"
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all shadow-inner"
                                value={config.location}
                                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-xl">⏰</div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Horário de Funcionamento</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Início das Atividades</label>
                            <input
                                type="time"
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all shadow-inner"
                                value={config.workingHours.start}
                                onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, start: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Encerramento</label>
                            <input
                                type="time"
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all shadow-inner"
                                value={config.workingHours.end}
                                onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, end: e.target.value } })}
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-2 p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/10">
                        <span className="text-xl">ℹ️</span>
                        <p className="text-xs text-indigo-300 font-medium">A IA bloqueará automaticamente qualquer tentativa de agendamento fora destes horários.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
