import React from 'react';

const FEATURES = [
    {
        title: 'WhatsApp 24/7',
        description: 'Seu agente IA nunca dorme. Ele responde mensagens e agenda serviços a qualquer hora do dia ou da noite.',
        icon: '🤖',
    },
    {
        title: 'Sincronização Google',
        description: 'Todos os agendamentos aparecem instantaneamente no seu Google Calendar para evitar conflitos.',
        icon: '📅',
    },
    {
        title: 'Multi-atendimento',
        description: 'Conecte múltiplos números e gerencie diferentes profissionais em uma única plataforma.',
        icon: '👥',
    },
    {
        title: 'Pagamentos Online',
        description: 'Receba pagamentos ou adiantamentos no momento do agendamento para reduzir faltas.',
        icon: '💰',
    },
];

export const Features = () => {
    return (
        <section id="features" className="py-24 bg-slate-950/50">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">Tudo que seu salão precisa</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">Potencialize seu negócio com a tecnologia de agendamento mais avançada.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((feature, index) => (
                        <div key={index} className="glass p-8 rounded-3xl hover:border-indigo-500/40 transition-all group">
                            <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
