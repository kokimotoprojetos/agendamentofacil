'use client';
import React from 'react';
import { CircularTestimonials } from '@/components/ui/circular-testimonials';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { FaWhatsapp, FaArrowRight } from 'react-icons/fa';

const testimonials = [
    {
        quote: "Meus clientes mandavam mensagem meia-noite e eu perdia o sono tentando responder todo mundo. Com a Beautfy.ai, minha agenda se preenche sozinha enquanto eu descanso.",
        name: "Juliana Silva",
        designation: "Proprietária de Esmalteria",
        src: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=800&auto=format&fit=crop",
    },
    {
        quote: "O caos da agenda de papel me fazia perder clientes por erros de marcação dupla. Agora, o sistema bloqueia conflitos e eu não perco mais um centavo com reembolsos.",
        name: "Ricardo Santos",
        designation: "Barbeiro Profissional",
        src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800&auto=format&fit=crop",
    },
    {
        quote: "O 'no-show' era meu maior prejuízo. As confirmações automáticas pelo WhatsApp reduziram minhas faltas em 90%. É dinheiro que parou de sair pelo ralo.",
        name: "Carla Oliveira",
        designation: "Esteticista",
        src: "https://images.unsplash.com/photo-1555681948-391f46394e80?q=80&w=800&auto=format&fit=crop",
    },
    {
        quote: "Eu não tinha tempo para atender as clientes porque não parava de responder o celular. Recuperei meu tempo e foco total no meu trabalho manual.",
        name: "Beatriz Costa",
        designation: "Hair Stylist",
        src: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=800&auto=format&fit=crop",
    },
];

export const Features = () => {
    return (
        <section id="features" className="py-32 relative overflow-hidden bg-transparent">
            <div className="container px-4 mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-secondary/30 mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">
                            RESULTADOS QUE FALAM POR SI
                        </span>
                    </div>

                    <h2 className="text-5xl md:text-7xl lg:text-8xl mb-8 text-white leading-[0.9]">
                        Pare de <span className="text-primary">queimar dinheiro</span><br />
                        com processos manuais.
                    </h2>

                    <p className="text-slate-400 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed font-medium">
                        Veja o que acontece nos bastidores dos salões que trocaram o caos pela inteligência artificial do Beautfy.ai.
                    </p>
                </div>

                {/* Circular Testimonials Component */}
                <div className="mb-32">
                    <CircularTestimonials
                        testimonials={testimonials}
                        autoplay={true}
                        colors={{
                            name: "#ffffff",
                            designation: "#DBED17",
                            testimony: "#e2e8f0",
                            arrowBackground: "#2E3823",
                            arrowForeground: "#DBED17",
                            arrowHoverBackground: "#DBED17",
                        }}
                    />
                </div>

                {/* CTA strip */}
                <div className="max-w-6xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 p-10 md:p-16 rounded-[2rem] border border-white/10 glass">
                        <div className="max-w-2xl text-center md:text-left">
                            <h3 className="text-4xl md:text-6xl mb-6 text-white leading-tight">
                                Seu concorrente já está <span className="text-primary italic">automatizando</span>.
                            </h3>
                            <p className="text-slate-400 text-lg md:text-xl font-medium">
                                Não deixe sua agenda nas mãos do acaso. Recupere 3h do seu dia hoje mesmo.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <a href="/register"
                                className="group relative inline-flex items-center gap-4 px-10 py-6 rounded-2xl text-xl font-black text-black bg-primary transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(219,237,23,0.3)]">
                                COMEÇAR AGORA GRATUITAMENTE
                                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </a>
                            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Sem cartão de crédito · Cancele quando quiser</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
