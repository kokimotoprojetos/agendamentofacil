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
                {/* Letter B mark */}
                <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', fontFamily: 'Inter' }}>B</div>
            </div>
        ),
        { ...size },
    );
}
