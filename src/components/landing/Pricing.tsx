import React from 'react';
import { saasConfig } from '@/config/saas-config';

export const Pricing = () => {
    const plans = saasConfig.modules.find(m => m.name === 'subscription')?.config.plans || [];

    return (
        <section id="pricing" className="py-20 bg-[#050505]">
            <div className="container px-4 mx-auto">
                <div className="max-w-2xl mx-auto mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl text-white">Planos simples para todos os tamanhos</h2>
                    <p className="text-lg text-gray-400">Escolha o plano perfeito para o momento do seu negócio.</p>
                </div>
                <div className="flex flex-wrap -mx-4">
                    {plans.map((plan: any, index: number) => (
                        <div key={index} className="w-full px-4 mb-8 lg:w-1/3">
                            <div className={`p-8 h-full border rounded-2xl transition duration-300 bg-[#0f0f0f] hover:border-purple-600/50 ${index === 1 ? 'border-purple-600 shadow-2xl shadow-purple-900/20 relative scale-105 z-10' : 'border-white/5'}`}>
                                {index === 1 && (
                                    <span className="absolute top-0 right-0 px-3 py-1 m-4 text-xs font-bold text-white bg-purple-600 rounded-full">
                                        Mais Popular
                                    </span>
                                )}
                                <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                                <div className="flex items-baseline mb-6">
                                    <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                                    <span className="ml-2 text-gray-500">/{plan.interval === 'month' ? 'mês' : 'ano'}</span>
                                </div>
                                <ul className="mb-8 space-y-4">
                                    {plan.features.map((feature: string, fIndex: number) => (
                                        <li key={fIndex} className="flex items-center text-gray-400">
                                            <svg className="w-5 h-5 mr-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href="/register"
                                    className={`block w-full py-3 font-semibold text-center transition duration-200 rounded-lg ${index === 1 ? 'text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-900/20' : 'text-purple-400 border border-purple-500/30 hover:bg-purple-900/10'}`}
                                >
                                    Assinar Agora
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
