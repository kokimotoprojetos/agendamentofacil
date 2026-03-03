'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, DollarSign, Briefcase, X, Save, Edit2, Info } from 'lucide-react';

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: '',
        description: ''
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services');
            const data = await res.json();
            if (Array.isArray(data)) setServices(data);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (service?: any) => {
        if (service) {
            setEditingId(service.id);
            setFormData({
                name: service.name,
                price: service.price.toString(),
                duration: service.duration.toString(),
                description: service.description || ''
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', price: '', duration: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch('/api/services', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchServices();
            }
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente remover este serviço do catálogo?')) return;
        try {
            const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchServices();
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto pb-20">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Catálogo de Serviços</h1>
                        <p className="text-sm text-white/50">Gerencie os tratamentos e serviços oferecidos pela sua unidade.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-[#00e676] text-black font-bold text-sm rounded-xl hover:bg-[#00c864] transition-all active:scale-95 shadow-[0_0_20px_rgba(0,230,118,0.15)]"
                    >
                        <Plus size={18} />
                        <span>Adicionar Serviço</span>
                    </button>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#00e676] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : services.length === 0 ? (
                    <div className="bg-white/5 p-16 rounded-[2rem] border-dashed border-2 border-white/10 text-center">
                        <div className="w-16 h-16 bg-[#00e676]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Briefcase size={32} className="text-[#00e676]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Nenhum serviço cadastrado</h3>
                        <p className="text-white/40 text-sm max-w-sm mx-auto mb-8">Cadastre seus serviços para que o Agente IA possa apresentar opções e realizar agendamentos automáticos.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-8 py-3 bg-white/5 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-all border border-white/10"
                        >
                            Começar agora
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-[#00e676]/30 transition-all group relative"
                            >
                                <div className="flex justify-between items-start mb-5">
                                    <div className="p-3 bg-[#00e676]/10 rounded-xl border border-[#00e676]/20 text-[#00e676] group-hover:bg-[#00e676] group-hover:text-black transition-all">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleOpenModal(service)}
                                            className="p-2.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service.id)}
                                            className="p-2.5 text-white/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00e676] transition-colors line-clamp-1">{service.name}</h3>
                                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2 h-8">{service.description || 'Nenhuma descrição detalhada para este serviço.'}</p>
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Preço Sugerido</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs text-[#00e676] font-bold">R$</span>
                                            <span className="text-2xl font-bold text-white tracking-tight">{service.price}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] rounded-full border border-white/5 text-white/60">
                                        <Clock size={12} className="text-[#00e676]" />
                                        <span className="text-[11px] font-bold text-white/80">{service.duration} min</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-br from-white/[0.02] to-transparent p-8 border-b border-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-[#00e676] rounded-lg flex items-center justify-center text-black">
                                            {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white tracking-tight">
                                            {editingId ? 'Editar Serviço' : 'Novo Serviço'}
                                        </h2>
                                    </div>
                                    <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest">Configuração do portfólio</p>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-white/40 hover:text-white transition-all bg-white/5 rounded-xl">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Nome do Serviço</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Corte de Cabelo Degradê"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e676]/50 transition-all text-sm font-medium"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Preço (R$)</label>
                                        <div className="relative group">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00e676] bg-[#00e676]/10 p-1.5 rounded-lg group-focus-within:bg-[#00e676] group-focus-within:text-black transition-all">
                                                <DollarSign size={12} strokeWidth={3} />
                                            </div>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e676]/50 transition-all text-sm font-bold"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Duração (minutos)</label>
                                        <div className="relative group">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00e676] bg-[#00e676]/10 p-1.5 rounded-lg group-focus-within:bg-[#00e676] group-focus-within:text-black transition-all">
                                                <Clock size={12} strokeWidth={3} />
                                            </div>
                                            <input
                                                required
                                                type="number"
                                                placeholder="60"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e676]/50 transition-all text-sm font-bold"
                                                value={formData.duration}
                                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Descrição para o Agente IA</label>
                                    <div className="relative">
                                        <textarea
                                            placeholder="Descreva detalhes do serviço, diferenciais ou produtos usados. Isso ajuda a IA a vender melhor."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e676]/50 transition-all h-28 resize-none text-sm font-medium leading-relaxed"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[9px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-md">
                                            <Info size={10} />
                                            CONTEÚDO PARA IA
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-4 bg-white/5 text-white/60 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-4 py-4 bg-[#00e676] text-black font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-[#00e676]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={16} />
                                    <span>{editingId ? 'Salvar Alterações' : 'Cadastrar Serviço'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
