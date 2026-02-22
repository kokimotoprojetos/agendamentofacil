import React from 'react';

export const Hero = () => {
    return (
        <section className="relative py-20 overflow-hidden bg-[#050505]">
            <div className="container px-4 mx-auto">
                <div className="flex flex-wrap items-center -mx-4">
                    <div className="w-full px-4 lg:w-1/2">
                        <div className="max-w-xl">
                            <span className="inline-block py-1 px-3 mb-4 text-xs font-semibold tracking-widest text-purple-400 uppercase bg-purple-900/30 rounded-full border border-purple-500/20">
                                IA de Agendamento
                            </span>
                            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl">
                                Agende clientes no <span className="text-purple-500">WhatsApp</span> 24/7 de forma automática
                            </h1>
                            <p className="mb-8 text-xl text-gray-400">
                                O AgendamentoIA atende seus clientes, tira dúvidas e marca horários sincronizados com seu Google Calendar. Tudo no piloto automático.
                            </p>
                            <div className="flex flex-wrap items-center">
                                <a
                                    href="/register"
                                    className="inline-block px-8 py-4 mb-4 mr-4 text-lg font-semibold text-white transition duration-200 bg-purple-600 rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-900/20 md:mb-0"
                                >
                                    Começar Grátis por 7 dias
                                </a>
                                <a
                                    href="#features"
                                    className="inline-block px-8 py-4 text-lg font-semibold text-white transition duration-200 border border-white/10 rounded-lg hover:bg-white/5"
                                >
                                    Ver Funcionalidades
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="w-full px-4 mt-12 lg:w-1/2 lg:mt-0">
                        <div className="relative max-w-lg mx-auto lg:max-w-none">
                            <img
                                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
                                alt="Dashboard AgendamentoIA"
                                className="relative z-10 w-full rounded-2xl shadow-2xl border border-white/5"
                            />
                            <div className="absolute top-0 right-0 z-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-purple-600 rounded-full -m-12 w-64 h-64 blur-3xl opacity-20"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
