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
        <section id="features" className="py-20 bg-[#0a0a0a]">
            <div className="container px-4 mx-auto">
                <div className="max-w-2xl mx-auto mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl text-white">Tudo que você precisa para escalar seu negócio</h2>
                    <p className="text-lg text-gray-400">Funcionalidades pensadas para simplificar a vida do empreendedor.</p>
                </div>
                <div className="flex flex-wrap -mx-4">
                    {features.map((feature, index) => (
                        <div key={index} className="w-full px-4 mb-8 md:w-1/2 lg:w-1/4">
                            <div className="p-8 h-full transition duration-300 bg-[#0f0f0f] border border-white/5 rounded-2xl hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-900/10">
                                <div className="inline-flex items-center justify-center w-12 h-12 mb-6 text-2xl bg-purple-900/30 border border-purple-500/20 rounded-lg">
                                    {feature.icon}
                                </div>
                                <h3 className="mb-4 text-xl font-bold text-white">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
