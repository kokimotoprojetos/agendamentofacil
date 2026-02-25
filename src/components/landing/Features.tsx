'use client';
import React, { useState } from 'react';

// ─── Pain Scenes — brighter, high-contrast SVG illustrations ─────────────────

const PainScene1 = () => (
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Background — dark blue-purple, not black */}
        <rect width="320" height="200" fill="#1a1040" />
        {/* Stars */}
        {[[30, 18], [70, 35], [150, 12], [230, 28], [285, 45], [110, 50], [200, 40]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity="0.7" />
        ))}
        {/* Moon */}
        <circle cx="268" cy="30" r="16" fill="#fde68a" opacity="0.95" />
        <circle cx="278" cy="24" r="13" fill="#1a1040" />
        {/* Bed frame */}
        <rect x="55" y="122" width="168" height="22" rx="6" fill="#3b2d6e" />
        <rect x="50" y="108" width="178" height="18" rx="8" fill="#4c3a8a" />
        {/* Pillow */}
        <rect x="65" y="99" width="55" height="24" rx="11" fill="#e2e8f0" />
        {/* Person */}
        <ellipse cx="105" cy="107" rx="18" ry="13" fill="#fcd34d" />
        <text x="105" y="112" textAnchor="middle" fontSize="12">😴</text>
        {/* ZZZs — bright */}
        <text x="138" y="96" fontSize="13" fill="#a5b4fc" fontWeight="bold">z</text>
        <text x="152" y="82" fontSize="17" fill="#a5b4fc" fontWeight="bold" opacity="0.8">z</text>
        <text x="168" y="65" fontSize="22" fill="#a5b4fc" fontWeight="bold" opacity="0.6">z</text>
        {/* Phone — bright red border */}
        <rect x="218" y="75" width="56" height="96" rx="11" fill="#1e1b4b" stroke="#f87171" strokeWidth="2.5" />
        <rect x="225" y="85" width="42" height="68" rx="5" fill="#111827" />
        {/* WhatsApp chat bubbles */}
        <rect x="228" y="90" width="32" height="8" rx="4" fill="#22c55e" />
        <rect x="228" y="102" width="26" height="7" rx="3.5" fill="#22c55e" opacity="0.8" />
        <rect x="228" y="113" width="30" height="7" rx="3.5" fill="#22c55e" opacity="0.6" />
        <rect x="228" y="124" width="22" height="7" rx="3.5" fill="#22c55e" opacity="0.4" />
        {/* Ring notification */}
        <circle cx="246" cy="73" r="11" fill="none" stroke="#f87171" strokeWidth="2.5" />
        <text x="246" y="78" textAnchor="middle" fontSize="12">📵</text>
        {/* Footer label */}
        <rect x="30" y="170" width="145" height="20" rx="6" fill="#7f1d1d" opacity="0.85" />
        <text x="102" y="184" textAnchor="middle" fontSize="9.5" fill="#fca5a5" fontWeight="bold">1 cliente perdido às 23h47</text>
    </svg>
);

