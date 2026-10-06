import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Page not found — Craneta',
    description: 'The page you were looking for has gone travelling. Here are the most useful places to land next.',
    robots: { index: false, follow: false },
}

/**
 * 404 — the brand panel on the left and a recovery list on the right.
 * Mirrors the auth split so returning users feel at home, and uses
 * the same AuthScene SVG stack to keep the visual identity consistent.
 */
export default function NotFound() {
    return (
        <div className="auth-split">
            <aside className="auth-scene" aria-hidden={false}>
                <div className="auth-scene__logo">
                    <span className="auth-scene__404-badge" aria-hidden>
                        404
                    </span>
                </div>
                <div className="auth-scene__head">
                    <h2 className="auth-scene__title" style={{ whiteSpace: 'pre-line' }}>
                        Lost the
                        page.
                    </h2>
                    <p className="auth-scene__sub">
                        That URL didn&apos;t match any passport in our records. It might have been stamped somewhere else, or never existed to begin with.
                    </p>

                    <div className="auth-scene__steps">
                        <span className="auth-scene__step">
                            <span className="auth-scene__step-num">!</span>
                            <span>Wrong link?</span>
                        </span>
                        <span className="auth-scene__step">
                            <span className="auth-scene__step-num">↻</span>
                            <span>Try again</span>
                        </span>
                    </div>
                </div>

                <div className="auth-scene__stage" aria-hidden>
                    <svg viewBox="0 0 480 360" className="auth-scene__svg">
                        <ellipse cx="240" cy="180" rx="150" ry="80" fill="none"
                                 stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 5" />
                        <g transform="rotate(-8 240 180)">
                            <rect x="135" y="100" width="210" height="160" rx="18"
                                  fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.30)" strokeWidth="1" />
                        </g>
                        <g transform="rotate(6 240 190)">
                            <rect x="155" y="110" width="210" height="160" rx="18"
                                  fill="rgba(255,255,255,0.95)" />
                            <text x="260" y="200" textAnchor="middle"
                                  fontFamily="Poppins, sans-serif" fontWeight="800"
                                  fontSize="64" fill="#0E5E3B" opacity="0.85">
                                404
                            </text>
                            <rect x="178" y="232" width="160" height="6" rx="3" fill="#0E1116" opacity="0.18" />
                            <rect x="178" y="246" width="120" height="6" rx="3" fill="#0E1116" opacity="0.12" />
                        </g>
                    </svg>
                </div>

                <div className="auth-scene__footer">
                    © 2026 Craneta. Built for AI users who want control.
                </div>
            </aside>

            <div className="auth-form">
                <div className="auth-form__inner fade-up">
                    <p className="auth-form__eyebrow">Error 404</p>
                    <h1 className="auth-form__title">This page travelled without us.</h1>
                    <p className="auth-form__sub">
                        The link you followed is missing or moved. Pick a destination below and we&apos;ll get you back on track.
                    </p>

                    <ul className="not-found__links">
                        <li>
                            <Link href="/" className="not-found__link">
                                <span className="not-found__link-icon" aria-hidden>←</span>
                                <span>
                                    <strong>Back to home</strong>
                                    <em>See what Craneta does and how it works.</em>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/auth/signin" className="not-found__link">
                                <span className="not-found__link-icon" aria-hidden>↳</span>
                                <span>
                                    <strong>Sign in</strong>
                                    <em>Pick up where you left off.</em>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/auth/signup" className="not-found__link">
                                <span className="not-found__link-icon" aria-hidden>＋</span>
                                <span>
                                    <strong>Start a new passport</strong>
                                    <em>Free, takes under two minutes.</em>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard" className="not-found__link">
                                <span className="not-found__link-icon" aria-hidden>◇</span>
                                <span>
                                    <strong>Open your dashboard</strong>
                                    <em>Jump straight to your pages and inbox.</em>
                                </span>
                            </Link>
                        </li>
                    </ul>

                    <p className="auth-form__alt">
                        Still stuck?{' '}
                        <a href="mailto:hello@craneta.app" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Tell us what you were looking for
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}