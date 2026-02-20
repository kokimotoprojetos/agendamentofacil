import React from 'react';

export default function AdminDashboard() {
    const stats = [
        { label: "Total de Clientes", value: "1.240", growth: "+12%" },
        { label: "MRR (Receita Mensal)", value: "R$ 245.000", growth: "+5%" },
        { label: "Agendamentos Gerais", value: "45.200", growth: "+18%" },
        { label: "Conversas IA", value: "128.000", growth: "+25%" },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                        <p className="text-gray-600">Visão geral da plataforma AgendamentoIA.</p>
                    </div>
                    <button className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-all">
                        Exportar Dados
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 font-medium mb-2">{stat.label}</p>
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                <span className="text-xs font-bold text-green-600">{stat.growth}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Clientes Recentes</h3>
                        <div className="flex space-x-4">
                            <input type="text" placeholder="Buscar cliente..." className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none" />
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Empresa</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Plano</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cadastro</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg mr-3"></div>
                                            <span className="font-medium">Salão da Maria #{i}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">Profissional</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">Ativo</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">12/02/2024</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-purple-600 hover:text-purple-800 text-sm font-bold">Ver Detalhes</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
