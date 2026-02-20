import React from 'react';

const features = [
    {
        title: 'WhatsApp 24/7',
        description: 'Seu agente IA nunca dorme. Ele responde mensagens e agenda serviços a qualquer hora do dia ou da noite.',
        icon: '💬',
    },
    {
        title: 'Sincronização Google Calendar',
        description: 'Todos os agendamentos aparecem instantaneamente no seu Google Calendar para evitar conflitos de horário.',
        icon: '📅',
    },
    {
        title: 'Multi-atendimento',
        description: 'Conecte múltiplos números de WhatsApp e gerencie diferentes profissionais em uma única plataforma.',
        icon: '👥',
    },
    {
        title: 'Pagamentos Integrados',
        description: 'Receba pagamentos ou adiantamentos no momento do agendamento para reduzir faltas.',
        icon: '💰',
    },
];

export const Features = () => {
    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="container px-4 mx-auto">
                <div className="max-w-2xl mx-auto mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">Tudo que você precisa para escalar seu negócio</h2>
                    <p className="text-lg text-gray-600">Funcionalidades pensadas para simplificar a vida do empreendedor.</p>
                </div>
                <div className="flex flex-wrap -mx-4">
                    {features.map((feature, index) => (
                        <div key={index} className="w-full px-4 mb-8 md:w-1/2 lg:w-1/4">
                            <div className="p-8 h-full transition duration-300 bg-white rounded-2xl hover:shadow-xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 mb-6 text-2xl bg-purple-100 rounded-lg">
                                    {feature.icon}
                                </div>
                                <h3 className="mb-4 text-xl font-bold">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
