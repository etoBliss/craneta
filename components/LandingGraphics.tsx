'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * LandingGraphics — collection of reactive SVG illustrations used in
 * the marketing landing page. Each component:
 *   - Scales with its container (preserveAspectRatio + viewBox).
 *   - Reacts to pointer movement (parallax / tilt).
 *   - Respects `prefers-reduced-motion`.
 *
 * Each component is a thin pure-SVG module so it can be server-rendered
 * and only the tilt logic lives in client state.
 */

// ─── Shared hook: parallax tilt ─────────────────────────────────────────────

function useParallax(reference: React.RefObject<HTMLElement | null>, maxDeg = 8) {
    const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        setReduced(mq.matches)
        const onChange = () => setReduced(mq.matches)
        mq.addEventListener?.('change', onChange)
        return () => mq.removeEventListener?.('change', onChange)
    }, [])

    useEffect(() => {
        if (reduced) return
        const el = reference.current
        if (!el) return

        let raf = 0
        let active = false
        let nx = 0
        let ny = 0

        function tick() {
            active = false
            setTilt({ rx: ny * maxDeg, ry: nx * maxDeg })
        }

        function onMove(this: HTMLElement, e: PointerEvent) {
            const r = this.getBoundingClientRect()
            nx = ((e.clientX - r.left) / r.width - 0.5) * 2
            ny = ((e.clientY - r.top) / r.height - 0.5) * 2
            if (!active) {
                active = true
                raf = requestAnimationFrame(tick)
            }
        }
        function onLeave(this: HTMLElement) {
            nx = 0
            ny = 0
            if (!active) {
                active = true
                raf = requestAnimationFrame(tick)
            }
        }
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerleave', onLeave)
        return () => {
            el.removeEventListener('pointermove', onMove)
            el.removeEventListener('pointerleave', onLeave)
            cancelAnimationFrame(raf)
        }
    }, [reduced, reference, maxDeg])

    return tilt
}

type Tilt = { rx: number; ry: number }

/** Wraps children in a 3D-perspective container that tilts toward the cursor. */
function ParallaxSurface({
    children,
    className,
    aspectRatio = '5 / 4',
    maxDeg = 7,
}: {
    children: (tilt: Tilt) => React.ReactNode
    className?: string
    aspectRatio?: string
    maxDeg?: number
}) {
    const ref = useRef<HTMLDivElement | null>(null)
    const tilt: Tilt = useParallax(ref, maxDeg)
    const style: React.CSSProperties = {
        aspectRatio,
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        transformStyle: 'preserve-3d',
    }
    return (
        <div ref={ref} className={className} style={style}>
            {children(tilt)}
        </div>
    )
}

// ─── Passenger 1 — Floating Passport Card ──────────────────────────────────

