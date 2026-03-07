'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Pencil, Trash2, X, Save, CheckCircle2 } from 'lucide-react';

interface Professional {
    id: string;
    name: string;
    email: string;
    phone: string;
    service_ids: string[];
}

interface Service {
    id: string;
    name: string;
    duration: number;
    price: number;
}

export default function TeamPage() {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProf, setEditingProf] = useState<Professional | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service_ids: [] as string[]
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profsRes, srvsRes] = await Promise.all([
                fetch('/api/team'),
                fetch('/api/services')
            ]);

            const profsData = await profsRes.json();
            const srvsData = await srvsRes.json();

            setProfessionals(Array.isArray(profsData) ? profsData : []);
            setServices(Array.isArray(srvsData) ? srvsData : []);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (prof?: Professional) => {
        if (prof) {
            setEditingProf(prof);
            setFormData({
                name: prof.name || '',
                email: prof.email || '',
                phone: prof.phone || '',
                service_ids: prof.service_ids || []
            });
        } else {
            setEditingProf(null);
            setFormData({ name: '', email: '', phone: '', service_ids: [] });
        }
        setIsModalOpen(true);
    };

    const toggleService = (serviceId: string) => {
        setFormData(prev => ({
            ...prev,
            service_ids: prev.service_ids.includes(serviceId)
                ? prev.service_ids.filter(id => id !== serviceId)
                : [...prev.service_ids, serviceId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/team', {
                method: editingProf ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingProf ? { id: editingProf.id, ...formData } : formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error('Erro ao salvar profissional:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este funcionário? Isso pode afetar agendamentos passados ligados a ele.')) return;
        try {
            const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Erro ao excluir profissional:', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8 pt-24 lg:pt-12 p-6 lg:p-12">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Briefcase className="text-[var(--primary)]" />
                        Equipe
                    </h1>
                    <p className="text-sm text-white/50 mt-1">
                        Gerencie seus funcionários e defina quais serviços cada um atende
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold text-sm rounded-xl shadow-lg shadow-[var(--primary)]/20 hover:brightness-110 transition-all active:scale-95"
                >
                    <Plus size={18} /> Adicionar Funcionário
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : professionals.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                        <Briefcase size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Sua equipe está vazia</h3>
                    <p className="text-sm">Adicione profissionais para controlar as agendas individualmente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {professionals.map(prof => (
                        <div key={prof.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative group overflow-hidden flex flex-col">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(prof)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(prof.id)}
                                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary)] to-[#ff8c5a] rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-[var(--primary)]/20">
                                    {prof.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="pr-16">
                                    <h3 className="text-lg font-bold text-white truncate truncate w-full">{prof.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{prof.phone || 'Sem telefone'}</p>
                                </div>
                            </div>

                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Serviços que Atende</p>
                                {prof.service_ids?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {prof.service_ids.map(id => {
                                            const service = services.find(s => s.id === id);
                                            return service ? (
                                                <span key={id} className="px-2.5 py-1 text-[11px] font-bold bg-white/5 text-slate-300 rounded-md border border-white/10">
                                                    {service.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">Nenhum serviço vinculado</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                            <h2 className="text-xl font-bold text-white">
                                {editingProf ? 'Editar Funcionário' : 'Novo Funcionário'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="teamForm" onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-wide">Nome Completo</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                                        placeholder="Ex: João Silva"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-wide">Telefone</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                                            placeholder="(11) 99999-9999"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-wide">E-mail (opcional)</label>
                                        <input
                                            type="email"
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                                            placeholder="joao@exemplo.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 mb-3 uppercase tracking-wide mt-2">
                                        Serviços que realiza
                                    </label>
                                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                        {services.map(service => {
                                            const isSelected = formData.service_ids.includes(service.id);
                                            return (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => toggleService(service.id)}
                                                    className={`
                                                        w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all
                                                        ${isSelected
                                                            ? 'bg-[var(--primary)]/10 border-[var(--primary)]/50'
                                                            : 'bg-slate-950/30 border-slate-800/80 hover:border-slate-700'}
                                                    `}
                                                >
                                                    <div>
                                                        <p className={`font-bold text-sm ${isSelected ? 'text-[var(--primary)]' : 'text-slate-200'}`}>
                                                            {service.name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 font-medium">
                                                            {service.duration} min • R$ {service.price}
                                                        </p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${isSelected ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'border-slate-600'}`}>
                                                        {isSelected && <CheckCircle2 size={12} strokeWidth={4} />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {services.length === 0 && (
                                            <p className="text-sm text-slate-500 italic p-4 text-center border border-dashed border-slate-800 rounded-xl">
                                                Nenhum serviço cadastrado ainda. Vá na aba Serviços para criá-los.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 text-slate-400 font-bold text-sm hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                form="teamForm"
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-3 bg-[var(--primary)] text-white font-bold text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
