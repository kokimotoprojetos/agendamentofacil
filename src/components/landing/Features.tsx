'use client';
import React, { useState } from 'react';
import { GlowingEffect } from '@/components/ui/glowing-effect';

// ─── Static Scene 1: Sleeping owner, ringing phone ─────────────────────────────
const PainScene1 = () => (
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#eef2ff" />
        {/* Stars */}
        {[[30, 18], [70, 35], [150, 12], [230, 28], [285, 45], [110, 50], [200, 40]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.8" fill="#a5b4fc" opacity="0.5" />
        ))}
        {/* Moon */}
        <circle cx="268" cy="30" r="16" fill="#fbbf24" opacity="0.8" />
        <circle cx="278" cy="24" r="13" fill="#eef2ff" />
        {/* Bed */}
        <rect x="55" y="122" width="168" height="22" rx="6" fill="#c7d2fe" />
        <rect x="50" y="108" width="178" height="18" rx="8" fill="#a5b4fc" />
        <rect x="65" y="99" width="55" height="24" rx="11" fill="#f1f5f9" />
        {/* Sleeping person */}
        <ellipse cx="105" cy="107" rx="18" ry="13" fill="#fcd34d" />
        <text x="105" y="112" textAnchor="middle" fontSize="12">😴</text>
        {/* ZZZ */}
        <text x="138" y="96" fontSize="13" fill="#6366f1" fontWeight="bold">z</text>
        <text x="152" y="82" fontSize="17" fill="#6366f1" fontWeight="bold">z</text>
        <text x="168" y="65" fontSize="22" fill="#6366f1" fontWeight="bold">z</text>
        {/* Phone */}
        <g>
            <rect x="218" y="75" width="56" height="96" rx="11" fill="#312e81" stroke="#ef4444" strokeWidth="2.5" />
            <rect x="225" y="85" width="42" height="68" rx="5" fill="#1e1b4b" />
            <rect x="228" y="90" width="32" height="8" rx="4" fill="#22c55e" />
            <rect x="228" y="102" width="26" height="7" rx="3.5" fill="#22c55e" opacity="0.8" />
            <rect x="228" y="113" width="30" height="7" rx="3.5" fill="#22c55e" opacity="0.6" />
            <rect x="228" y="124" width="22" height="7" rx="3.5" fill="#22c55e" opacity="0.4" />
            <circle cx="246" cy="73" r="11" fill="none" stroke="#ef4444" strokeWidth="2.5" />
            <text x="246" y="78" textAnchor="middle" fontSize="12">📵</text>
        </g>
        {/* Footer */}
        <rect x="30" y="170" width="145" height="20" rx="6" fill="#fecaca" opacity="0.9" />
        <text x="102" y="184" textAnchor="middle" fontSize="9.5" fill="#b91c1c" fontWeight="bold">1 cliente perdido às 23h47</text>
    </svg>
);

// ─── Static Scene 2: Double booking chaos ──────────────────────────────────────
const PainScene2 = () => (
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#fef3c7" />
        <rect x="28" y="25" width="126" height="148" rx="8" fill="#fef9c3" stroke="#d97706" strokeWidth="1.5" />
        <rect x="28" y="25" width="126" height="26" rx="8" fill="#f59e0b" />
        <text x="91" y="42" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">AGENDA</text>
        {[65, 82, 99, 116, 133, 150].map((y, i) => (
            <line key={i} x1="38" y1={y} x2="144" y2={y} stroke="#fbbf24" strokeWidth="1" />
        ))}
        {/* Conflict rows */}
        <rect x="40" y="67" width="96" height="13" rx="4" fill="#ef4444" />
        <text x="88" y="77" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">10:00 — Maria ✗</text>
        <rect x="40" y="82" width="96" height="13" rx="4" fill="#ef4444" opacity="0.85" />
        <text x="88" y="92" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">10:00 — Ana ✗</text>
        {/* Regular rows */}
        <rect x="40" y="99" width="68" height="11" rx="3" fill="#fbbf24" opacity="0.4" />
        <text x="74" y="108" textAnchor="middle" fontSize="7.5" fill="#92400e">11:00 — ?</text>
        <rect x="40" y="116" width="80" height="11" rx="3" fill="#fbbf24" opacity="0.4" />
        <text x="80" y="125" textAnchor="middle" fontSize="7.5" fill="#92400e">12:00 — João</text>
        {/* Big X */}
        <line x1="40" y1="67" x2="136" y2="95" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4,3" opacity="0.7" />
        <line x1="136" y1="67" x2="40" y2="95" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4,3" opacity="0.7" />
        {/* Speech bubble */}
        <g>
            <rect x="175" y="30" width="120" height="28" rx="9" fill="#fecaca" />
            <text x="235" y="49" textAnchor="middle" fontSize="9" fill="#b91c1c" fontWeight="bold">"Conflito de horário!"</text>
            <polygon points="210,58 222,58 215,65" fill="#fecaca" />
        </g>
        {/* Angry face */}
        <text x="232" y="102" textAnchor="middle" fontSize="48">😤</text>
        <rect x="168" y="168" width="145" height="20" rx="6" fill="#fecaca" opacity="0.9" />
        <text x="240" y="182" textAnchor="middle" fontSize="9.5" fill="#b91c1c" fontWeight="bold">Agenda manual = caos garantido</text>
    </svg>
);

