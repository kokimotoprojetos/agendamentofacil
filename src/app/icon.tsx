import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Favicon — diamond spark mark matching the BrandLogo.
 * 4-pointed star on a deep navy background.
 */
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #0f0c29 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* 4-pointed diamond spark — vertical axis */}
                <svg width="20" height="20" viewBox="0 0 52 52" fill="none">
                    {/* Vertical blade */}
                    <path
                        d="M26 8 C26 8, 29 19, 29 26 C29 33, 26 44, 26 44 C26 44, 23 33, 23 26 C23 19, 26 8, 26 8Z"
                        fill="url(#v)"
                    />
                    {/* Horizontal blade */}
                    <path
                        d="M8 26 C8 26, 19 23, 26 23 C33 23, 44 26, 44 26 C44 26, 33 29, 26 29 C19 29, 8 26, 8 26Z"
                        fill="url(#h)"
                        opacity="0.85"
                    />
                    {/* Center dot */}
                    <circle cx="26" cy="26" r="2.5" fill="white" opacity="0.95" />
                    <defs>
                        <linearGradient id="v" x1="26" y1="8" x2="26" y2="44" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#c4b5fd" />
                            <stop offset="0.5" stopColor="#a78bfa" />
                            <stop offset="1" stopColor="#7c3aed" />
                        </linearGradient>
                        <linearGradient id="h" x1="8" y1="26" x2="44" y2="26" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#c4b5fd" />
                            <stop offset="0.5" stopColor="#a78bfa" />
                            <stop offset="1" stopColor="#7c3aed" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        ),
        { ...size },
    );
}