export function FloatingPassport({ className = '' }: { className?: string }) {
    return (
        <ParallaxSurface className={`relative overflow-hidden ${className}`} maxDeg={6}>
            {(tilt) => (
                <svg viewBox="0 0 600 460" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
                    <defs>
                        <radialGradient id="fpGlow" cx="50%" cy="40%" r="60%">
                            <stop offset="0%" stopColor="#0E5E3B" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#0E5E3B" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="fpCard" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="100%" stopColor="#F5F6F8" />
                        </linearGradient>
                    </defs>
                    <rect width="600" height="460" fill="#F5F6F8" />
                    <ellipse cx="300" cy="200" rx="280" ry="160" fill="url(#fpGlow)" />

                    {/* Tilted card behind */}
                    <g transform={`translate(120,100) rotate(-9) ${tiltToTiltInner(tilt)}`}>
                        <rect width="360" height="220" rx="20" fill="#FFFFFF" stroke="rgba(14,17,22,0.10)" />
                        <rect x="20" y="22" width="40" height="6" rx="3" fill="#0E5E3B" opacity="0.8" />
                        <rect x="20" y="40" width="140" height="6" rx="3" fill="#0E1116" opacity="0.15" />
                        <rect x="20" y="56" width="200" height="6" rx="3" fill="#0E1116" opacity="0.15" />
                        <rect x="20" y="84" width="320" height="3" rx="1.5" fill="#0E1116" opacity="0.1" />
                        <rect x="20" y="96" width="280" height="3" rx="1.5" fill="#0E1116" opacity="0.1" />
                        <rect x="20" y="108" width="300" height="3" rx="1.5" fill="#0E1116" opacity="0.1" />
                        <circle cx="320" cy="180" r="22" fill="#E2EFE7" />
                        <circle cx="320" cy="180" r="8" fill="#0E5E3B" />
                    </g>

                    {/* Front card — chip row */}
                    <g transform={`translate(140,170) rotate(3) ${tiltToTiltInner(tilt, 1)}`}>
                        <rect width="380" height="240" rx="22" fill="url(#fpCard)" stroke="rgba(14,17,22,0.10)" />
                        <circle cx="40" cy="40" r="18" fill="#E2EFE7" />
                        <text x="40" y="46" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0E5E3B" fontFamily="ui-sans-serif">C</text>
                        <rect x="74" y="32" width="180" height="8" rx="3" fill="#0E1116" />
                        <rect x="74" y="50" width="120" height="6" rx="3" fill="#0E1116" opacity="0.3" />
                        <g transform="translate(20,82)">
                            {['Voice', 'Audience', 'Rules'].map((label, i) => (
                                <g key={label} transform={`translate(0, ${i * 36})`}>
                                    <rect width="340" height="28" rx="10" fill="#FFFFFF" stroke="#E6E8EC" />
                                    <circle cx="14" cy="14" r="6" fill="#0E5E3B" opacity="0.4" />
                                    <text x="34" y="18" fontSize="11" fontFamily="ui-sans-serif" fill="#0E1116">{label}</text>
                                    <rect x="260" y="6" width="34" height="16" rx="8" fill="#0E5E3B" />
                                    <text x="277" y="18" fontSize="8" fontFamily="ui-sans-serif" fill="#FFFFFF" fontWeight="700">GPT</text>
                                    <rect x="298" y="6" width="34" height="16" rx="8" fill="#FFFFFF" stroke="#E6E8EC" />
                                    <text x="315" y="18" fontSize="8" fontFamily="ui-sans-serif" fill="#7A8089" fontWeight="700">+</text>
                                </g>
                            ))}
                        </g>
                        <circle cx="350" cy="218" r="20" fill="none" stroke="#0E5E3B" strokeWidth="2" strokeDasharray="2 4" />
                    </g>

                    {/* Floating pill — Synced */}
                    <g transform={`translate(${260 + tilt.ry * 1.5},${420 - tilt.rx * 1.5})`}>
                        <rect x="-50" y="-20" width="100" height="40" rx="999" fill="#0E5E3B" />
                        <circle cx="-26" cy="0" r="5" fill="#FFFFFF" />
                        <text x="6" y="5" fontSize="12" fontFamily="ui-sans-serif" fontWeight="700" fill="#FFFFFF">
                            Synced
                        </text>
                    </g>
                </svg>
            )}
        </ParallaxSurface>
    )
}

// Helper to nudge inner SVG elements as part of the parallax illusion.
function tiltToTiltInner(tilt: { rx: number; ry: number }, scale = 1): string {
    // Make inner translates tiny so the SVG doesn't break alignment.
    return `translate(${(-tilt.ry * 0.5) * scale}, ${(tilt.rx * 0.5) * scale})`
}

// ─── Passenger 2 — Reactive field pulse (used inside the use-cases row) ────

