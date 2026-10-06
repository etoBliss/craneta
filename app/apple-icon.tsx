import { ImageResponse } from 'next/og'

export const size = {
    width: 180,
    height: 180,
}
export const contentType = 'image/png'

/**
 * Apple touch icon — square emerald tile with white "C" so it stays
 * legible at every iOS Home Screen size without depending on the
 * rasterised SVG (iOS sometimes refuses to colour SVG favicons).
 */
export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: '#0E5E3B',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    borderRadius: 36,
                }}
            >
                C
            </div>
        ),
        { ...size }
    )
}