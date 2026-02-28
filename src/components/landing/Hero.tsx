import React from 'react';

export const Hero = () => {
    return (
        <section className="relative pt-48 pb-24 overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full bg-secondary/50 border border-primary/20 text-primary text-xs font-bold tracking-[0.2em] uppercase">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        IA DE AGENDAMENTO 24/7
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl mb-10 leading-[0.9] text-white">
                        Seu salão no <span className="text-primary">piloto automático</span> com Beautfy.ai
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-400 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
                        Atenda seus clientes, tire dúvidas e realize agendamentos sincronizados com sua agenda 24 horas por dia, direto no WhatsApp.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <a
                            href="/register"
                            className="px-10 py-5 text-xl font-bold text-black bg-primary rounded-2xl hover:bg-[#c5d615] shadow-2xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-tight"
                        >
                            Começar Teste Grátis
                        </a>
                        <a
                            href="#features"
                            className="px-10 py-5 text-xl font-bold text-white border-2 border-primary/30 rounded-2xl hover:bg-primary/10 transition-all uppercase tracking-tight"
                        >
                            Ver Funcionalidades
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