export function FieldPulseGraphic({ className = '' }: { className?: string }) {
    return (
        <ParallaxSurface className={`relative overflow-hidden ${className}`} maxDeg={6}>
            {() => (
                <svg viewBox="0 0 600 460" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
                    <defs>
                        <radialGradient id="fpBack" cx="50%" cy="50%" r="60%">
                            <stop offset="0%" stopColor="#E2EFE7" stopOpacity="0.55" />
                            <stop offset="100%" stopColor="#E2EFE7" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <rect width="600" height="460" fill="#E2EFE7" />
                    <ellipse cx="300" cy="220" rx="320" ry="200" fill="url(#fpBack)" />

                    {/* Concentric orbits that "pulse" outward */}
                    {[170, 130, 90].map((r, i) => (
                        <circle key={r} cx="300" cy="220" r={r} fill="none" stroke="#0E5E3B" strokeOpacity={0.22 - i * 0.05} strokeWidth="1.5">
                            <animate attributeName="r" values={`${r};${r + 30};${r}`} dur={`${3.4 + i * 0.8}s`} repeatCount="indefinite" />
                            <animate attributeName="stroke-opacity" values={`${0.3 - i * 0.06};0;${0.3 - i * 0.06}`} dur={`${3.4 + i * 0.8}s`} repeatCount="indefinite" />
                        </circle>
                    ))}

                    {/* Center node */}
                    <circle cx="300" cy="220" r="44" fill="#0E5E3B" />
                    <text x="300" y="228" textAnchor="middle" fontSize="22" fontFamily="ui-sans-serif" fontWeight="800" fill="#FFFFFF">C</text>

                    {/* Surrounding nodes that orbit */}
                    {[
                        { x: 130, y: 110, label: 'GPT' },
                        { x: 470, y: 110, label: 'AI' },
                        { x: 130, y: 330, label: 'VO' },
                        { x: 470, y: 330, label: 'VS' },
                        { x: 80, y: 220, label: 'S' },
                        { x: 520, y: 220, label: 'M' },
                    ].map((n, i) => (
                        <g key={i}>
                            <line x1="300" y1="220" x2={n.x} y2={n.y} stroke="#0E5E3B" strokeOpacity="0.3" strokeWidth="1.5" />
                            <circle cx={n.x} cy={n.y} r={26} fill="#FFFFFF" stroke="#0E5E3B" strokeWidth="2" />
                            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif" fontWeight="800" fill="#0E5E3B">
                                {n.label}
                            </text>
                        </g>
                    ))}
                </svg>
            )}
        </ParallaxSurface>
    )
}

// ─── Passenger 3 — Editorial collaboration map (3D-ish) ─────────────────────

