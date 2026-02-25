'use client';
import React, { useState } from 'react';

// ─── Pain Scenes — SVG illustrations of what keeps happening WITHOUT the software ───
const PainScene1 = () => (
    // Scene: phone ringing at midnight, owner sleeping, client lost
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="p1bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0a0a18" />
            </radialGradient>
        </defs>
        <rect width="320" height="200" fill="url(#p1bg)" />
        {/* Stars */}
        {[[40, 20], [80, 40], [160, 15], [240, 30], [290, 50], [120, 55], [200, 45]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.2" fill="white" opacity={0.5 + Math.sin(i) * 0.3} />
        ))}
        {/* Moon */}
        <circle cx="270" cy="28" r="14" fill="#1e1b4b" />
        <circle cx="280" cy="22" r="12" fill="#fde68a" opacity="0.9" />
        {/* Bed */}
        <rect x="60" y="120" width="160" height="20" rx="4" fill="#334155" />
        <rect x="55" y="108" width="170" height="16" rx="8" fill="#475569" />
        {/* Pillow */}
        <rect x="70" y="100" width="50" height="22" rx="10" fill="#e2e8f0" />
        {/* Person sleeping */}
        <ellipse cx="105" cy="107" rx="16" ry="12" fill="#fbbf24" />
        <text x="105" y="111" textAnchor="middle" fontSize="10">😴</text>
        {/* ZZZ */}
        <text x="135" y="95" fontSize="11" fill="#94a3b8" fontWeight="bold" opacity="0.8">z</text>
        <text x="148" y="83" fontSize="14" fill="#94a3b8" fontWeight="bold" opacity="0.6">z</text>
        <text x="163" y="68" fontSize="18" fill="#94a3b8" fontWeight="bold" opacity="0.4">z</text>
        {/* Phone ringing (right side) */}
        <rect x="220" y="80" width="50" height="90" rx="10" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
        <rect x="226" y="88" width="38" height="60" rx="4" fill="#0f172a" />
        {/* WhatsApp messages on screen */}
        <rect x="230" y="92" width="28" height="6" rx="3" fill="#22c55e" opacity="0.8" />
        <rect x="230" y="102" width="22" height="5" rx="2.5" fill="#22c55e" opacity="0.6" />
        <rect x="230" y="111" width="26" height="5" rx="2.5" fill="#22c55e" opacity="0.4" />
        {/* Notification ring */}
        <circle cx="245" cy="78" r="10" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.9" />
        <text x="245" y="83" textAnchor="middle" fontSize="11">📵</text>
        {/* Lost client arrow going away */}
        <text x="200" y="175" fontSize="9" fill="#ef4444" opacity="0.8">1 cliente perdido</text>
        <text x="210" y="187" fontSize="9" fill="#94a3b8" opacity="0.5">às 23h47</text>
    </svg>
);