// ─── Static Scene 3: No-show, money flying ─────────────────────────────────────
const PainScene3 = () => (
    <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#ecfdf5" />
        {/* Chair */}
        <g>
            <rect x="112" y="108" width="90" height="55" rx="10" fill="#bbf7d0" />
            <rect x="118" y="82" width="78" height="38" rx="10" fill="#86efac" />
            <rect x="106" y="106" width="12" height="40" rx="4" fill="#86efac" />
            <rect x="196" y="106" width="12" height="40" rx="4" fill="#86efac" />
        </g>
        {/* Clock */}
        <circle cx="68" cy="75" r="30" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2.5" />
        <circle cx="68" cy="75" r="3" fill="#16a34a" />
        <line x1="68" y1="75" x2="79" y2="61" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="68" y1="75" x2="54" y2="75" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        <text x="68" y="120" textAnchor="middle" fontSize="9.5" fill="#16a34a" fontWeight="bold">Esperando...</text>
        {/* Money */}
        {[
            { x: 202, y: 50 },
            { x: 232, y: 35 },
            { x: 258, y: 52 },
            { x: 278, y: 32 },
        ].map(({ x, y }, i) => (
            <text key={i} x={x} y={y} fontSize={22 - i * 2} fill="#16a34a" opacity={0.7 - i * 0.1}>💸</text>
        ))}
        {/* Ghost */}
        <text x="245" y="115" textAnchor="middle" fontSize="36" opacity="0.6">👻</text>
        <text x="245" y="140" textAnchor="middle" fontSize="9" fill="#16a34a">Cliente sumiu</text>
        <rect x="20" y="170" width="190" height="20" rx="6" fill="#bbf7d0" opacity="0.9" />
        <text x="115" y="184" textAnchor="middle" fontSize="9.5" fill="#166534" fontWeight="bold">Falta sem aviso = horário e $ perdidos</text>
    </svg>
);

// ─── Static Scene 4: WhatsApp message flood ───────────────────────────────────
const PainScene4 = () => {
    const msgs = [
        "Oi, tem horário?", "Qual o valor?", "Pode às 14h?", "Cancela pra mim",
        "E sábado?", "Me confirma!", "Oi sumiu??", "Agenda eu!",
    ];
    return (
        <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#eff6ff" />
            {/* Phone shell */}
            <rect x="18" y="18" width="92" height="162" rx="13" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
            <rect x="25" y="30" width="78" height="140" rx="7" fill="#f8fafc" />
            {/* Messages */}
            {msgs.map((text, i) => {
                const y = 36 + i * 16;
                const w = 40 + text.length * 3.5;
                return (
                    <g key={i}>
                        <rect x="27" y={y} width={Math.min(w, 72)} height="13" rx="6" fill="#22c55e" opacity={1 - i * 0.06} />
                        <text x="30" y={y + 9.5} fontSize="6.5" fill="white" opacity={1 - i * 0.05} fontWeight="600">{text}</text>
                    </g>
                );
            })}
            {/* Notification badge */}
            <circle cx="96" cy="25" r="12" fill="#ef4444" />
            <text x="96" y="30" textAnchor="middle" fontSize="8.5" fill="white" fontWeight="bold">47</text>
            {/* Head exploding */}
            <text x="218" y="90" textAnchor="middle" fontSize="58">🤯</text>
            <rect x="130" y="122" width="168" height="14" rx="5" fill="#dbeafe" opacity="0.95" />
            <text x="214" y="132" textAnchor="middle" fontSize="8.5" fill="#1d4ed8" fontWeight="bold">Você atende sozinho(a) o dia todo</text>
            <rect x="130" y="142" width="168" height="20" rx="6" fill="#fecaca" opacity="0.9" />
            <text x="214" y="156" textAnchor="middle" fontSize="9" fill="#b91c1c" fontWeight="bold">3h/dia no WhatsApp manualmente</text>
        </svg>
    );
};