export function CollaborationMap({ className = '' }: { className?: string }) {
    return (
        <ParallaxSurface className={`relative overflow-hidden ${className}`} maxDeg={6}>
            {(tilt) => (
                <svg viewBox="0 0 600 460" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
                    <defs>
                        <radialGradient id="cmBack" cx="50%" cy="50%" r="60%">
                            <stop offset="0%" stopColor="#E2EFE7" stopOpacity="0.65" />
                            <stop offset="100%" stopColor="#E2EFE7" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <rect width="600" height="460" fill="#E2EFE7" />
                    <ellipse cx="300" cy="220" rx="320" ry="200" fill="url(#cmBack)" />

                    {/* Connecting strands */}
                    {[
                        [300, 220, 150, 120], [300, 220, 450, 120],
                        [300, 220, 150, 320], [300, 220, 450, 320],
                        [300, 220, 80, 220], [300, 220, 520, 220],
                    ].map(([x1, y1, x2, y2], i) => (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0E5E3B" strokeOpacity="0.35" strokeWidth="1.5" />
                    ))}

                    {/* Center node */}
                    <g transform={`translate(${300 + tilt.ry * 0.6}, ${220 + tilt.rx * 0.6})`}>
                        <circle r="56" fill="#0E5E3B" />
                        <text y="8" textAnchor="middle" fontSize="26" fontFamily="ui-sans-serif" fontWeight="800" fill="#FFFFFF">C</text>
                        <circle r="56" fill="none" stroke="#0E5E3B" strokeOpacity="0.25" strokeWidth="2">
                            <animate attributeName="r" values="56;74;56" dur="3s" repeatCount="indefinite" />
                            <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
                        </circle>
                    </g>

                    {/* Surrounding nodes */}
                    {[
                        { x: 150, y: 120, label: 'AM' },
                        { x: 450, y: 120, label: 'JS' },
                        { x: 150, y: 320, label: 'JR' },
                        { x: 450, y: 320, label: 'RK' },
                        { x: 80, y: 220, label: 'SY' },
                        { x: 520, y: 220, label: 'MK' },
                    ].map((n, i) => (
                        <g key={i} transform={`translate(${n.x + tilt.ry * (i % 2 ? -1 : 1) * 0.3}, ${n.y + tilt.rx * (i % 2 ? -1 : 1) * 0.3})`}>
                            <circle r="32" fill="#FFFFFF" stroke="#0E5E3B" strokeWidth="2.5" />
                            <text y="5" textAnchor="middle" fontSize="13" fontFamily="ui-sans-serif" fontWeight="800" fill="#0E5E3B">
                                {n.label}
                            </text>
                        </g>
                    ))}

                    {/* Travelling dots along strands */}
                    <circle r="5" fill="#0E5E3B">
                        <animateMotion dur="4s" repeatCount="indefinite" path="M300,220 Q225,170 150,120" />
                    </circle>
                    <circle r="5" fill="#0E5E3B">
                        <animateMotion dur="4.4s" repeatCount="indefinite" path="M300,220 Q375,170 450,120" />
                    </circle>
                    <circle r="5" fill="#0E5E3B">
                        <animateMotion dur="5s" repeatCount="indefinite" path="M300,220 Q225,270 150,320" />
                    </circle>
                    <circle r="5" fill="#0E5E3B">
                        <animateMotion dur="5.4s" repeatCount="indefinite" path="M300,220 Q375,270 450,320" />
                    </circle>
                </svg>
            )}
        </ParallaxSurface>
    )
}

// ─── Passenger 4 — How it works mini-illustration ──────────────────────────

