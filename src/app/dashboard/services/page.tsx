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
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Meus Serviços</h1>
                    <p className="text-gray-400 text-sm mt-1">Gerencie o catálogo de serviços que seus clientes podem agendar com a IA.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
                >
                    <span className="text-xl">+</span> Novo Serviço
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : services.length === 0 ? (
                <div className="bg-[#0f0f0f] border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <p className="text-gray-500 mb-4">Você ainda não cadastrou nenhum serviço.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-purple-400 hover:underline">Cadastrar o primeiro serviço agora</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="bg-[#0f0f0f] rounded-2xl border border-white/5 p-6 hover:border-purple-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{service.name}</h3>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                                    title="Excluir"
                                >
                                    🗑️
                                </button>
                            </div>
                            <p className="text-sm text-gray-400 mb-6 line-clamp-2">{service.description || 'Sem descrição'}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center text-purple-400 font-bold bg-purple-400/10 px-3 py-1 rounded-lg">
                                    <span className="text-xs mr-1">R$</span> {service.price}
                                </div>
                                <div className="flex items-center text-gray-500 text-sm">
                                    <span className="mr-1">🕒</span> {service.duration} min
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Cadastro */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                        <form onSubmit={handleAddService} className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Novo Serviço</h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">✕</button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Serviço</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Corte de Cabelo"
                                        className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition-all"
                                        value={newService.name}
                                        onChange={e => setNewService({ ...newService, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Preço (R$)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition-all"
                                            value={newService.price}
                                            onChange={e => setNewService({ ...newService, price: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duração (min)</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="30"
                                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition-all"
                                            value={newService.duration}
                                            onChange={e => setNewService({ ...newService, duration: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descrição (Opcional)</label>
                                    <textarea
                                        placeholder="Descreva o serviço para a IA entender melhor..."
                                        className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition-all h-24 resize-none"
                                        value={newService.description}
                                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-900/20 transition-all"
                                >
                                    Criar Serviço
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
