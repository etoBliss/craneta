'use client'
import { Logo } from '@/components/Logo'
import { motion, useReducedMotion } from 'motion/react'

/**
 * AuthScene — emerald brand panel rendered on the "alternate" side of the
 * auth split (left for signup, right for signin).
 *
 * Layout (top → bottom):
 *  - Reversed Craneta wordmark.
 *  - Big headline + sub copy.
 *  - Numbered step pills.
 *  - Decorative SVG stage: a small passport illustration.
 *  - Footer line.
 *
 * The scene uses still vector artwork so it remains clear, fast, and calm on
 * every device. The form and page state provide the interaction.
 */
export function AuthScene({ mode }: { mode: 'signin' | 'signup' }) {
    const isSignup = mode === 'signup'
    const reduceMotion = useReducedMotion()

    const title = isSignup
        ? 'Choose how\nyou show up.'
        : 'Good to see\nyou again.'

    const sub = isSignup
        ? 'Keep your voice, working style, and priorities ready for the AI chat in front of you.'
        : 'Your contexts are right where you left them. Pick one and get straight to the work.'

    const steps = isSignup
        ? [
            { n: 1, label: 'Choose a context that fits' },
            { n: 2, label: 'Make it sound like you' },
            { n: 3, label: 'Carry it to your next chat' },
        ]
        : [
            { n: 1, label: 'Pick up where you left off' },
            { n: 2, label: 'Choose the context you need' },
            { n: 3, label: 'Get back to the conversation' },
        ]

    return (
        <aside className="auth-scene" aria-hidden={false}>
            {/* Reversed logo */}
            <div className="auth-scene__logo">
                <Logo light size="large" />
            </div>

            {/* Headline */}
            <div className="auth-scene__head">
                <h2 className="auth-scene__title" style={{ whiteSpace: 'pre-line' }}>
                    {title}
                </h2>
                <p className="auth-scene__sub">{sub}</p>

                <div className="auth-scene__steps">
                    {steps.map((s) => (
                        <motion.div key={s.n} className="auth-scene__step" initial={{ opacity: 0, x: reduceMotion ? 0 : -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? 0 : .34, delay: reduceMotion ? 0 : .14 + s.n * .08 }}>
                            <span className="auth-scene__step-num">{s.n}</span>
                            <span>{s.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Decorative SVG stage — fixed aspect on desktop, decorative on mobile */}
            <div className="auth-scene__stage" aria-hidden>
                <svg
                    viewBox="0 0 480 360"
                    className="auth-scene__svg"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        {/* Card gradient — soft emerald surface, no glare */}
                        <linearGradient id="authSceneCardFront" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="100%" stopColor="#F4F8F5" />
                        </linearGradient>
                        <linearGradient id="authSceneCardBack" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#1F8B5E" />
                            <stop offset="100%" stopColor="#0E5E3B" />
                        </linearGradient>
                        {/* Orbital path for the moving passport */}
                        <path
                            id="authSceneOrbit"
                            d="M 240 180 m -150 0 a 150 80 0 1 0 300 0 a 150 80 0 1 0 -300 0"
                        />
                        {/* Radial dot pulse */}
                        <radialGradient id="authSceneDot">
                            <stop offset="0%" stopColor="#9FE3BF" stopOpacity="1" />
                            <stop offset="100%" stopColor="#9FE3BF" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Soft ambient blobs */}
                    <circle cx="60" cy="60" r="90" fill="#FFFFFF" opacity="0.06" />
                    <circle cx="430" cy="320" r="120" fill="#FFFFFF" opacity="0.05" />

                    {/* Orbit guide line */}
                    <ellipse
                        cx="240"
                        cy="180"
                        rx="150"
                        ry="80"
                        fill="none"
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth="1"
                        strokeDasharray="3 5"
                    />

                    {/* Back card (peek-out behind front) */}
                    <g className="auth-scene__card-back">
                        <rect
                            x="135"
                            y="100"
                            width="210"
                            height="160"
                            rx="18"
                            fill="url(#authSceneCardBack)"
                            transform="rotate(-8 240 180)"
                        />
                        <rect
                            x="135"
                            y="100"
                            width="210"
                            height="160"
                            rx="18"
                            fill="none"
                            stroke="rgba(255,255,255,0.35)"
                            strokeWidth="1"
                            transform="rotate(-8 240 180)"
                        />
                    </g>

                    {/* Front card */}
                    <g className="auth-scene__card-front">
                        <rect
                            x="155"
                            y="110"
                            width="210"
                            height="160"
                            rx="18"
                            fill="url(#authSceneCardFront)"
                            transform="rotate(6 240 190)"
                        />
                        {/* Brand chip */}
                        <g transform="rotate(6 240 190)">
                            <rect x="178" y="138" width="36" height="22" rx="6" fill="#0E5E3B" />
                            <rect x="184" y="146" width="24" height="2" rx="1" fill="#FFFFFF" opacity="0.7" />
                            <rect x="184" y="152" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.5" />

                            {/* Rows */}
                            <rect x="178" y="180" width="160" height="6" rx="3" fill="#0E1116" opacity="0.18" />
                            <rect x="178" y="194" width="120" height="6" rx="3" fill="#0E1116" opacity="0.12" />
                            <rect x="178" y="208" width="140" height="6" rx="3" fill="#0E1116" opacity="0.12" />

                            {/* Stamps */}
                            <circle cx="178" cy="240" r="9" fill="#0E5E3B" opacity="0.15" />
                            <circle cx="178" cy="240" r="5" fill="#0E5E3B" />
                            <rect x="196" y="232" width="48" height="4" rx="2" fill="#0E5E3B" opacity="0.6" />
                            <rect x="196" y="242" width="32" height="3" rx="1.5" fill="#0E1116" opacity="0.3" />
                        </g>
                    </g>

                    {/* Context chips move through the route, then settle at the AI lane. */}
                    <motion.circle cx="240" cy="190" r="22" fill="url(#authSceneDot)" opacity="0.28" animate={reduceMotion ? undefined : { r: [17, 30, 17], opacity: [.16, .38, .16] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
                    <circle cx="240" cy="190" r="4" fill="#9FE3BF" />
                    {!reduceMotion && <motion.circle r="6" fill="#D8F1BF" animate={{ cx: [75, 150, 240, 325, 410], cy: [184, 150, 190, 220, 184], opacity: [0, 1, 1, 1, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />}

                    {/* A small static passport marks the orbital path. */}
                    <g transform="translate(390 180) rotate(12)">
                                <rect
                                    x="-22"
                                    y="-15"
                                    width="44"
                                    height="30"
                                    rx="5"
                                    fill="#FFFFFF"
                                    stroke="#0E5E3B"
                                    strokeWidth="1.5"
                                />
                                <circle cx="-14" cy="-7" r="3" fill="#0E5E3B" />
                                <rect x="-8" y="-9" width="14" height="2" rx="1" fill="#0E1116" opacity="0.5" />
                                <rect x="-8" y="-5" width="20" height="1.5" rx="0.75" fill="#0E1116" opacity="0.2" />
                                <rect x="-15" y="2" width="30" height="6" rx="2" fill="#0E5E3B" opacity="0.18" />
                                <rect x="-12" y="4" width="16" height="2" rx="1" fill="#0E5E3B" />
                    </g>

                    {/* Drifting chip — slowly floats up/down */}
                    <motion.g className="auth-scene__chip" animate={reduceMotion ? undefined : { y: [0, -6, 0] }} transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}>
                        <rect x="340" y="60" width="100" height="34" rx="17" fill="#FFFFFF" />
                        <circle cx="358" cy="77" r="5" fill="#0E5E3B" />
                        <rect x="370" y="74" width="60" height="3" rx="1.5" fill="#0E1116" opacity="0.5" />
                        <rect x="370" y="80" width="40" height="2.5" rx="1.25" fill="#0E1116" opacity="0.25" />
                    </motion.g>

                    {/* Drifting chip — second one for depth */}
                    <motion.g className="auth-scene__chip auth-scene__chip--alt" animate={reduceMotion ? undefined : { y: [0, 5, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: .4 }}>
                        <rect x="40" y="240" width="92" height="32" rx="16" fill="#0E5E3B" />
                        <circle cx="58" cy="256" r="5" fill="#9FE3BF" />
                        <rect x="70" y="253" width="50" height="3" rx="1.5" fill="#FFFFFF" opacity="0.85" />
                        <rect x="70" y="259" width="32" height="2.5" rx="1.25" fill="#FFFFFF" opacity="0.5" />
                    </motion.g>
                </svg>
            </div>

            {/* Footer */}
            <div className="auth-scene__footer">
                © 2026 Craneta. Built for AI users who want control.
            </div>
        </aside>
    )
}
