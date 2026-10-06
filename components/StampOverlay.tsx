'use client'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import Icon from '@/components/Icon'

type StampVariant = 'save' | 'inject'

interface StampOverlayProps {
    label: string
    onDone: () => void
    /**
     * 'save' (default) — the quiet flourish shown after saving a page.
     * 'inject' — the "earned" stamp echo shown after a passport is stamped
     * into a tool: a dashed emerald seal descends, imprints, and throws a
     * small particle/ripple burst. Mirrors the landing-page hero stamp.
     */
    variant?: StampVariant
    /** Small line under the label, e.g. "3 pages · clipboard". */
    sublabel?: string
}

// Read the system preference as an external browser store to keep the server render stable.
const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const getReducedMotionServerSnapshot = () => false
const subscribeToReducedMotion = (onChange: () => void) => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
}

// Evenly-spaced burst motes. Deterministic (no RNG) so SSR/first paint match.
const PARTICLES = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2
    const radius = i % 2 === 0 ? 96 : 68
    return { tx: Math.cos(angle) * radius, ty: Math.sin(angle) * radius }
})

export default function StampOverlay({
    label,
    onDone,
    variant = 'save',
    sublabel,
}: StampOverlayProps) {
    const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
    const reduced = useSyncExternalStore(
        subscribeToReducedMotion,
        getReducedMotion,
        getReducedMotionServerSnapshot
    )
    const isInject = variant === 'inject'


    useEffect(() => {
        const holdAt = isInject ? 1900 : 1600
        const doneAt = isInject ? 2400 : 2200
        const hold = setTimeout(() => setPhase('out'), holdAt)
        const done = setTimeout(onDone, doneAt)
        return () => {
            clearTimeout(hold)
            clearTimeout(done)
        }
    }, [onDone, isInject])

    const today = useMemo(
        () =>
            new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }),
        []
    )

    // ── Save variant: the original quiet flourish (unchanged behaviour) ──
    if (!isInject) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                style={{
                    opacity: phase === 'out' ? 0 : 1,
                    transition: phase === 'out' ? 'opacity 0.5s ease-out' : 'none',
                    backgroundColor: phase === 'in' ? 'rgba(10, 42, 30, 0.10)' : 'transparent',
                    backdropFilter: phase === 'in' ? 'blur(2px)' : 'none',
                }}
            >
                <div
                    style={{
                        border: '3px solid var(--primary)',
                        borderRadius: '20px',
                        padding: '22px 32px',
                        backgroundColor: 'var(--white)',
                        transform: phase === 'in' ? 'scale(1)' : 'scale(0.96)',
                        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    <div className="flex flex-col items-center gap-1">
                        <p
                            style={{
                                fontSize: 'var(--fs-12)',
                                fontWeight: 600,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: 'var(--primary)',
                                fontFamily: 'var(--font-display)',
                            }}
                        >
                            Saved to passport
                        </p>
                        <p
                            style={{
                                fontSize: 'var(--fs-20)',
                                fontWeight: 800,
                                color: 'var(--primary)',
                                fontFamily: 'var(--font-display)',
                                marginTop: 4,
                            }}
                        >
                            {label}
                        </p>
                        <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-50)', marginTop: 2 }}>
                            {today}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // ── Inject variant: the "earned" stamp echo ──
    return (
        <div
            className="stamp-echo fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{
                opacity: phase === 'out' ? 0 : 1,
                transition: 'opacity 0.5s ease-out',
                backgroundColor: phase === 'out' ? 'transparent' : 'rgba(10, 42, 30, 0.18)',
                backdropFilter: phase === 'out' ? 'none' : 'blur(3px)',
            }}
            role="status"
            aria-live="polite"
        >
            <div className="stamp-echo__stage">
                {/* Expanding ripple ring (skipped under reduced motion) */}
                {!reduced && <span className="stamp-echo__ripple" aria-hidden />}

                {/* Particle burst (skipped under reduced motion) */}
                {!reduced &&
                    PARTICLES.map((p, i) => (
                        <span
                            key={i}
                            className="stamp-echo__mote"
                            aria-hidden
                            style={
                                {
                                    '--tx': `${p.tx}px`,
                                    '--ty': `${p.ty}px`,
                                } as React.CSSProperties
                            }
                        />
                    ))}

                {/* The descending dashed seal */}
                <div className={'stamp-echo__seal' + (reduced ? ' stamp-echo__seal--static' : '')}>
                    <span className="stamp-echo__ring" aria-hidden />
                    <span className="stamp-echo__mark" aria-hidden>
                        <Icon name="stamp" size={30} />
                    </span>
                </div>
            </div>

            <div className="stamp-echo__caption">
                <p className="stamp-echo__eyebrow">Stamped into</p>
                <p className="stamp-echo__label">{label}</p>
                <p className="stamp-echo__meta">{sublabel ? `${sublabel} · ${today}` : today}</p>
            </div>

            <style jsx>{`
                .stamp-echo__stage {
                    position: relative;
                    width: 180px;
                    height: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stamp-echo__seal {
                    position: relative;
                    width: 132px;
                    height: 132px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform-origin: center;
                    animation: sealDrop 0.55s cubic-bezier(0.22, 1.4, 0.36, 1) both;
                }
                .stamp-echo__seal--static {
                    animation: sealFade 0.4s ease-out both;
                }
                .stamp-echo__ring {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 3px dashed var(--primary);
                    box-shadow: 0 0 0 6px rgba(14, 94, 59, 0.12), inset 0 0 24px rgba(14, 94, 59, 0.18);
                    background: var(--white);
                }
                .stamp-echo__mark {
                    position: relative;
                    color: var(--primary);
                    display: inline-flex;
                }
                .stamp-echo__ripple {
                    position: absolute;
                    width: 132px;
                    height: 132px;
                    border-radius: 50%;
                    border: 2px solid var(--primary);
                    opacity: 0;
                    animation: rippleOut 0.9s ease-out 0.42s both;
                }
                .stamp-echo__mote {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 8px;
                    height: 8px;
                    margin: -4px 0 0 -4px;
                    border-radius: 50%;
                    background: radial-gradient(circle, #6ef2b4 0%, var(--primary) 70%, transparent 100%);
                    opacity: 0;
                    animation: moteFly 0.85s ease-out 0.42s both;
                }
                .stamp-echo__caption {
                    position: absolute;
                    bottom: calc(50% - 190px);
                    left: 0;
                    right: 0;
                    text-align: center;
                    padding: 0 24px;
                }
                .stamp-echo__eyebrow {
                    font-size: var(--fs-12);
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: var(--white);
                    opacity: 0.72;
                    font-family: var(--font-display);
                }
                .stamp-echo__label {
                    font-size: var(--fs-24);
                    font-weight: 800;
                    color: var(--white);
                    font-family: var(--font-display);
                    margin-top: 4px;
                }
                .stamp-echo__meta {
                    font-size: var(--fs-12);
                    color: var(--white);
                    opacity: 0.6;
                    margin-top: 4px;
                }
                @keyframes sealDrop {
                    0% {
                        transform: scale(2.1) translateY(-46px);
                        opacity: 0;
                    }
                    60% {
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1) translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes sealFade {
                    from {
                        opacity: 0;
                        transform: scale(0.94);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes rippleOut {
                    0% {
                        transform: scale(0.6);
                        opacity: 0.7;
                    }
                    100% {
                        transform: scale(2.4);
                        opacity: 0;
                    }
                }
                @keyframes moteFly {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--tx), var(--ty)) scale(0.2);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    )
}
