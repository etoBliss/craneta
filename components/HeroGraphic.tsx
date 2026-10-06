'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * HeroGraphic — reactive 3D passport mock.
 *
 * What it does:
 * 1. A stack of two passport cards (front page + a tilted back page) sit
 *    inside an SVG container.
 * 2. An orbiting ring rotates around them continuously at a slow pace.
 * 3. As the cursor moves across the hero, the whole stack parallaxes:
 *    a CSS 3D transform (`rotateX` / `rotateY`) tilts toward the cursor
 *    with a soft spring. The orbit ring and floating tags tilt the
 *    opposite way for depth illusion.
 * 4. Auto-rotates by ~3° when idle so the depth reads even when nobody
 *    is moving the mouse.
 * 5. On viewports < 640px the parallax stays disabled and the
 *    auto-rotation amplitude is reduced.
 * 6. Honors `prefers-reduced-motion`.
 */
export function HeroGraphic() {
    const wrapRef = useRef<HTMLDivElement | null>(null)
    const stackRef = useRef<HTMLDivElement | null>(null)
    const orbitRef = useRef<SVGSVGElement | null>(null)
    const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        setReduced(mq.matches)
        const onChange = () => setReduced(mq.matches)
        mq.addEventListener?.('change', onChange)
        return () => mq.removeEventListener?.('change', onChange)
    }, [])

    // Parallax: track pointer position relative to the wrap, normalize
    // to -1..1, then convert to a clamped tilt. Throttled via rAF.
    useEffect(() => {
        if (reduced) return

        const wrap = wrapRef.current
        if (!wrap) return

        let raf = 0
        let next = { rx: 0, ry: 0 }
        let active = false

        function tick() {
            active = false
            setTilt(next)
        }

        function onMove(this: HTMLDivElement, e: PointerEvent) {
            const rect = this.getBoundingClientRect()
            const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
            const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2
            // Clamp so the tilt doesn't get silly at the extremes.
            next = {
                ry: Math.max(-1, Math.min(1, nx)) * 10,
                rx: Math.max(-1, Math.min(1, -ny)) * 8,
            }
            if (!active) {
                active = true
                raf = requestAnimationFrame(tick)
            }
        }

        function onLeave() {
            next = { rx: 0, ry: 0 }
            if (!active) {
                active = true
                raf = requestAnimationFrame(tick)
            }
        }

        wrap.addEventListener('pointermove', onMove)
        wrap.addEventListener('pointerleave', onLeave)
        return () => {
            wrap.removeEventListener('pointermove', onMove)
            wrap.removeEventListener('pointerleave', onLeave)
            cancelAnimationFrame(raf)
        }
    }, [reduced])

    // Continuous orbit rotation
    useEffect(() => {
        const orbit = orbitRef.current
        if (!orbit) return
        if (reduced) {
            orbit.style.animation = 'none'
            return
        }
        orbit.style.animation = 'orbitSpin 14s linear infinite'
    }, [reduced])

    // Derived CSS transform for the inner stack — small easings,
    // perspective set in CSS so we keep the markup slim.
    const stackStyle: React.CSSProperties = {
        transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
    }
    const orbitStyle: React.CSSProperties = {
        transform: `perspective(900px) rotateX(${-tilt.rx * 0.6}deg) rotateY(${-tilt.ry * 0.6}deg)`,
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
    }

    return (
        <div ref={wrapRef} className="hero-graphic relative w-full max-w-xl mx-auto select-none">
            {/* Style injection — keyframes are tiny, fits inline. */}
            <style jsx>{`
                @keyframes orbitSpin { from { transform: rotateZ(0deg); } to { transform: rotateZ(360deg); } }
                @keyframes floatBadge { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                @media (prefers-reduced-motion: reduce) {
                    .hero-graphic :global(svg) { animation: none !important; }
                }
            `}</style>

            <div className="hero-graphic__stage relative" style={stackStyle} ref={stackRef}>
                <Orbit style={orbitStyle} orbitRef={orbitRef} />

                {/* Back passport — tilted, faded. */}
                <PassportCard
                    className="hero-graphic__passport hero-graphic__passport--back"
                    variant="back"
                />

                {/* Front passport — clean, in focus. */}
                <PassportCard
                    className="hero-graphic__passport hero-graphic__passport--front"
                    variant="front"
                />

                {/* Floating tags — drift gently opposite to the cursor. */}
                <div
                    className="hero-graphic__tag hero-graphic__tag--live"
                    style={{
                        transform: `translate3d(${tilt.ry * 0.8}px, ${tilt.rx * 0.8}px, 0)`,
                        animation: reduced ? 'none' : 'floatBadge 4.4s ease-in-out infinite',
                    }}
                >
                    <span className="hero-graphic__tag-dot" />
                    Live
                </div>

                <div
                    className="hero-graphic__tag hero-graphic__tag--saved"
                    style={{
                        transform: `translate3d(${tilt.ry * 0.6}px, ${-tilt.rx * 0.6}px, 0)`,
                        animation: reduced ? 'none' : 'floatBadge 5.2s ease-in-out infinite 0.6s',
                    }}
                >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Saved
                </div>
            </div>
        </div>
    )
}

