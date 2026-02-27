'use client';

import React, { useState, useEffect } from 'react';
import { Brain, MapPin, Clock, Save, CalendarDays, Scissors } from 'lucide-react';

const DAYS_OF_WEEK = [
    { id: 'mon', label: 'Segunda' },
    { id: 'tue', label: 'Terça' },
    { id: 'wed', label: 'Quarta' },
    { id: 'thu', label: 'Quinta' },
    { id: 'fri', label: 'Sexta' },
    { id: 'sat', label: 'Sábado' },
    { id: 'sun', label: 'Domingo' }
];

export default function AgentConfig() {
    const [config, setConfig] = useState({
        personality: "Amigável e profissional",
        location: "",
        workingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
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
                    workingDays: data.workingDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
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
            if (res.ok) {
                // Notificação de sucesso
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (dayId: string) => {
        setConfig(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(dayId)
                ? prev.workingDays.filter(d => d !== dayId)
                : [...prev.workingDays, dayId]
        }));
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                            <Brain size={20} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configuração do Agente</h1>
                    </div>
                    <p className="text-sm text-slate-600">Ajuste os dados essenciais para o funcionamento do assistente.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
                >
                    <Save size={18} />
                    <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {/* Personalidade e Instruções */}
                <section className="bg-white p-8 rounded-[2rem] border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Brain size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Instruções da IA (Personalidade)</h3>
                    </div>
                    <textarea
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:outline-none focus:border-indigo-400 h-32 text-sm leading-relaxed resize-none"
                        placeholder="Ex: Você é um assistente simpático de um salão de beleza..."
                        value={config.personality}
                        onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                    ></textarea>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Agenda de Operação */}
                    <section className="bg-white p-8 rounded-[2rem] border border-slate-200">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <CalendarDays size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Dias e Horários</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">Dias de Funcionamento</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day.id}
                                            onClick={() => toggleDay(day.id)}
                                            className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${config.workingDays.includes(day.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                        >
                                            {day.label.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase block text-center">Início</span>
                                    <input
                                        type="time"
                                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-400 transition-all text-xs font-bold text-center"
                                        value={config.workingHours.start}
                                        onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, start: e.target.value } })}
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase block text-center">Término</span>
                                    <input
                                        type="time"
                                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-400 transition-all text-xs font-bold text-center"
                                        value={config.workingHours.end}
                                        onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, end: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Endereço */}
                    <section className="bg-white p-8 rounded-[2rem] border border-slate-200">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <MapPin size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Localização</h3>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest text-center">Endereço do Estabelecimento</label>
                            <textarea
                                placeholder="Rua, Número, Bairro, Cidade..."
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:outline-none focus:border-indigo-400 transition-all text-sm h-32 resize-none leading-relaxed"
                                value={config.location}
                                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                            ></textarea>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
