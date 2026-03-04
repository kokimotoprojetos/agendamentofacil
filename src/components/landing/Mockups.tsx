'use client';
import React from 'react';
import { motion } from 'framer-motion';

// --- Chat Mockup ---
export const ChatMockup = () => {
    return (
        <div className="w-full max-w-3xl mx-auto mt-16 rounded-t-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#111] border-b border-white/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-xs font-medium text-white/70 uppercase tracking-widest">Agente IA • Salão de Beleza</div>
                <div className="w-12" /> {/* Spacer */}
            </div>

            {/* Chat Content */}
            <div className="p-8 space-y-6">
                {/* AI Message */}
                <div className="flex flex-col items-start max-w-[80%]">
                    <div className="px-5 py-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 text-white/90 text-sm leading-relaxed">
                        Olá! Sou a assistente virtual do **Studio Beauty**. Como posso ajudar você hoje? ✨
                    </div>
                </div>

                {/* User Message */}
                <div className="flex flex-col items-end w-full">
                    <div className="max-w-[80%] px-5 py-3 rounded-2xl rounded-tr-none bg-[#00e676] text-black font-medium text-sm leading-relaxed shadow-lg shadow-[#00e676]/20">
                        Oi! Quero marcar um corte e uma hidratação para sábado de manhã. Tem horário?
                    </div>
                </div>

                {/* AI Message */}
                <div className="flex flex-col items-start max-w-[80%]">
                    <div className="px-5 py-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 text-white/90 text-sm leading-relaxed">
                        Deixa eu conferir... Para sábado (07/03), temos disponibilidade às **09:00h** e às **11:30h**. Qual desses horários fica melhor para você?
                    </div>
                </div>

                {/* User Message */}
                <div className="flex flex-col items-end w-full">
                    <div className="max-w-[80%] px-5 py-3 rounded-2xl rounded-tr-none bg-[#00e676] text-black font-medium text-sm leading-relaxed shadow-lg shadow-[#00e676]/20">
                        Pode ser às 09:00h!
                    </div>
                </div>

                {/* Confirmation Card */}
                <div className="mt-8 border border-[#00e676]/30 bg-[#00e676]/5 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00e676] flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-bold text-white text-base">Agendamento Confirmado!</div>
                        <div className="text-white/60 text-sm mt-1">Sábado, 07 de Março às 09:00h.</div>
                        <div className="text-white/60 text-sm">Serviços: Corte + Hidratação Loreal.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Dashboard Mockup ---
export const DashboardMockup = () => {
    return (
        <div className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mb-1">Visão Geral</div>
                    <div className="text-lg font-medium text-white">Desempenho do seu salão hoje</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#00e676]/10 border border-[#00e676]/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
                    <span className="text-[10px] font-bold text-[#00e676] uppercase tracking-wider">Sistemas Ativos</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                    { label: 'AGENDAMENTOS', val: '18', growth: '+12%', icon: '📅' },
                    { label: 'CONVERSAS', val: '42', growth: '+5%', icon: '💬' },
                    { label: 'CONVERSÃO', val: '24%', growth: '+2%', icon: '⚡' },
                    { label: 'RECEITA', val: 'R$ 1.840', growth: '+18%', icon: '💰' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3 text-white/70">
                            <div className="text-lg">{stat.icon}</div>
                            <div className="text-[10px] font-bold text-[#00e676]">{stat.growth}</div>
                        </div>
                        <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{stat.label}</div>
                        <div className="text-xl font-bold text-white mt-1">{stat.val}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Atividade Recente</div>
                    <div className="text-[10px] font-bold text-[#00e676] uppercase tracking-wider cursor-pointer" aria-label="Ver Agenda">Ver Agenda</div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-900/40 flex items-center justify-center font-bold text-emerald-400 text-xs">MA</div>
                        <div>
                            <div className="text-sm font-bold text-white">Mariana Almeida</div>
                            <div className="text-[10px] text-white/70 uppercase tracking-tight">Corte + Escova • Hoje às 15:30</div>
                        </div>
                    </div>
                    <div className="px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-[9px] font-bold text-orange-400 uppercase">Pendente</div>
                </div>
            </div>
        </div>
    );
};

// --- Chat List Mockup ---
export const ChatListMockup = () => {
    return (
        <div className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden aspect-[4/3] flex">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-white/5 overflow-y-auto">
                <div className="p-4 border-b border-white/5 text-[10px] font-bold text-white/70 uppercase tracking-widest">Conversas IA</div>
                {[
                    { name: 'Juliana Silva', msg: 'Pode confirmar meu horário?', time: '14:22', active: true },
                    { name: 'Ricardo Mendes', msg: 'Quanto custa o corte?', time: '13:45' },
                    { name: 'Ana Paula', msg: 'Tem vaga para hoje?', time: '12:10' },
                    { name: 'Carla Ferreira', msg: 'Obrigada pelo atendimento!', time: 'Ontem' },
                    { name: 'Beatriz Lima', msg: 'Vou me atrasar 5 min', time: 'Ontem' },
                ].map((chat, i) => (
                    <div key={i} className={`p-4 border-b border-white/5 cursor-pointer ${chat.active ? 'bg-[#00e676]/5 border-l-2 border-l-[#00e676]' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white leading-none">{chat.name}</span>
                            <span className="text-[9px] text-white/30">{chat.time}</span>
                        </div>
                        <p className="text-[10px] text-white/70 truncate">{chat.msg}</p>
                    </div>
                ))}
            </div>

            {/* Chat Body */}
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Juliana Silva</span>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />
                        <span className="text-[9px] font-bold text-[#00e676] uppercase">IA Online</span>
                    </div>
                </div>
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    <div className="max-w-[85%] bg-white/5 border border-white/5 rounded-xl p-3 text-[11px] text-white/80 leading-relaxed">
                        Olá Juliana! Vi que você tem interesse em fazer **Coloração**. Temos vaga para amanhã às 10h com a nossa especialista. Pode ser?
                    </div>
                    <div className="ml-auto max-w-[85%] bg-[#00e676] rounded-xl p-3 text-[11px] text-black font-medium leading-relaxed">
                        Sim, perfeito! Pode marcar para mim. Qual o valor aproximado?
                    </div>
                    <div className="max-w-[85%] bg-emerald-900/10 border border-[#00e676]/20 rounded-xl p-3">
                        <div className="text-[9px] font-bold text-[#00e676] mb-1 flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            RESPOSTA IA
                        </div>
                        <p className="text-[11px] text-white/80 leading-relaxed">
                            Agendado! A coloração completa está saindo por **R$ 180,00**. Te esperamos amanhã às 10h! Qualquer dúvida é só chamar. 😉
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Calendar Mockup ---
export const CalendarMockup = () => {
    return (
        <div className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl flex gap-8">
            <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-sm font-bold text-white uppercase tracking-widest">Março 2026</div>
                    <div className="flex gap-2">
                        <button className="p-1 rounded bg-white/5 hover:bg-white/10 transition-colors" aria-label="Mês anterior">
                            <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button className="p-1 rounded bg-white/5 hover:bg-white/10 transition-colors" aria-label="Próximo mês">
                            <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-y-4 text-center">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                        <div key={day} className="text-[10px] font-bold text-white/20">{day}</div>
                    ))}
                    {[...Array(31)].map((_, i) => {
                        const day = i + 1;
                        const isToday = day === 2;
                        return (
                            <div key={i} className="relative py-1 flex items-center justify-center">
                                {isToday && (
                                    <div className="absolute w-8 h-8 rounded-lg bg-[#00e676] shadow-lg shadow-[#00e676]/30" />
                                )}
                                <span className={`relative z-10 text-xs font-bold ${isToday ? 'text-black' : 'text-white/60'}`}>
                                    {day}
                                </span>
                                {day > 22 && day < 30 && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500/40" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-48 shrink-0">
                <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-4">Agenda de hoje</div>
                <div className="space-y-3">
                    {[
                        { time: '09:00', name: 'Ana Paula', service: 'CORTE' },
                        { time: '11:30', name: 'Beatriz L.', service: 'MANICURE' },
                        { time: '14:00', name: 'Carla F.', service: 'COLORAÇÃO' },
                        { time: '15:30', name: 'Mariana A.', service: 'ESCOVA' },
                    ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-[10px] font-bold text-[#00e676] leading-none mb-1">{item.time}</div>
                            <div className="text-xs font-bold text-white leading-none mb-1">{item.name}</div>
                            <div className="text-[9px] text-white/70 uppercase tracking-tight">{item.service}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Services Mockup ---
export const ServicesMockup = () => {
    return (
        <div className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mb-1">Catálogo de Serviços</div>
                    <div className="text-sm font-medium text-white/60">Gerencie seus tratamentos e preços</div>
                </div>
                <div className="px-4 py-2 rounded-full bg-[#00e676] text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer">
                    <span className="text-sm">+</span> Adicionar Serviço
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { name: 'Corte Feminino', price: 'R$ 120', time: '60 min', color: 'text-pink-400' },
                    { name: 'Escova Modelada', price: 'R$ 85', time: '45 min', color: 'text-blue-400' },
                    { name: 'Manicure & Pedicure', price: 'R$ 75', time: '75 min', color: 'text-purple-400' },
                    { name: 'Coloração Premium', price: 'R$ 250', time: '120 min', color: 'text-orange-400' },
                    { name: 'Hidratação Loreal', price: 'R$ 150', time: '50 min', color: 'text-emerald-400' },
                    { name: 'Design Sobrancelha', price: 'R$ 55', time: '30 min', color: 'text-indigo-400' },
                ].map((service, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-3 relative group cursor-pointer hover:border-white/10 transition-all">
                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${service.color}`}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-white mb-1 truncate">{service.name}</div>
                            <div className="text-xs font-bold text-white">{service.price}</div>
                            <div className="text-[9px] text-white/30 flex items-center gap-1 mt-1">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {service.time}
                            </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-3 h-3 text-white/20" fill="currentColor" viewBox="0 0 20 20"><path d="M11.414 10l2.828 2.828-1.414 1.414L10 11.414l-2.828 2.828-1.414-1.414L8.586 10 5.758 7.172l1.414-1.414L10 8.586l2.828-2.828 1.414 1.414L11.414 10z" /></svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