/** Decorative orbital ring drawn as inline SVG. */
function Orbit({ style, orbitRef }: { style: React.CSSProperties; orbitRef: React.Ref<SVGSVGElement> }) {
    return (
        <svg
            ref={orbitRef}
            viewBox="0 0 600 460"
            className="hero-graphic__orbit absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="xMidYMid meet"
            style={style}
            aria-hidden
        >
            <defs>
                <radialGradient id="orbitCore" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0E5E3B" stopOpacity="0.16" />
                    <stop offset="60%" stopColor="#0E5E3B" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="orbitRing" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0E5E3B" stopOpacity="0" />
                    <stop offset="50%" stopColor="#0E5E3B" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#0E5E3B" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Soft ambient glow behind the cards. */}
            <ellipse cx="300" cy="240" rx="240" ry="150" fill="url(#orbitCore)" />
            {/* Primary orbit ring. */}
            <ellipse cx="300" cy="240" rx="270" ry="170" fill="none" stroke="rgba(14, 94, 59, 0.18)" strokeWidth="1" />
            {/* Brighter accent ring — dashes give it motion. */}
            <ellipse
                cx="300" cy="240" rx="240" ry="148"
                fill="none" stroke="url(#orbitRing)" strokeWidth="2"
                strokeDasharray="3 7"
            />
            {/* Travelling dot on the outer ring. */}
            <circle cx="300" cy="70" r="5" fill="#0E5E3B" />
            <circle cx="300" cy="70" r="9" fill="none" stroke="#0E5E3B" strokeOpacity="0.25" strokeWidth="2" />
        </svg>
    )
}

interface PassportCardProps {
    className?: string
    variant: 'front' | 'back'
}

/**
 * A passport card mock — pure SVG so it scales perfectly on every
 * viewport. The front variant shows an active "Writing voice" page
 * with chips; the back variant shows the spine and a faint page
 * edge to add depth.
 */
