'use client';

import React, { useState } from 'react';

export default function ServicesPage() {
    const [services, setServices] = useState([
        { id: 1, name: "Corte de Cabelo Masculino", price: "45.00", duration: "30 min" },
        { id: 2, name: "Barba Completa", price: "35.00", duration: "20 min" },
        { id: 3, name: "Combo (Corte + Barba)", price: "70.00", duration: "50 min" },
    ]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Meus Serviços</h1>
                    <p className="text-gray-400">Gerencie o catálogo de serviços que seus clientes podem agendar.</p>
                </div>
                <button className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-900/20 transition-all">
                    + Novo Serviço
                </button>
            </div>

            <div className="bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-[#1a1a1a] border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-300">Nome do Serviço</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-300">Preço</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-300">Duração</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-300 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{service.name}</td>
                                <td className="px-6 py-4 text-gray-400">R$ {service.price}</td>
                                <td className="px-6 py-4 text-gray-400">{service.duration}</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Editar</button>
                                    <button className="text-red-400 hover:text-red-300 font-medium transition-colors">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
