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
        <div className="flex justify-center py-40">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-32 animate-fade-up">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Engenharia do Agente</h1>
                    <p className="text-slate-500 font-medium">Configure a inteligência cognitiva e as diretrizes operacionais do seu assistente.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="group relative px-10 py-4 bg-white text-[#020617] font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
                >
                    <span className="relative z-10">{saving ? 'Processando...' : 'Salvar Protocolos'}</span>
                    <div className="absolute inset-0 bg-indigo-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-10" />
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <section className="glass p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden premium-glow">
                        <div className="flex items-center gap-5 mb-12">
                            <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-2xl border border-indigo-500/20 text-indigo-400">
                                🧠
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Núcleo de Personalidade</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Definição de Comportamento</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Instruções de Resposta</label>
                                <textarea
                                    className="w-full px-8 py-6 bg-white/[0.02] border border-white/5 text-white rounded-3xl focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] h-56 transition-all placeholder:text-slate-700 leading-relaxed tabular-nums shadow-inner scrollbar-hide"
                                    placeholder="Ex: Você é um assistente executivo bilíngue, use um tom profissional, emojis discretos e priorize a conversão de agendamentos."
                                    value={config.personality}
                                    onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                                ></textarea>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">A IA interpretará estas diretrizes para cada interação via WhatsApp.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-10 pt-4">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">📍 Endereço Geográfico</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Avenida Paulista, 1000 - Bela Vista, SP"
                                            className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 text-white rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all shadow-inner group-hover:border-white/10"
                                            value={config.location}
                                            onChange={(e) => setConfig({ ...config, location: e.target.value })}
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-10">
                    <section className="glass p-10 rounded-[3rem] border-white/5 premium-glow">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-xl border border-indigo-500/20 text-indigo-400">
                                ⏱️
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight">Cronograma</h3>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Início do Turno</label>
                                <input
                                    type="time"
                                    className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 text-white rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all shadow-inner"
                                    value={config.workingHours.start}
                                    onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, start: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Fechamento</label>
                                <input
                                    type="time"
                                    className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 text-white rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all shadow-inner"
                                    value={config.workingHours.end}
                                    onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, end: e.target.value } })}
                                />
                            </div>
                        </div>

                        <div className="mt-10 p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                            <p className="text-[10px] text-indigo-300 font-bold leading-relaxed">A IA filtrará solicitações fora deste intervalo para garantir a precisão operacional.</p>
                        </div>
                    </section>

                    <section className="p-8 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden group hover:bg-indigo-600/20 transition-all duration-500 cursor-help">
                        <div className="relative z-10 flex gap-4">
                            <div className="text-2xl">💡</div>
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-tight mb-1">Dica de Especialista</p>
                                <p className="text-[10px] text-indigo-300 font-medium leading-relaxed italic">Quanto mais detalhada for a personalidade, menos halucinações o agente terá.</p>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
