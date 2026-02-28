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
 * Light theme variant.
 */
export function BrandLogo({ size = 'md', showTagline = false }: BrandLogoProps) {
    const s = sizes[size];
    const id = `lg-${size}`;

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
                    <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#171915" />
                        <stop offset="100%" stopColor="#070905" />
                    </linearGradient>
                    <linearGradient id={`${id}-mark`} x1="10" y1="10" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#DBED17" />
                        <stop offset="100%" stopColor="#A8B612" />
                    </linearGradient>
                </defs>

                <rect width="52" height="52" rx="14" fill={`url(#${id}-bg)`} stroke="#DBED17" strokeWidth="1.5" />

                <g filter={`url(#${id}-glow)`}>
                    <path
                        d="M26 10 C26 10, 28.5 20, 28.5 26 C28.5 32, 26 42, 26 42 C26 42, 23.5 32, 23.5 26 C23.5 20, 26 10, 26 10Z"
                        fill={`url(#${id}-mark)`}
                    />
                    <path
                        d="M10 26 C10 26, 20 23.5, 26 23.5 C32 23.5, 42 26, 42 26 C42 26, 32 28.5, 26 28.5 C20 28.5, 10 26, 10 26Z"
                        fill={`url(#${id}-mark)`}
                        opacity="0.85"
                    />
                </g>

                <circle cx="26" cy="26" r="2.2" fill="white" opacity="0.95" />
            </svg>

            {/* ── Wordmark ── */}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
                    <span
                        className="font-inter"
                        style={{
                            fontSize: s.wordmark,
                            fontWeight: 800,
                            color: '#ffffff',
                            letterSpacing: '-0.4px',
                        }}
                    >
                        Beautfy
                    </span>
                    <span
                        className="font-bebas"
                        style={{
                            fontSize: s.wordmark * 1.1,
                            fontWeight: 400,
                            letterSpacing: '0.5px',
                            color: '#DBED17',
                        }}
                    >
                        .ai
                    </span>
                </div>
                {showTagline && (
                    <span
                        className="font-inter"
                        style={{
                            fontSize: s.tagline,
                            fontWeight: 600,
                            color: '#DBED17',
                            opacity: 0.8,
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
