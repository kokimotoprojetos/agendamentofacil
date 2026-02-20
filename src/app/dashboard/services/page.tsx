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
                    <h1 className="text-2xl font-bold">Meus Serviços</h1>
                    <p className="text-gray-600">Gerencie o catálogo de serviços que seus clientes podem agendar.</p>
                </div>
                <button className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all">
                    + Novo Serviço
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700">Nome do Serviço</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700">Preço</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700">Duração</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium">{service.name}</td>
                                <td className="px-6 py-4 text-gray-600">R$ {service.price}</td>
                                <td className="px-6 py-4 text-gray-600">{service.duration}</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button className="text-purple-600 hover:text-purple-800 font-medium">Editar</button>
                                    <button className="text-red-600 hover:text-red-800 font-medium">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
