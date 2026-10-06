import { ImageResponse } from 'next/og'

export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

/**
 * 32×32 favicon, dynamically rasterised from the Craneta mark.
 * Mirrors `public/craneta-icon-green.svg` so a 1× favicon always
 * looks identical to the brand mark used elsewhere.
 */
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: '#0E5E3B',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    borderRadius: 6,
                }}
            >
                C
            </div>
        ),
        { ...size }
    )
}