'use client';

import React, { useState, useEffect } from 'react';

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
        <div className="max-w-7xl mx-auto pb-32 animate-fade-up">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Catálogo de Serviços</h1>
                    <p className="text-slate-500 font-medium">Gerencie a oferta comercial do seu negócio processada pela Inteligência Artificial.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative px-10 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all active:scale-95 flex items-center gap-3"
                >
                    <span className="text-lg">+</span> Novo Protocolo
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-40">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"></div>
                    </div>
                </div>
            ) : services.length === 0 ? (
                <div className="glass p-20 rounded-[3rem] border-white/5 border-dashed text-center">
                    <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-6 border border-indigo-500/10 opacity-50">
                        📄
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest mb-4">Catálogo Vazio</p>
                    <p className="text-slate-600 text-sm max-w-sm mx-auto mb-10 leading-relaxed">Você ainda não cadastrou nenhum serviço para o Agente IA oferecer aos clientes.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-indigo-400 font-black text-xs uppercase tracking-widest hover:text-indigo-300 transition-colors"
                    >
                        Adicionar Primeiro Serviço
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div key={service.id} className="glass p-8 rounded-[3rem] border-white/5 hover:border-indigo-500/30 transition-all group premium-glow cursor-default overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /><path d="m9.01 13 4-4" /></svg>
                                </div>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    title="Excluir"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                            </div>

                            <h3 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">{service.name}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-8 line-clamp-2 leading-relaxed h-10">{service.description || 'Nenhuma especificação técnica fornecida.'}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mr-1">R$</span>
                                    <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{service.price}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    <span className="text-xs font-bold text-slate-400">{service.duration} min</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
                    <div className="glass-dark border border-white/10 w-full max-w-2xl rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <div className="scale-[8] transform">📝</div>
                        </div>

                        <form onSubmit={handleAddService} className="p-12 relative z-10">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter">Novo Serviço</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Configuração Comercial</p>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">✕</button>
                            </div>

                            <div className="space-y-10">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Nome do Serviço</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Consultoria Executiva"
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold tracking-tight shadow-inner group-hover:border-white/10"
                                        value={newService.name}
                                        onChange={e => setNewService({ ...newService, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Investimento (R$)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold tracking-tight shadow-inner group-hover:border-white/10"
                                            value={newService.price}
                                            onChange={e => setNewService({ ...newService, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Tempo Estimado (min)</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="60"
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold tracking-tight shadow-inner group-hover:border-white/10"
                                            value={newService.duration}
                                            onChange={e => setNewService({ ...newService, duration: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Descrição Técnica</label>
                                    <textarea
                                        placeholder="Descreva as especificidades para o Agente IA..."
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-indigo-500/50 transition-all h-32 resize-none font-bold tracking-tight shadow-inner group-hover:border-white/10 scrollbar-hide"
                                        value={newService.description}
                                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-12 flex gap-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-8 py-5 bg-white/5 text-slate-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-8 py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                                >
                                    Efetivar Serviço
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
