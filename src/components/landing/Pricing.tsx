import React from 'react';
import { saasConfig } from '@/config/saas-config';

export const Pricing = () => {
    const plans = saasConfig.modules.find(m => m.name === 'subscription')?.config.plans || [];

    return (
        <section id="pricing" className="py-24">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">Planos que cabem no seu bolso</h2>
                    <p className="text-slate-400">Escolha o plano perfeito para o momento do seu negócio.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan: any, index: number) => (
                        <div
                            key={index}
                            className={`relative glass p-10 rounded-[2.5rem] border-white/5 flex flex-col transition-all hover:-translate-y-2 ${index === 1 ? 'border-orange-500/30 shadow-2xl shadow-orange-500/10 scale-105 z-10' : ''}`}
                        >
                            {index === 1 && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-orange-600 rounded-full text-xs font-bold text-white tracking-widest uppercase">
                                    Mais Popular
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                                <span className="text-slate-400 text-sm">/{plan.interval === 'month' ? 'mês' : 'ano'}</span>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature: string, fIndex: number) => (
                                    <li key={fIndex} className="flex items-center gap-3 text-slate-300 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-400 shrink-0">
                                            ✓
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="/register"
                                className={`w-full py-4 rounded-2xl font-bold text-center transition-all ${index === 1 ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}
                            >
                                Assinar Agora
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