const PainScene2 = () => (
    // Scene: paper calendar chaos, double booking, angry face
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="p2bg" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#1e1228" />
                <stop offset="100%" stopColor="#0a0a18" />
            </radialGradient>
        </defs>
        <rect width="320" height="200" fill="url(#p2bg)" />
        {/* Paper calendar, messy */}
        <rect x="30" y="30" width="120" height="140" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" transform="rotate(-8 90 100)" />
        <rect x="30" y="30" width="120" height="140" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" transform="rotate(-2 90 100)" />
        <rect x="30" y="30" width="120" height="140" rx="6" fill="#0f172a" stroke="#7c3aed" strokeWidth="1.5" />
        {/* Calendar header */}
        <rect x="30" y="30" width="120" height="24" rx="6" fill="#7c3aed" />
        <text x="90" y="46" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">AGENDA</text>
        {/* Calendar lines — crossed out / chaotic */}
        {[65, 80, 95, 110, 125, 140, 155].map((y, i) => (
            <line key={i} x1="40" y1={y} x2="140" y2={y} stroke="#2d3748" strokeWidth="0.8" />
        ))}
        {/* Multiple entries same slot — CONFLICT */}
        <rect x="42" y="67" width="94" height="11" rx="3" fill="#dc2626" opacity="0.8" />
        <text x="89" y="76" textAnchor="middle" fontSize="7.5" fill="white">10:00 — Maria ✗</text>
        <rect x="42" y="80" width="94" height="11" rx="3" fill="#dc2626" opacity="0.6" />
        <text x="89" y="89" textAnchor="middle" fontSize="7.5" fill="white">10:00 — Ana ✗</text>
        {/* Normal slots */}
        <rect x="42" y="95" width="60" height="9" rx="2" fill="#334155" opacity="0.6" />
        <text x="72" y="103" textAnchor="middle" fontSize="7" fill="#94a3b8">11:00 — ??</text>
        {/* Red X over conflict */}
        <line x1="50" y1="62" x2="140" y2="95" stroke="#ef4444" strokeWidth="2" opacity="0.4" strokeDasharray="3,3" />
        {/* Angry emoji on right */}
        <circle cx="240" cy="90" r="40" fill="none" />
        <text x="240" y="70" textAnchor="middle" fontSize="44">😤</text>
        <text x="240" y="130" textAnchor="middle" fontSize="9" fill="#fca5a5">Dois clientes no</text>
        <text x="240" y="143" textAnchor="middle" fontSize="9" fill="#fca5a5">mesmo horário</text>
        {/* Speech bubble */}
        <rect x="170" y="40" width="90" height="25" rx="8" fill="#7f1d1d" />
        <text x="215" y="57" textAnchor="middle" fontSize="8.5" fill="#fca5a5">"Conflito de horário!"</text>
        <polygon points="195,65 205,65 199,72" fill="#7f1d1d" />
        <text x="90" y="178" textAnchor="middle" fontSize="9" fill="#ef4444" opacity="0.8">Agenda manual = conflitos garantidos</text>
    </svg>
);

const PainScene3 = () => (
    // Scene: stream of money flying away, no-show client
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="p3bg" cx="50%" cy="80%" r="80%">
                <stop offset="0%" stopColor="#14290a" />
                <stop offset="100%" stopColor="#0a0a18" />
            </radialGradient>
        </defs>
        <rect width="320" height="200" fill="url(#p3bg)" />
        {/* Empty salon chair */}
        <rect x="120" y="110" width="80" height="50" rx="8" fill="#1e293b" />
        <rect x="125" y="85" width="70" height="35" rx="8" fill="#334155" />
        <rect x="115" y="108" width="10" height="35" rx="3" fill="#334155" />
        <rect x="195" y="108" width="10" height="35" rx="3" fill="#334155" />
        {/* Clock */}
        <circle cx="80" cy="70" r="28" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <circle cx="80" cy="70" r="2.5" fill="#7c3aed" />
        {/* Clock hands */}
        <line x1="80" y1="70" x2="90" y2="58" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="70" x2="68" y2="70" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
        <text x="80" y="112" textAnchor="middle" fontSize="8" fill="#94a3b8">Esperando...</text>
        {/* Money flying away */}
        {[
            { x: 200, y: 40, r: -15, op: 0.9, s: 16 },
            { x: 230, y: 28, r: 5, op: 0.7, s: 14 },
            { x: 255, y: 45, r: 20, op: 0.5, s: 12 },
            { x: 275, y: 30, r: -10, op: 0.35, s: 11 },
            { x: 295, y: 22, r: 8, op: 0.2, s: 10 },
        ].map(({ x, y, r, op, s }, i) => (
            <text key={i} x={x} y={y} fontSize={s} fill="#4ade80" opacity={op}
                transform={`rotate(${r} ${x} ${y})`}>💸</text>
        ))}
        {/* Arrow trailing the money */}
        <path d="M185 50 Q210 35 250 20" stroke="#4ade80" strokeWidth="1.5" fill="none"
            strokeDasharray="4,3" opacity="0.4" />
        {/* No-show text */}
        <text x="160" y="178" textAnchor="middle" fontSize="9" fill="#fca5a5" opacity="0.9">Falta sem aviso = horário perdido</text>
        {/* Client ghost */}
        <text x="246" y="105" textAnchor="middle" fontSize="32" opacity="0.25">👻</text>
        <text x="246" y="135" textAnchor="middle" fontSize="8" fill="#64748b">Cliente sumiu</text>
    </svg>
);

