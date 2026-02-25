'use client';

import React from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

interface BrandLogoProps {
    size?: LogoSize;
    showTagline?: boolean;
}

const sizes = {
    sm: { badge: 34, wordmark: 17, tagline: 8.5, gap: 10 },
    md: { badge: 42, wordmark: 21, tagline: 9.5, gap: 12 },
    lg: { badge: 52, wordmark: 26, tagline: 11, gap: 14 },
};

/**
 * BrandLogo — premium mark for Beautfy.ai.
 * Inspired by luxury beauty & tech brands (Sephora, Notion, Linear).
 *
 * Icon: a geometric "diamond spark" monogram — reads as both a
 * beauty highlight and an AI sparkle, without the kitsch of scissors.
 */
export function BrandLogo({ size = 'md', showTagline = false }: BrandLogoProps) {
    const s = sizes[size];
    const id = `lg-${size}`; // unique gradient ID per size

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: s.gap, flexShrink: 0 }}>
            {/* ── Icon Badge ── */}
            <svg
                width={s.badge}
                height={s.badge}
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0, display: 'block' }}
                aria-hidden="true"
            >
                <defs>
                    {/* Background gradient */}
                    <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#1e1b4b" />
                        <stop offset="100%" stopColor="#0f0c29" />
                    </linearGradient>
                    {/* Mark gradient */}
                    <linearGradient id={`${id}-mark`} x1="10" y1="10" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#c4b5fd" />
                        <stop offset="50%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Badge background */}
                <rect width="52" height="52" rx="14" fill={`url(#${id}-bg)`} />

                {/* Subtle top-left shimmer */}
                <rect width="52" height="52" rx="14" fill="url(#shimmer)" opacity="0.07" />
                <defs>
                    <linearGradient id="shimmer" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="40%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* ── Diamond Spark Mark ── */}
                {/*
          The mark is a 4-pointed diamond star (like a beauty highlight / AI sparkle),
          drawn with clean Bézier curves: professional, geometric, memorable.
        */}
                <g filter={`url(#${id}-glow)`}>
                    {/* Vertical axis of the star */}
                    <path
                        d="M26 10 C26 10, 28.5 20, 28.5 26 C28.5 32, 26 42, 26 42 C26 42, 23.5 32, 23.5 26 C23.5 20, 26 10, 26 10Z"
                        fill={`url(#${id}-mark)`}
                    />
                    {/* Horizontal axis of the star */}
                    <path
                        d="M10 26 C10 26, 20 23.5, 26 23.5 C32 23.5, 42 26, 42 26 C42 26, 32 28.5, 26 28.5 C20 28.5, 10 26, 10 26Z"
                        fill={`url(#${id}-mark)`}
                        opacity="0.85"
                    />
                </g>

                {/* Center dot — the focal point */}
                <circle cx="26" cy="26" r="2.2" fill="white" opacity="0.95" />
            </svg>

            {/* ── Wordmark ── */}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span
                        style={{
                            fontSize: s.wordmark,
                            fontWeight: 800,
                            color: '#ffffff',
                            letterSpacing: '-0.4px',
                            fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
                        }}
                    >
                        Beautfy
                    </span>
                    <span
                        style={{
                            fontSize: s.wordmark,
                            fontWeight: 800,
                            letterSpacing: '-0.4px',
                            background: 'linear-gradient(90deg, #a78bfa 0%, #c4b5fd 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
                        }}
                    >
                        .ai
                    </span>
                </div>
                {showTagline && (
                    <span
                        style={{
                            fontSize: s.tagline,
                            fontWeight: 600,
                            color: '#475569',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            marginTop: 4,
                        }}
                    >
                        Salon &amp; Barber
                    </span>
                )}
            </div>
        </div>
    );
}