const PainScene2 = () => (
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#1c1030" />
        {/* Paper agenda */}
        <rect x="28" y="25" width="126" height="148" rx="8" fill="#2d1f5e" stroke="#6d28d9" strokeWidth="1.5" />
        {/* Header */}
        <rect x="28" y="25" width="126" height="26" rx="8" fill="#7c3aed" />
        <text x="91" y="42" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">AGENDA</text>
        {/* Hour lines */}
        {[65, 82, 99, 116, 133, 150].map((y, i) => (
            <line key={i} x1="38" y1={y} x2="144" y2={y} stroke="#4c1d95" strokeWidth="1" />
        ))}
        {/* DOUBLE BOOKING */}
        <rect x="40" y="67" width="96" height="13" rx="4" fill="#dc2626" />
        <text x="88" y="77" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">10:00 — Maria ✗</text>
        <rect x="40" y="82" width="96" height="13" rx="4" fill="#dc2626" opacity="0.85" />
        <text x="88" y="92" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">10:00 — Ana ✗</text>
        {/* Normal rows */}
        <rect x="40" y="99" width="68" height="11" rx="3" fill="#4c1d95" />
        <text x="74" y="108" textAnchor="middle" fontSize="7.5" fill="#c4b5fd">11:00 — ?</text>
        <rect x="40" y="116" width="80" height="11" rx="3" fill="#4c1d95" />
        <text x="80" y="125" textAnchor="middle" fontSize="7.5" fill="#c4b5fd">12:00 — João</text>
        {/* Big X over conflict */}
        <line x1="40" y1="67" x2="136" y2="95" stroke="#f87171" strokeWidth="2.5" strokeDasharray="4,3" opacity="0.7" />
        <line x1="136" y1="67" x2="40" y2="95" stroke="#f87171" strokeWidth="2.5" strokeDasharray="4,3" opacity="0.7" />
        {/* Right side: angry face + speech bubble */}
        <rect x="175" y="30" width="120" height="28" rx="9" fill="#7f1d1d" />
        <text x="235" y="49" textAnchor="middle" fontSize="9" fill="#fecaca" fontWeight="bold">"Conflito de horário!"</text>
        <polygon points="210,58 222,58 215,65" fill="#7f1d1d" />
        <text x="232" y="100" textAnchor="middle" fontSize="48">😤</text>
        <rect x="168" y="168" width="145" height="20" rx="6" fill="#7f1d1d" opacity="0.85" />
        <text x="240" y="182" textAnchor="middle" fontSize="9.5" fill="#fca5a5" fontWeight="bold">Agenda manual = caos garantido</text>
    </svg>
);

const PainScene3 = () => (
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#0f1f10" />
        {/* Empty salon chair — bright */}
        <rect x="112" y="108" width="90" height="55" rx="10" fill="#1e3a1e" />
        <rect x="118" y="82" width="78" height="38" rx="10" fill="#2d5a2d" />
        <rect x="106" y="106" width="12" height="40" rx="4" fill="#2d5a2d" />
        <rect x="196" y="106" width="12" height="40" rx="4" fill="#2d5a2d" />
        {/* Clock — high contrast */}
        <circle cx="68" cy="75" r="30" fill="#1a2e1a" stroke="#4ade80" strokeWidth="2.5" />
        <circle cx="68" cy="75" r="3" fill="#4ade80" />
        <line x1="68" y1="75" x2="79" y2="61" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="68" y1="75" x2="54" y2="75" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        <text x="68" y="120" textAnchor="middle" fontSize="9.5" fill="#86efac" fontWeight="bold">Esperando...</text>
        {/* Money flying away — bright */}
        {[
            { x: 202, y: 45, r: -18, op: 1.0, s: 20 },
            { x: 232, y: 30, r: 5, op: 0.85, s: 18 },
            { x: 258, y: 48, r: 22, op: 0.65, s: 15 },
            { x: 278, y: 28, r: -12, op: 0.45, s: 13 },
            { x: 298, y: 18, r: 8, op: 0.25, s: 11 },
        ].map(({ x, y, r, op, s }, i) => (
            <text key={i} x={x} y={y} fontSize={s} fill="#4ade80" opacity={op}
                transform={`rotate(${r} ${x} ${y})`}>💸</text>
        ))}
        {/* Trail */}
        <path d="M188 55 Q220 38 260 20" stroke="#4ade80" strokeWidth="1.8" fill="none"
            strokeDasharray="5,3" opacity="0.5" />
        {/* Ghost client */}
        <text x="245" y="112" textAnchor="middle" fontSize="36" opacity="0.5">👻</text>
        <text x="245" y="140" textAnchor="middle" fontSize="9" fill="#86efac">Cliente sumiu</text>
        <rect x="20" y="170" width="190" height="20" rx="6" fill="#14532d" opacity="0.9" />
        <text x="115" y="184" textAnchor="middle" fontSize="9.5" fill="#86efac" fontWeight="bold">Falta sem aviso = horário e $ perdidos</text>
    </svg>
);