const PainScene4 = () => (
    // Scene: owner drowning in manual WhatsApp messages
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="p4bg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#0c1a2e" />
                <stop offset="100%" stopColor="#0a0a18" />
            </radialGradient>
        </defs>
        <rect width="320" height="200" fill="url(#p4bg)" />
        {/* Phone screen */}
        <rect x="20" y="20" width="85" height="155" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <rect x="26" y="32" width="73" height="134" rx="6" fill="#111827" />
        {/* Whatsapp messages flooding */}
        {[
            { y: 38, w: 56, text: "Oi, tem horário?" },
            { y: 52, w: 62, text: "Qual o valor?" },
            { y: 66, w: 50, text: "Pode às 14h?" },
            { y: 80, w: 65, text: "Cancela pra mim" },
            { y: 94, w: 55, text: "E sábado?" },
            { y: 108, w: 60, text: "Me confirma!" },
            { y: 122, w: 58, text: "Oi sumiu??" },
            { y: 136, w: 52, text: "Agenda eu!" },
            { y: 150, w: 64, text: "Tô esperando…" },
        ].map(({ y, w, text }, i) => (
            <g key={i}>
                <rect x="28" y={y} width={w} height="11" rx="5" fill="#166534" opacity={1 - i * 0.07} />
                <text x="31" y={y + 8} fontSize="5.5" fill="#bbf7d0" opacity={1 - i * 0.07}>{text}</text>
            </g>
        ))}
        {/* Notification badge */}
        <circle cx="94" cy="28" r="9" fill="#ef4444" />
        <text x="94" y="32" textAnchor="middle" fontSize="7.5" fill="white" fontWeight="bold">47</text>
        {/* Overwhelmed business owner */}
        <text x="210" y="85" textAnchor="middle" fontSize="52">🤯</text>
        <text x="210" y="125" textAnchor="middle" fontSize="9" fill="#fca5a5">Você atende sozinho(a)</text>
        <text x="210" y="138" textAnchor="middle" fontSize="9" fill="#fca5a5">no WhatsApp o dia todo</text>
        {/* Hours wasted */}
        <rect x="145" y="148" width="130" height="20" rx="6" fill="#7f1d1d" opacity="0.7" />
        <text x="210" y="162" textAnchor="middle" fontSize="8.5" fill="#fecaca">3h/dia atendendo manualmente</text>
    </svg>
);

// ─── Pain cards data ───────────────────────────────────────────────────────────
const PAIN_CARDS = [
    {
        scene: PainScene1,
        without: 'Clientes enviando mensagem à meia-noite e você dormindo',
        withSoftware: 'Agente IA responde e agenda 24h por dia, automaticamente',
        stat: '73% dos clientes não voltam se não forem atendidos rápido',
        accentColor: 'from-rose-500/20 to-rose-900/10',
        borderColor: 'border-rose-500/20',
        statColor: 'text-rose-400',
    },
    {
        scene: PainScene2,
        without: 'Dois clientes marcados no mesmo horário toda semana',
        withSoftware: 'Agenda inteligente bloqueia conflitos automaticamente',
        stat: '1 conflito de horário = até R$ 200 em reembolsos e constrangimentos',
        accentColor: 'from-amber-500/20 to-amber-900/10',
        borderColor: 'border-amber-500/20',
        statColor: 'text-amber-400',
    },
    {
        scene: PainScene3,
        without: 'Cliente falta sem aviso e você perde o horário (e o dinheiro)',
        withSoftware: 'Confirmação automática + lista de espera preenche o vazio',
        stat: 'Salões perdem em média R$ 1.200/mês com no-shows',
        accentColor: 'from-emerald-500/20 to-emerald-900/10',
        borderColor: 'border-emerald-500/20',
        statColor: 'text-emerald-400',
    },
    {
        scene: PainScene4,
        without: 'Você passa 3h por dia respondendo WhatsApp em vez de trabalhar',
        withSoftware: 'IA cuida de tudo. Você foca só no que você sabe fazer',
        stat: '8h de trabalho manual de atendimento pode virar 0 ainda esta semana',
        accentColor: 'from-violet-500/20 to-violet-900/10',
        borderColor: 'border-violet-500/20',
        statColor: 'text-violet-400',
    },
];

