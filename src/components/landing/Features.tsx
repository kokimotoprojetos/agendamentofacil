'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardMockup, ChatListMockup, CalendarMockup, ServicesMockup } from './Mockups';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface FeatureSectionProps {
    title: string;
    highlight: string;
    description: string;
    mockup: React.ReactNode;
    reverse?: boolean;
    icon?: React.ReactNode;
}

const FeatureSection = ({ title, highlight, description, mockup, reverse, icon }: FeatureSectionProps) => {
    return (
        <section className="py-24 bg-black overflow-hidden">
            <div className="container px-6 mx-auto">
                <div className={`flex flex-col lg:flex-row items-center gap-16 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
                    {/* Text Content */}
                    <div className="flex-1 max-w-xl">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                            {title} <span className="text-[var(--primary)]">{highlight}</span>
                        </h2>
                        <p className="text-lg text-white/50 mb-10 leading-relaxed">
                            {description}
                        </p>
                        <a href="#details" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[var(--primary)] transition-colors group">
                            Ver mais detalhes
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>

                    {/* Mockup Content */}
                    <div className="flex-1 w-full max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: reverse ? -40 : 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="relative p-2 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-sm group">
                                <GlowingEffect
                                    spread={60}
                                    glow={true}
                                    disabled={false}
                                    proximity={64}
                                    inactiveZone={0.01}
                                    borderWidth={3}
                                />
                                <div className="relative rounded-[1.8rem] overflow-hidden border border-white/10 bg-black/50 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                                    {mockup}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const Features = () => {
    return (
        <div id="features" className="divide-y divide-white/5">
            <FeatureSection
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                title="Configuração rápida e"
                highlight="simples"
                description="Sem necessidade de código ou integrações complexas. Conecte seu WhatsApp e deixe nossa IA aprender sobre seus serviços em minutos."
                mockup={<DashboardMockup />}
            />

            <FeatureSection
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                title="Personalize o que sua"
                highlight="IA diz"
                description="O Beautfy foi criado para ser flexível. Crie fluxos personalizados e treine a IA com o tom de voz da sua marca para um atendimento humano."
                mockup={<ChatListMockup />}
                reverse
            />

            <FeatureSection
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                title="Agenda inteligente e"
                highlight="automatizada"
                description="Visualize todos os seus compromissos em um só lugar. Nossa IA organiza sua agenda, evita conflitos de horários e envia lembretes automáticos."
                mockup={<CalendarMockup />}
            />
            <FeatureSection
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Deixe de reagir e"
                highlight="comece a responder"
                description="Nossa IA não apenas responde, ela converte. Ela identifica oportunidades de agendamento e faz o follow-up automático com seis clientes."
                mockup={<ServicesMockup />}
            />
        </div>
    );
};
