'use client';

import React, { useState, useEffect } from 'react';
import { Brain, MapPin, Clock, Lightbulb, Save } from 'lucide-react';

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
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-up">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Configuração do Agente</h1>
                    <p className="text-sm text-slate-400">Personalize o comportamento e as informações do seu assistente de IA.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                >
                    <Save size={18} />
                    <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass p-8 rounded-3xl border-white/5">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/10">
                                <Brain size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Personalidade e Tom</h3>
                                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Como o agente deve conversar</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-3">Instruções de Comportamento</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white/5 border border-white/5 text-white rounded-xl focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] h-48 transition-all placeholder:text-slate-600 text-sm leading-relaxed"
                                    placeholder="Ex: Você é um assistente amigável, usa emojis e foca em agendar horários."
                                    value={config.personality}
                                    onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                                ></textarea>
                                <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">Estas diretrizes moldam a forma como a IA responde aos seus clientes no WhatsApp.</p>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-semibold text-slate-400 mb-3">📍 Endereço da Unidade</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Digite o endereço completo"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/5 text-white rounded-xl focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all text-sm pl-11"
                                        value={config.location}
                                        onChange={(e) => setConfig({ ...config, location: e.target.value })}
                                    />
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-8">
                    <section className="glass p-6 rounded-3xl border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <Clock size={18} />
                            </div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Horário de Atendimento</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2">Início</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/5 text-white rounded-xl focus:outline-none focus:border-primary/50 transition-all text-sm"
                                    value={config.workingHours.start}
                                    onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, start: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2">Fim</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/5 text-white rounded-xl focus:outline-none focus:border-primary/50 transition-all text-sm"
                                    value={config.workingHours.end}
                                    onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, end: e.target.value } })}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                        <div className="flex gap-3">
                            <Lightbulb className="text-primary shrink-0" size={20} />
                            <div>
                                <p className="text-xs font-bold text-white mb-1">Dica de IA</p>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Forneça detalhes específicos sobre os serviços mais procurados para que a IA possa vender melhor por você.</p>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
