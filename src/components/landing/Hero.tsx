'use client';
import React from 'react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const ChatMockup = dynamic(() => import('./Mockups').then(m => m.ChatMockup), {
    ssr: false,
    loading: () => <div className="w-full aspect-[4/3] bg-black/20 animate-pulse rounded-2xl" />
});

export const Hero = () => {
    return (
        <section className="relative pt-10 pb-20 bg-[var(--bg-hero)] overflow-hidden">
            {/* Navbar Placeholder inside Hero for requested layout */}
            <nav className="relative z-[100] w-full max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                <BrandLogo size="md" />

                <div className="hidden md:flex items-center space-x-12">
                    <a href="#features" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Funcionalidades</a>
                    <a href="#pricing" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Preços</a>
                    <a href="#about" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Sobre</a>
                </div>

                <div className="flex items-center gap-6">
                    <a href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Entrar</a>
                    <a href="/register" className="px-5 py-2.5 text-xs font-bold text-white bg-[var(--primary)] rounded-full hover:brightness-110 active:scale-95 transition-all">
                        Teste grátis
                    </a>
                </div>
            </nav>

            <div className="container px-6 mx-auto relative z-10 pt-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1
                        className="text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-bold tracking-tight text-slate-900 leading-[1.05] mb-8"
                    >
                        Encontre os clientes que precisam da sua <span className="text-[var(--primary)]">atenção</span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-lg md:text-xl text-slate-700 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Automatize seus agendamentos no WhatsApp com um agente de IA inteligente que entende seu negócio e atende seus clientes 24 horas por dia.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center gap-4 mb-20"
                    >
                        <a
                            href="/register"
                            className="px-8 py-3.5 text-sm font-bold text-white bg-[var(--primary)] rounded-full hover:brightness-110 shadow-lg shadow-[var(--primary)]/20 transition-all active:scale-95"
                        >
                            Começar teste grátis
                        </a>
                        <a
                            href="#demo"
                            className="px-8 py-3.5 text-sm font-bold text-slate-900 border border-slate-200 rounded-full hover:bg-slate-50 transition-all"
                        >
                            Ver demonstração
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="relative p-2 rounded-[2rem] border border-slate-200 bg-white/50 backdrop-blur-sm group">
                            <GlowingEffect
                                spread={60}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative rounded-[1.8rem] overflow-hidden border border-slate-200 bg-white shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                                <ChatMockup />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--primary)]/5 blur-[120px] rounded-full -z-1" />
        </section>
    );
};
