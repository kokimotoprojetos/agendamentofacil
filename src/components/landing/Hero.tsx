import React from 'react';

export const Hero = () => {
    return (
        <section className="relative py-20 overflow-hidden bg-white">
            <div className="container px-4 mx-auto">
                <div className="flex flex-wrap items-center -mx-4">
                    <div className="w-full px-4 lg:w-1/2">
                        <div className="max-w-xl">
                            <span className="inline-block py-1 px-3 mb-4 text-xs font-semibold tracking-widest text-purple-600 uppercase bg-purple-100 rounded-full">
                                IA de Agendamento
                            </span>
                            <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
                                Agende clientes no <span className="text-purple-600">WhatsApp</span> 24/7 de forma automática
                            </h1>
                            <p className="mb-8 text-xl text-gray-600">
                                O AgendamentoIA atende seus clientes, tira dúvidas e marca horários sincronizados com seu Google Calendar. Tudo no piloto automático.
                            </p>
                            <div className="flex flex-wrap items-center">
                                <a
                                    href="/register"
                                    className="inline-block px-8 py-4 mb-4 mr-4 text-lg font-semibold text-white transition duration-200 bg-purple-600 rounded-lg hover:bg-purple-700 md:mb-0"
                                >
                                    Começar Grátis por 7 dias
                                </a>
                                <a
                                    href="#features"
                                    className="inline-block px-8 py-4 text-lg font-semibold text-gray-900 transition duration-200 border border-gray-200 rounded-lg hover:bg-gray-50"
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
                                className="relative z-10 w-full rounded-2xl shadow-2xl"
                            />
                            <div className="absolute top-0 right-0 z-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-purple-100 rounded-full -m-12 w-64 h-64 blur-3xl opacity-50"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
