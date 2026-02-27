import React from 'react';

export const Hero = () => {
    return (
        <section className="relative pt-40 pb-20 overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold tracking-wider">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                        IA DE AGENDAMENTO 24/7
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-gradient">
                        Seu salão no piloto automático com <span className="text-indigo-600">Beautfy.ai</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Atenda seus clientes, tire dúvidas e realize agendamentos sincronizados com sua agenda 24 horas por dia, 7 dias por semana, direto no WhatsApp.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href="/register"
                            className="px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-500/25 transition-all active:scale-95"
                        >
                            Começar Teste Grátis
                        </a>
                        <a
                            href="#features"
                            className="px-8 py-4 text-lg font-semibold text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
                        >
                            Ver Funcionalidades
                        </a>
                    </div>
                </div>

                <div className="mt-24 relative max-w-5xl mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-10"></div>
                    <div className="relative glass rounded-[2rem] overflow-hidden p-2">
                        <img
                            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
                            alt="Beautfy.ai Dashboard Preview"
                            className="w-full rounded-3xl object-cover shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