function PassportCard({ className, variant }: PassportCardProps) {
    if (variant === 'back') {
        return (
            <svg
                viewBox="0 0 600 380"
                className={className}
                preserveAspectRatio="xMidYMid meet"
                aria-hidden
            >
                <defs>
                    <linearGradient id="backShine" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1A1D24" />
                        <stop offset="100%" stopColor="#0E1116" />
                    </linearGradient>
                </defs>
                {/* Outer card */}
                <rect x="30" y="40" width="500" height="300" rx="22" fill="url(#backShine)" />
                {/* Spine highlight */}
                <rect x="30" y="40" width="14" height="300" rx="6" fill="#000" opacity="0.4" />
                <rect x="50" y="40" width="2" height="300" fill="rgba(255,255,255,0.06)" />
                {/* Faint page edge on the right */}
                <rect x="510" y="58" width="6" height="264" fill="#000" opacity="0.45" />
                {/* Title stamp at top-right (the embossed seal) */}
                <circle cx="480" cy="110" r="22" fill="none" stroke="#0E5E3B" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="3 4" />
                {/* Bottom signature line */}
                <rect x="80" y="290" width="180" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
            </svg>
        )
    }

    return (
        <svg
            viewBox="0 0 600 380"
            className={className}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
        >
            <defs>
                <linearGradient id="cardBody" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#FBFCFC" />
                </linearGradient>
                <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
                    <feOffset dy="6" />
                    <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {/* Card */}
            <g filter="url(#cardShadow)">
                <rect x="10" y="10" width="580" height="360" rx="20" fill="url(#cardBody)" stroke="rgba(14,17,22,0.10)" />
            </g>

            {/* Top chrome */}
            <rect x="10" y="10" width="580" height="44" rx="20" fill="#F5F6F8" />
            <rect x="10" y="44" width="580" height="10" fill="#F5F6F8" />
            <circle cx="32" cy="32" r="5" fill="#E6E8EC" />
            <circle cx="50" cy="32" r="5" fill="#E6E8EC" />
            <circle cx="68" cy="32" r="5" fill="#E6E8EC" />
            <rect x="180" y="22" width="240" height="20" rx="10" fill="#FFFFFF" stroke="rgba(14,17,22,0.06)" />
            <text x="300" y="36" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#7A8089" letterSpacing="0.05em">
                craneta / context
            </text>

            {/* Body — page header */}
            <g transform="translate(36, 86)">
                <text fontSize="10" fontFamily="ui-sans-serif, system-ui" fill="#7A8089" letterSpacing="0.18em" fontWeight="600">
                    PAGE
                </text>
                <text y="28" fontSize="22" fontFamily="ui-sans-serif, system-ui" fill="#0E1116" fontWeight="700">
                    Writing voice for AI
                </text>

                {/* Tool pill — three buttons, primary one filled */}
                <g transform="translate(412, 8)">
                    <rect width="124" height="30" rx="15" fill="#FFFFFF" stroke="#E6E8EC" />
                    <rect x="3" y="3" width="38" height="24" rx="12" fill="#0E5E3B" />
                    <text x="22" y="19" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#FFFFFF" fontWeight="600">
                        Both
                    </text>
                    <text x="61" y="19" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#4A4F58" fontWeight="500">
                        GPT
                    </text>
                    <text x="100" y="19" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#4A4F58" fontWeight="500">
                        Claude
                    </text>
                </g>
            </g>

            {/* Chips — three rows */}
            <g transform="translate(36, 200)">
                {[
                    { id: 'audience', label: 'Audience', det: 'founder · builders', tone: '#0E5E3B' },
                    { id: 'voice', label: 'Voice', det: 'direct · precise', tone: '#0E5E3B' },
                    { id: 'rules', label: 'Rules', det: 'no fluff · cite sources', tone: '#0E5E3B' },
                ].map((c, i) => (
                    <g key={c.id} transform={`translate(0, ${i * 56})`}>
                        <rect x="0" y="0" width="528" height="44" rx="12" fill="#FFFFFF" stroke="#E6E8EC" />
                        <g transform="translate(10, 10)">
                            <rect width="24" height="24" rx="6" fill="#E2EFE7" />
                            <circle cx="12" cy="12" r="4" fill="#0E5E3B" />
                        </g>
                        <text x="48" y="18" fontSize="13" fontFamily="ui-sans-serif, system-ui" fill="#0E1116" fontWeight="600">
                            {c.label}
                        </text>
                        <text x="48" y="34" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#7A8089">
                            {c.det}
                        </text>
                        {/* Model pills on the right */}
                        <g transform="translate(440, 12)">
                            <rect width="36" height="20" rx="10" fill="#0E5E3B" />
                            <text x="18" y="14" textAnchor="middle" fontSize="9" fill="#FFFFFF" fontFamily="ui-sans-serif, system-ui" fontWeight="700">
                                GPT
                            </text>
                            <rect x="42" width="40" height="20" rx="10" fill="none" stroke="#E6E8EC" />
                            <text x="62" y="14" textAnchor="middle" fontSize="9" fill="#7A8089" fontFamily="ui-sans-serif, system-ui" fontWeight="700">
                                Claude
                            </text>
                        </g>
                    </g>
                ))}
            </g>

            {/* Footer status bar */}
            <g transform="translate(36, 358)">
                <circle cx="0" cy="-2" r="3" fill="#0E5E3B" />
                <text x="10" y="2" fontSize="10" fontFamily="ui-sans-serif, system-ui" fill="#7A8089">
                    Auto-synced to your models
                </text>
            </g>
        </svg>
    )
}