// ─── Pain cards data ───────────────────────────────────────────────────────────
const PAIN_CARDS = [
    {
        scene: PainScene1,
        without: 'Clientes enviando mensagem à meia-noite e você dormindo',
        withSoftware: 'Agente IA responde e agenda 24h por dia, automaticamente',
        stat: '73% dos clientes não voltam se não forem atendidos rápido',
        borderColor: '#ef4444', statColor: '#b91c1c', statBg: 'rgba(254,226,226,0.7)',
    },
    {
        scene: PainScene2,
        without: 'Dois clientes marcados no mesmo horário toda semana',
        withSoftware: 'Agenda inteligente bloqueia conflitos automaticamente',
        stat: '1 conflito de horário = até R$ 200 em reembolsos',
        borderColor: '#f59e0b', statColor: '#92400e', statBg: 'rgba(254,243,199,0.7)',
    },
    {
        scene: PainScene3,
        without: 'Cliente falta sem aviso e você perde o horário (e o dinheiro)',
        withSoftware: 'Confirmação automática + lista de espera preenche o vazio',
        stat: 'Salões perdem em média R$ 1.200/mês com no-shows',
        borderColor: '#22c55e', statColor: '#166534', statBg: 'rgba(187,247,208,0.6)',
    },
    {
        scene: PainScene4,
        without: 'Você passa 3h por dia respondendo WhatsApp em vez de trabalhar',
        withSoftware: 'IA cuida de tudo. Você foca só no que você sabe fazer',
        stat: '8h de trabalho manual de atendimento podem virar 0 esta semana',
        borderColor: '#6366f1', statColor: '#312e81', statBg: 'rgba(224,231,255,0.7)',
    },
];

export const Features = () => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <section
            id="features"
            className="py-32 relative overflow-hidden bg-transparent"
        >
            <div className="container px-4 mx-auto relative">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-200 bg-rose-50 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span className="text-xs font-bold text-rose-600 tracking-widest uppercase">
                            Sem o Beautfy.ai, isso vai continuar acontecendo
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight text-slate-900">
                        Amanhã de manhã,<br />
                        <span style={{
                            background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>esses problemas ainda estarão lá.</span>
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
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
                                className="relative rounded-3xl overflow-hidden group"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    backdropFilter: 'blur(10px)',
                                    border: `1.5px solid ${isHovered ? card.borderColor : 'rgba(0,0,0,0.06)'}`,
                                    boxShadow: isHovered ? `0 8px 30px rgba(0,0,0,0.08)` : '0 1px 3px rgba(0,0,0,0.04)',
                                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <GlowingEffect
                                    blur={0}
                                    borderWidth={3}
                                    spread={80}
                                    glow={isHovered}
                                    disabled={false}
                                    proximity={64}
                                    inactiveZone={0.01}
                                />
                                {/* Static SVG scene */}
                                <div className="relative h-52 overflow-hidden">
                                    <Scene />
                                    <div className="absolute bottom-0 left-0 right-0 h-16"
                                        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.8), transparent)' }} />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                                            style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fca5a5', borderWidth: 1 }}>
                                            Sem Beautfy.ai
                                        </span>
                                    </div>
                                </div>

                                {/* Text content */}
                                <div className="p-6 pt-4">
                                    {/* Pain */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{ background: 'rgba(239,68,68,0.1)' }}>
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 2L8 8M8 2L2 8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </span>
                                        <p className="text-[15px] font-bold text-slate-800 leading-snug">{card.without}</p>
                                    </div>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
                                        <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">↓ Com o Beautfy.ai</span>
                                        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
                                    </div>

                                    {/* Solution */}
                                    <div className="flex items-start gap-3 mb-5">
                                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{ background: 'rgba(74,222,128,0.15)' }}>
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 5.5l2.5 2.5L8 3" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        <p className="text-[14px] font-medium text-slate-600 leading-snug">{card.withSoftware}</p>
                                    </div>

                                    {/* Stat */}
                                    <div className="px-4 py-3 rounded-2xl border"
                                        style={{ background: card.statBg, borderColor: `${card.borderColor}30` }}>
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
                    <div className="inline-flex flex-col items-center gap-5 px-8 py-9 rounded-3xl max-w-2xl mx-auto w-full"
                        style={{
                            background: 'rgba(238, 242, 255, 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1.5px solid rgba(99,102,241,0.2)',
                        }}>
                        <GlowingEffect
                            spread={40}
                            glow={true}
                            disabled={false}
                            proximity={64}
                            inactiveZone={0.01}
                        />
                        <p className="text-xl font-bold leading-snug text-slate-800">
                            Cada dia que passa,{' '}
                            <span className="text-indigo-600">seu concorrente já está usando automação.</span>
                        </p>
                        <a href="/register"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 32px rgba(124,58,237,0.3)' }}>
                            Começar Agora — É Grátis
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M4 9h10M10 5l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                        <p className="text-xs text-slate-600">Sem cartão de crédito · Cancele quando quiser</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