const PainScene4 = () => (
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#0c1a2e" />
        {/* Phone */}
        <rect x="18" y="18" width="92" height="162" rx="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
        <rect x="25" y="30" width="78" height="140" rx="7" fill="#0f172a" />
        {/* WhatsApp messages — bright green */}
        {[
            { y: 36, w: 60, text: "Oi, tem horário?" },
            { y: 52, w: 66, text: "Qual o valor?" },
            { y: 68, w: 54, text: "Pode às 14h?" },
            { y: 84, w: 68, text: "Cancela pra mim" },
            { y: 100, w: 58, text: "E sábado?" },
            { y: 116, w: 64, text: "Me confirma!" },
            { y: 132, w: 62, text: "Oi sumiu??" },
            { y: 148, w: 56, text: "Agenda eu!" },
        ].map(({ y, w, text }, i) => (
            <g key={i}>
                <rect x="27" y={y} width={w} height="13" rx="6" fill="#16a34a" opacity={1 - i * 0.06} />
                <text x="30" y={y + 9.5} fontSize="6.5" fill="#dcfce7" opacity={1 - i * 0.05} fontWeight="600">{text}</text>
            </g>
        ))}
        {/* Notification badge — big and red */}
        <circle cx="96" cy="25" r="11" fill="#ef4444" />
        <text x="96" y="30" textAnchor="middle" fontSize="8.5" fill="white" fontWeight="bold">47</text>
        {/* Owner overwhelmed */}
        <text x="218" y="90" textAnchor="middle" fontSize="58">🤯</text>
        <rect x="130" y="120" width="168" height="15" rx="5" fill="#1e3a5f" opacity="0.95" />
        <text x="214" y="131" textAnchor="middle" fontSize="8.5" fill="#7dd3fc" fontWeight="bold">Você atende sozinho(a) o dia todo</text>
        <rect x="130" y="142" width="168" height="20" rx="6" fill="#7c1818" opacity="0.9" />
        <text x="214" y="156" textAnchor="middle" fontSize="9" fill="#fca5a5" fontWeight="bold">3h/dia no WhatsApp manualmente</text>
    </svg>
);

// ─── Pain cards data ───────────────────────────────────────────────────────────
const PAIN_CARDS = [
    {
        scene: PainScene1,
        without: 'Clientes enviando mensagem à meia-noite e você dormindo',
        withSoftware: 'Agente IA responde e agenda 24h por dia, automaticamente',
        stat: '73% dos clientes não voltam se não forem atendidos rápido',
        accentColor: 'rgba(239,68,68,0.15)',
        borderColor: '#f87171',
        statColor: '#fca5a5',
        statBg: 'rgba(127,29,29,0.6)',
    },
    {
        scene: PainScene2,
        without: 'Dois clientes marcados no mesmo horário toda semana',
        withSoftware: 'Agenda inteligente bloqueia conflitos automaticamente',
        stat: '1 conflito de horário = até R$ 200 em reembolsos e constrangimentos',
        accentColor: 'rgba(245,158,11,0.15)',
        borderColor: '#fbbf24',
        statColor: '#fde68a',
        statBg: 'rgba(120,53,15,0.6)',
    },
    {
        scene: PainScene3,
        without: 'Cliente falta sem aviso e você perde o horário (e o dinheiro)',
        withSoftware: 'Confirmação automática + lista de espera preenche o vazio',
        stat: 'Salões perdem em média R$ 1.200/mês com no-shows',
        accentColor: 'rgba(74,222,128,0.12)',
        borderColor: '#4ade80',
        statColor: '#86efac',
        statBg: 'rgba(20,83,45,0.6)',
    },
    {
        scene: PainScene4,
        without: 'Você passa 3h por dia respondendo WhatsApp em vez de trabalhar',
        withSoftware: 'IA cuida de tudo. Você foca só no que você sabe fazer',
        stat: '8h de trabalho manual de atendimento podem virar 0 esta semana',
        accentColor: 'rgba(129,140,248,0.12)',
        borderColor: '#818cf8',
        statColor: '#c7d2fe',
        statBg: 'rgba(49,46,129,0.6)',
    },
];

