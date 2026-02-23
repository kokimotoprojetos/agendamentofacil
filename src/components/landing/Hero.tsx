import React from 'react';

export const Hero = () => {
    return (
        <section className="relative pt-40 pb-20 overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full glass border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider animate-fade-up">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        IA DE AGENDAMENTO 24/7
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-fade-up text-gradient" style={{ animationDelay: '0.1s' }}>
                        Seu salão no piloto automático com <span className="text-indigo-500">Beautfy.ai</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        Atenda seus clientes, tire dúvidas e realize agendamentos sincronizados com sua agenda 24 horas por dia, 7 dias por semana, direto no WhatsApp.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                        <a
                            href="/register"
                            className="px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-500/25 transition-all hover:-translate-y-1 active:scale-95"
                        >
                            Começar Teste Grátis
                        </a>
                        <a
                            href="#features"
                            className="px-8 py-4 text-lg font-semibold text-slate-300 border border-white/10 rounded-2xl hover:bg-white/5 transition-all"
                        >
                            Ver Funcionalidades
                        </a>
                    </div>
                </div>

                <div className="mt-24 relative max-w-5xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-20"></div>
                    <div className="relative glass rounded-[2rem] overflow-hidden p-2">
                        <img
                            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
                            alt="Beautfy.ai Dashboard Preview"
                            className="w-full rounded-3xl object-cover shadow-2xl"
                        />
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600 rounded-full blur-[120px] opacity-10 -z-10"></div>
                    <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-600 rounded-full blur-[120px] opacity-10 -z-10"></div>
                </div>
            </div>
        </section>
    );
};
