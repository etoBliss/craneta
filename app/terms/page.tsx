import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata: Metadata = {
    title: 'Terms — Craneta',
    description: 'The terms under which Craneta is provided. Plain language, no surprises: you own your content, you can leave any time, we&apos;ll keep the service available.',
    alternates: { canonical: '/terms' },
}

export default function TermsPage() {
    const lastUpdated = 'August 17, 2026'
    const contactEmail = 'hello@craneta.app'

    return (
        <div className="legal">
            <header className="legal__nav">
                <Link href="/" aria-label="Craneta home" className="legal__brand">
                    <Logo light={false} />
                </Link>
                <Link href="/" className="legal__back">← Back to home</Link>
            </header>

            <main className="legal__main">
                <p className="legal__eyebrow">Terms</p>
                <h1 className="legal__title">Use Craneta, and let us host your context.</h1>
                <p className="legal__updated">Last updated {lastUpdated}</p>

                <section className="legal__summary">
                    <h2>Short version</h2>
                    <ul>
                        <li><strong>You keep ownership of everything you write.</strong> We only host it for you.</li>
                        <li><strong>Don&apos;t break the law or harm others.</strong> No abuse, no spam, no scraping the service to train a competing product.</li>
                        <li><strong>The service is provided as-is.</strong> We work hard to keep it reliable, but software breaks; back up anything important.</li>
                        <li><strong>We may change pricing or features with notice.</strong> You can always export and leave.</li>
                    </ul>
                </section>

                <section className="legal__section">
                    <h2>1. Your account</h2>
                    <p>You&apos;re responsible for your password and for what happens under your account. Use a unique password. If you think someone else has signed in as you, change your password from <Link href="/dashboard/settings" style={{ color: 'var(--primary)' }}>Settings</Link> right away.</p>
                </section>

                <section className="legal__section">
                    <h2>2. Your content</h2>
                    <p>You retain full ownership of every passport page, field, version, and inbox note you create. You give us a limited licence to host, render, and transmit that content solely to operate the service on your behalf. We never sell it, train on it, or use it for advertising.</p>
                </section>

                <section className="legal__section">
                    <h2>3. Acceptable use</h2>
                    <p>Don&apos;t use Craneta to:</p>
                    <ul>
                        <li>Break any law or regulation</li>
                        <li>Harass, threaten, or impersonate anyone</li>
                        <li>Send spam or unsolicited bulk content</li>
                        <li>Reverse-engineer or scrape the service to build a competing product</li>
                        <li>Upload content you don&apos;t have the right to upload (e.g. someone else&apos;s private data)</li>
                    </ul>
                    <p>We may suspend or terminate accounts that violate these rules, with notice when possible.</p>
                </section>

                <section className="legal__section">
                    <h2>4. Service availability</h2>
                    <p>We aim for 99% uptime but provide the service &quot;as is&quot; without warranty of uninterrupted access. We&apos;ll communicate planned maintenance in advance when we can.</p>
                </section>

                <section className="legal__section">
                    <h2>5. Pricing &amp; changes</h2>
                    <p>Today Craneta is free. If we introduce paid plans in the future, existing free users will be grandfathered at their current tier for at least 12 months, and we&apos;ll give 30 days&apos; notice before any change touches them.</p>
                </section>

                <section className="legal__section">
                    <h2>6. Termination</h2>
                    <p>You can delete your account at any time from <Link href="/dashboard/profile" style={{ color: 'var(--primary)' }}>your profile</Link>. We may suspend accounts that breach these terms; we&apos;ll normally warn first and explain what to fix.</p>
                </section>

                <section className="legal__section">
                    <h2>7. Disclaimers &amp; liability</h2>
                    <p>The service is provided &quot;as is&quot; and &quot;as available&quot;. To the maximum extent permitted by law, we exclude all warranties (express or implied) and limit our total liability to the fees you&apos;ve paid in the past 12 months (currently £0). Some jurisdictions don&apos;t allow these limits — in which case the local minimum applies.</p>
                </section>

                <section className="legal__section">
                    <h2>8. Governing law</h2>
                    <p>These terms are governed by the laws of the Federal Republic of Nigeria. Disputes will be resolved in the courts of Lagos State.</p>
                </section>

                <section className="legal__section">
                    <h2>9. Contact</h2>
                    <p>Questions, complaints, or anything else: <a href={`mailto:${contactEmail}`} style={{ color: 'var(--primary)' }}>{contactEmail}</a>. Postal mail: 12 Adeola Odeku Street, Victoria Island, Lagos, Nigeria.</p>
                </section>
            </main>

            <footer className="legal__footer">
                <span>© {new Date().getFullYear()} Craneta.</span>
                <Link href="/terms">Terms</Link>
                <Link href="/privacy">Privacy</Link>
                <a href={`mailto:${contactEmail}`}>Contact</a>
            </footer>
        </div>
    )
}