export const Features = () => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <section id="features" className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #020617 0%, #0a0a1c 50%, #020617 100%)' }}>
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="container px-4 mx-auto relative">
                {/* Header — pain-first framing */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        <span className="text-xs font-semibold text-rose-400 tracking-widest uppercase">Sem o Beautfy.ai, isso vai continuar acontecendo</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ color: '#f8fafc' }}>
                        Amanhã de manhã,<br />
                        <span style={{ background: 'linear-gradient(90deg, #f87171, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            esses problemas ainda estarão lá.
                        </span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Cada dia sem automação é dinheiro saindo pelo ralo. Veja o que acontece nos bastidores do seu salão enquanto você tenta fazer tudo manualmente.
                    </p>
                </div>

                {/* Pain cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {PAIN_CARDS.map((card, i) => {
                        const Scene = card.scene;
                        const isHovered = hovered === i;
                        return (
                            <div
                                key={i}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                                className={`relative rounded-3xl border overflow-hidden transition-all duration-500 cursor-default ${card.borderColor} ${isHovered ? 'scale-[1.02] shadow-2xl' : ''}`}
                                style={{ background: 'linear-gradient(135deg, #0d1117 0%, #0f172a 100%)' }}
                            >
                                {/* Visual Scene — the "pain" illustration */}
                                <div className={`relative h-52 overflow-hidden transition-all duration-500 ${isHovered ? 'opacity-80' : 'opacity-60'}`}>
                                    <Scene />
                                    {/* Gradient overlay at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 h-20"
                                        style={{ background: 'linear-gradient(to top, #0f172a, transparent)' }} />
                                    {/* "SEM o Beautfy" badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-rose-900/80 text-rose-300 border border-rose-800">
                                            Sem Beautfy.ai
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 pt-3">
                                    {/* The pain — what keeps happening */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 2L8 8M8 2L2 8" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
                                            </svg>
                                        </span>
                                        <p className="text-[15px] font-semibold text-slate-200 leading-snug">
                                            {card.without}
                                        </p>
                                    </div>

                                    {/* Divider with arrow */}
                                    <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 h-px bg-white/5" />
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M7 2v10M3 8l4 4 4-4" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Com o Beautfy.ai
                                        </div>
                                        <div className="flex-1 h-px bg-white/5" />
                                    </div>

                                    {/* The solution */}
                                    <div className="flex items-start gap-3 mb-5">
                                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 5.5l2.5 2.5L8 3" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        <p className="text-[14px] text-slate-400 leading-snug">
                                            {card.withSoftware}
                                        </p>
                                    </div>

                                    {/* Stat callout */}
                                    <div className={`px-4 py-3 rounded-2xl bg-gradient-to-r ${card.accentColor} border ${card.borderColor}`}>
                                        <p className={`text-[12px] font-semibold leading-relaxed ${card.statColor}`}>
                                            📊 {card.stat}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA strip at bottom */}
                <div className="text-center">
                    <div className="inline-flex flex-col items-center gap-5 px-8 py-8 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 max-w-2xl mx-auto w-full">
                        <p className="text-xl font-bold text-white leading-snug">
                            Cada dia que passa,<br />
                            <span style={{ color: '#a5b4fc' }}>seu concorrente já está usando automação.</span>
                        </p>
                        <a
                            href="/register"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-all active:scale-95 hover:shadow-indigo-500/40 hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                        >
                            Começar Agora — É Grátis
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M4 9h10M10 5l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                        <p className="text-xs text-slate-500">Sem cartão de crédito · Cancele quando quiser</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
