'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, DollarSign, Briefcase, X, Save } from 'lucide-react';

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newService, setNewService] = useState({
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

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newService)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewService({ name: '', price: '', duration: '', description: '' });
                fetchServices();
            }
        } catch (error) {
            console.error('Erro ao adicionar serviço:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        try {
            const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchServices();
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-up">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Catálogo de Serviços</h1>
                    <p className="text-sm text-slate-400">Gerencie os serviços que o Agente IA pode oferecer aos seus clientes.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Novo Serviço</span>
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : services.length === 0 ? (
                <div className="glass p-12 rounded-3xl border-dashed border-white/5 text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl mx-auto mb-4 opacity-50">
                        <Briefcase size={24} className="text-slate-400" />
                    </div>
                    <p className="text-white font-bold mb-2">Seu catálogo está vazio</p>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Cadastre seus serviços para que a IA possa realizar agendamentos dinâmicos.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-primary text-sm font-bold hover:underline"
                    >
                        Adicionar seu primeiro serviço
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="glass p-6 rounded-2xl border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <Briefcase size={18} />
                                </div>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{service.name}</h3>
                            <p className="text-xs text-slate-500 mb-6 line-clamp-2 min-h-[2rem] leading-relaxed">{service.description || 'Sem descrição informada.'}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-primary font-bold">R$</span>
                                    <span className="text-xl font-bold text-white tabular-nums">{service.price}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg text-slate-400">
                                    <Clock size={12} />
                                    <span className="text-xs font-semibold">{service.duration} min</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Cadastro */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="glass-dark border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleAddService} className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Novo Serviço</h2>
                                    <p className="text-xs text-slate-500 mt-1">Defina os detalhes comerciais do serviço.</p>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Nome do Serviço</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Corte de Cabelo"
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all text-sm font-medium"
                                        value={newService.name}
                                        onChange={e => setNewService({ ...newService, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Preço (R$)</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all text-sm font-medium"
                                                value={newService.price}
                                                onChange={e => setNewService({ ...newService, price: e.target.value })}
                                            />
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Duração (min)</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="number"
                                                placeholder="60"
                                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all text-sm font-medium"
                                                value={newService.duration}
                                                onChange={e => setNewService({ ...newService, duration: e.target.value })}
                                            />
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Descrição</label>
                                    <textarea
                                        placeholder="Descreva o serviço para auxiliar a IA..."
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all h-24 resize-none text-sm font-medium"
                                        value={newService.description}
                                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-white/5 text-slate-400 font-bold text-sm rounded-xl hover:bg-white/10 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={16} />
                                    <span>Salvar Serviço</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