export function HowItWorksGraphic({ className = '' }: { className?: string }) {
    return (
        <ParallaxSurface className={`relative overflow-hidden ${className}`} maxDeg={5}>
            {(tilt) => (
                <svg viewBox="0 0 600 460" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
                    <defs>
                        <radialGradient id="hwGlow" cx="50%" cy="50%" r="60%">
                            <stop offset="0%" stopColor="#0E5E3B" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#0E5E3B" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="hwCard" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="100%" stopColor="#F5F6F8" />
                        </linearGradient>
                    </defs>
                    <rect width="600" height="460" fill="#E2EFE7" />
                    <ellipse cx="300" cy="230" rx="320" ry="190" fill="url(#hwGlow)" />

                    {/* Stacked tilted cards (3 layers) */}
                    {[
                        { y: 80, rot: -10, scale: 0.85, z: 0 },
                        { y: 100, rot: -3, scale: 0.95, z: 1 },
                        { y: 130, rot: 5, scale: 1, z: 2 },
                    ].map((c, i) => (
                        <g key={i} transform={`translate(${120 + i * 30} ${c.y + tilt.rx * (i - 1) * 0.5}) rotate(${c.rot + tilt.ry * 0.4 * (i - 1)} ${c.scale * 180} ${c.scale * 110}) scale(${c.scale}) translate(${-tilt.ry * (i - 1) * 1.6} ${-tilt.rx * (i - 1) * 1.6})`}>
                            <rect width="360" height="220" rx="20" fill="url(#hwCard)" stroke="rgba(14,17,22,0.10)" />
                            <rect x="22" y="22" width="80" height="10" rx="4" fill="#0E5E3B" />
                            <rect x="22" y="42" width="220" height="6" rx="3" fill="#0E1116" opacity="0.18" />
                            <rect x="22" y="58" width="180" height="6" rx="3" fill="#0E1116" opacity="0.18" />
                            <rect x="22" y="80" width="320" height="3" rx="1.5" fill="#0E1116" opacity="0.10" />
                            <rect x="22" y="92" width="300" height="3" rx="1.5" fill="#0E1116" opacity="0.10" />
                            <rect x="22" y="108" width="260" height="3" rx="1.5" fill="#0E1116" opacity="0.10" />
                            <rect x="22" y="158" width="100" height="32" rx="8" fill="#E2EFE7" />
                            <rect x="32" y="170" width="60" height="4" rx="2" fill="#0E5E3B" />
                            <rect x="32" y="180" width="40" height="3" rx="1.5" fill="#0E1116" opacity="0.3" />
                        </g>
                    ))}

                    {/* Floating chip — Ready */}
                    <g transform={`translate(${440 + tilt.ry * 1.5} ${80 - tilt.rx * 1.5}) rotate(-12)`}>
                        <circle r="40" fill="#FFFFFF" stroke="#0E5E3B" strokeWidth="2" strokeDasharray="3 4" />
                        <text y="-4" textAnchor="middle" fontSize="10" fontFamily="ui-sans-serif" fontWeight="800" fill="#0E5E3B" letterSpacing="0.1em">READY</text>
                        <text y="14" textAnchor="middle" fontSize="18" fontFamily="ui-sans-serif" fontWeight="800" fill="#0E5E3B">NOW</text>
                    </g>

                    {/* Orbiting dots */}
                    {[0, 1, 2, 3].map((i) => (
                        <circle key={i} r="4" fill="#0E5E3B">
                            <animateMotion dur={`${5 + i * 0.6}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} path="M300,230 m-180,0 a180,80 0 1,0 360,0 a180,80 0 1,0 -360,0" />
                        </circle>
                    ))}
                </svg>
            )}
        </ParallaxSurface>
    )
}

// ─── Passenger 5 — Passport preview mock for the prose explainer ───────────

export function PassportMockMini({ className = '' }: { className?: string }) {
    return (
        <ParallaxSurface className={`relative overflow-hidden ${className}`} maxDeg={5}>
            {(tilt) => (
                <svg viewBox="0 0 600 460" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
                    <defs>
                        <linearGradient id="pmmBg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F5F6F8" />
                            <stop offset="100%" stopColor="#FFFFFF" />
                        </linearGradient>
                    </defs>
                    <rect width="600" height="460" fill="url(#pmmBg)" />

                    {/* Card list mock */}
                    <g transform={`translate(70 50) rotateX(${tilt.rx * 0.5}deg) rotateY(${tilt.ry * 0.5}deg)`}>
                        {[
                            { icon: '👤', label: 'Who you are', value: '60%' },
                            { icon: '🎯', label: 'Audience', value: '55%' },
                            { icon: '✍️', label: 'Voice', value: '40%' },
                            { icon: '📏', label: 'Rules', value: '20%' },
                        ].map((row, i) => (
                            <g key={i} transform={`translate(0 ${i * 64})`}>
                                <rect width="460" height="48" rx="12" fill="#FFFFFF" stroke="#E6E8EC" />
                                <rect x="10" y="10" width="28" height="28" rx="8" fill="#E2EFE7" />
                                <text x="24" y="30" textAnchor="middle" fontSize="16" fontFamily="ui-sans-serif">{row.icon}</text>
                                <text x="50" y="22" fontSize="13" fontFamily="ui-sans-serif" fontWeight="600" fill="#0E1116">{row.label}</text>
                                {/* Progress bar */}
                                <rect x="50" y="32" width="320" height="6" rx="3" fill="#E6E8EC" />
                                <rect x="50" y="32" width={320 * (parseInt(row.value) / 100)} height="6" rx="3" fill="#0E5E3B" />
                                <text x="390" y="22" fontSize="11" fontFamily="ui-sans-serif" fontWeight="700" fill="#7A8089">{row.value}</text>
                            </g>
                        ))}
                    </g>
                </svg>
            )}
        </ParallaxSurface>
    )
}
