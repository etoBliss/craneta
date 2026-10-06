import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Thank you — Craneta',
    description: 'Your message is in. We&apos;ll be in touch within one business day.',
    robots: { index: false, follow: false },
}

/**
 * Generic post-action confirmation — shown after a contact form submits
 * or a campaign lands. Single CTA back to the dashboard, plus a soft
 * "what happens next" copy block.
 */
export default function ThankYouPage() {
    return (
        <div className="auth-split">
            <aside className="auth-scene" aria-hidden={false}>
                <div className="auth-scene__logo">
                    <span className="auth-scene__404-badge" aria-hidden>✓</span>
                </div>
                <div className="auth-scene__head">
                    <h2 className="auth-scene__title" style={{ whiteSpace: 'pre-line' }}>
                        Got it.
                        We&apos;re on it.
                    </h2>
                    <p className="auth-scene__sub">
                        Your message landed in our inbox. A real person will read it and reply — usually within a few hours, never more than a day.
                    </p>

                    <div className="auth-scene__steps">
                        <span className="auth-scene__step">
                            <span className="auth-scene__step-num">1</span>
                            <span>Confirming receipt</span>
                        </span>
                        <span className="auth-scene__step">
                            <span className="auth-scene__step-num">2</span>
                            <span>Reading what you sent</span>
                        </span>
                        <span className="auth-scene__step">
                            <span className="auth-scene__step-num">3</span>
                            <span>Reply by email</span>
                        </span>
                    </div>
                </div>

                <div className="auth-scene__stage" aria-hidden>
                    <svg viewBox="0 0 480 360" className="auth-scene__svg">
                        <ellipse cx="240" cy="180" rx="150" ry="80" fill="none"
                                 stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 5" />
                        <g transform="rotate(6 240 190)">
                            <rect x="155" y="110" width="210" height="160" rx="18" fill="#FFFFFF" />
                            <path d="M200 195 L225 220 L280 165" stroke="#0E5E3B" strokeWidth="14"
                                  strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
                    <p className="auth-form__eyebrow">Sent</p>
                    <h1 className="auth-form__title">Thanks for reaching out.</h1>
                    <p className="auth-form__sub">
                        We&apos;ll reply from <strong>hello@craneta.app</strong>. If it&apos;s urgent, just reply to that thread and it&apos;ll route straight back.
                    </p>

                    <div className="thank-you__actions">
                        <Link href="/" className="btn-primary" style={{ width: '100%', padding: '14px 20px' }}>
                            Back to home <span aria-hidden>→</span>
                        </Link>
                        <Link href="/dashboard" className="btn-outline" style={{ width: '100%', padding: '14px 20px', textAlign: 'center' }}>
                            Open my dashboard
                        </Link>
                    </div>

                    <p className="auth-form__alt">
                        Spotted a typo or bug? Email{' '}
                        <a href="mailto:hello@craneta.app" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            hello@craneta.app
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}