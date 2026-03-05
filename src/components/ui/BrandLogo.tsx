'use client';

import React from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

interface BrandLogoProps {
    size?: LogoSize;
    showTagline?: boolean;
    hideText?: boolean;
    light?: boolean; // Prop to force light/dark text if needed
}

const sizes = {
    sm: { badge: 34, wordmark: 17, tagline: 8.5, gap: 10 },
    md: { badge: 42, wordmark: 21, tagline: 9.5, gap: 12 },
    lg: { badge: 52, wordmark: 26, tagline: 11, gap: 14 },
};

/**
 * BrandLogo — premium mark for Beautfy.ai.
 * Adaptable color for light/dark backgrounds.
 */
export function BrandLogo({ size = 'md', showTagline = false, hideText = false, light = false }: BrandLogoProps) {
    const s = sizes[size];

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: s.gap, flexShrink: 0 }}>
            {/* ── Badge / Icon ── */}
            <div
                style={{
                    width: s.badge,
                    height: s.badge,
                    background: 'linear-gradient(135deg, #f46025 0%, #ff8c5a 100%)',
                    borderRadius: s.badge * 0.35,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px -4px rgba(244, 96, 37, 0.4)',
                    flexShrink: 0
                }}
            >
                <div style={{ width: '45%', height: '45%', border: '3px solid white', borderRadius: '4px' }} />
            </div>

            {!hideText && (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
                        <span
                            className="font-inter"
                            style={{
                                fontSize: s.wordmark,
                                fontWeight: 800,
                                color: light ? '#ffffff' : '#0f172a',
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
                                color: '#f46025',
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
                                color: '#f46025',
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
            )}
        </div>
    );
}