export const Features = () => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <section
            id="features"
            className="py-32 relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #020617 0%, #0d1117 50%, #020617 100%)' }}
        >
            {/* Soft glow behind section */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.06]"
                    style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="container px-4 mx-auto relative">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        <span className="text-xs font-bold text-rose-300 tracking-widest uppercase">
                            Sem o Beautfy.ai, isso vai continuar acontecendo
                        </span>
                    </div>
                    <h2
                        className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight"
                        style={{ color: '#f1f5f9' }}
                    >
                        Amanhã de manhã,<br />
                        <span style={{
                            background: 'linear-gradient(90deg, #f87171 0%, #fb923c 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            esses problemas ainda estarão lá.
                        </span>
                    </h2>
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
                        Cada dia sem automação é dinheiro saindo pelo ralo. Veja o que acontece nos bastidores
                        do seu salão enquanto você tenta fazer tudo manualmente.
                    </p>
                </div>

                {/* Pain cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-16">
                    {PAIN_CARDS.map((card, i) => {
                        const Scene = card.scene;
                        const isHovered = hovered === i;
                        return (
                            <div
                                key={i}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                                className={`relative rounded-3xl overflow-hidden transition-all duration-400 ${isHovered ? 'scale-[1.02]' : ''}`}
                                style={{
                                    background: 'linear-gradient(145deg, #111827 0%, #1a1f2e 100%)',
                                    border: `1.5px solid ${isHovered ? card.borderColor : 'rgba(255,255,255,0.08)'}`,
                                    boxShadow: isHovered ? `0 0 30px ${card.accentColor}` : 'none',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                {/* Scene illustration — fully opaque */}
                                <div className="relative h-52 overflow-hidden">
                                    <Scene />
                                    {/* Gradient fade at bottom */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-16"
                                        style={{ background: 'linear-gradient(to top, #111827, transparent)' }}
                                    />
                                    {/* Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span
                                            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                                            style={{ background: 'rgba(127,29,29,0.85)', color: '#fca5a5', borderColor: '#f87171', borderWidth: 1 }}
                                        >
                                            Sem Beautfy.ai
                                        </span>
                                    </div>
                                </div>

                                {/* Text content */}
                                <div className="p-6 pt-4">
                                    {/* Pain */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <span
                                            className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{ background: 'rgba(239,68,68,0.2)' }}
                                        >
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 2L8 8M8 2L2 8" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </span>
                                        <p className="text-[15px] font-bold text-white leading-snug">
                                            {card.without}
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                                        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                                            ↓ Com o Beautfy.ai
                                        </span>
                                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                                    </div>

                                    {/* Solution */}
                                    <div className="flex items-start gap-3 mb-5">
                                        <span
                                            className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{ background: 'rgba(74,222,128,0.2)' }}
                                        >
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 5.5l2.5 2.5L8 3" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        <p className="text-[14px] font-medium text-slate-300 leading-snug">
                                            {card.withSoftware}
                                        </p>
                                    </div>

                                    {/* Stat */}
                                    <div
                                        className="px-4 py-3 rounded-2xl border"
                                        style={{ background: card.statBg, borderColor: `${card.borderColor}40` }}
                                    >
                                        <p className="text-[12.5px] font-semibold leading-relaxed" style={{ color: card.statColor }}>
                                            📊 {card.stat}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA strip */}
                <div className="text-center">
                    <div
                        className="inline-flex flex-col items-center gap-5 px-8 py-9 rounded-3xl max-w-2xl mx-auto w-full"
                        style={{
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #2d1b69 100%)',
                            border: '1.5px solid rgba(129,140,248,0.3)',
                        }}
                    >
                        <p className="text-xl font-bold leading-snug" style={{ color: '#e2e8f0' }}>
                            Cada dia que passa,{' '}
                            <span style={{ color: '#a5b4fc' }}>seu concorrente já está usando automação.</span>
                        </p>
                        <a
                            href="/register"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
                            }}
                        >
                            Começar Agora — É Grátis
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M4 9h10M10 5l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                        <p className="text-xs text-slate-400">Sem cartão de crédito · Cancele quando quiser</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
