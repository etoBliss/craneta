import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata: Metadata = {
    title: 'Privacy — Craneta',
    description: 'How Craneta collects, uses, and protects your data. Short answer: we keep the minimum needed to make the product work, we never train on your content, and you can delete it all in one click.',
    alternates: { canonical: '/privacy' },
}

/**
 * Privacy policy. Plain-English summary at the top, full table further down.
 * Last updated is set to the deploy date — bump it whenever anything below
 * changes (especially the data-retention table or third-party services).
 */
export default function PrivacyPage() {
    const lastUpdated = 'October 6, 2026'
    const contactEmail = 'privacy@craneta.app'

    return (
        <div className="legal">
            <header className="legal__nav">
                <Link href="/" aria-label="Craneta home" className="legal__brand">
                    <Logo light={false} />
                </Link>
                <Link href="/" className="legal__back">← Back to home</Link>
            </header>

            <main className="legal__main">
                <p className="legal__eyebrow">Privacy</p>
                <h1 className="legal__title">Your context is yours. We just hold it for you.</h1>
                <p className="legal__updated">Last updated {lastUpdated}</p>

                <section className="legal__summary">
                    <h2>Short version</h2>
                    <ul>
                        <li><strong>You own what you write.</strong> Every passport page, version, and inbox note belongs to you, scoped to your account.</li>
                        <li><strong>We never train on your content.</strong> Your pages are never used to train any model, ours or anyone else&apos;s.</li>
                        <li><strong>You can export or delete everything.</strong> A single click exports your full passport as JSON or text, and another deletes the account and every byte tied to it.</li>
                        <li><strong>We collect the minimum.</strong> Email, hashed password, the pages you write, and aggregate counters (page count, etc.). That&apos;s it.</li>
                    </ul>
                </section>

                <section className="legal__section">
                    <h2>1. What we collect</h2>
                    <p>To run the service we store the following against your account:</p>
                    <table className="legal__table">
                        <thead>
                            <tr><th>Category</th><th>Specific items</th><th>Why</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Account</td><td>Email address, hashed password (bcrypt), display name</td><td>Sign-in and identification</td></tr>
                            <tr><td>Content</td><td>Passport pages, fields, version history, inbox notes</td><td>The product itself — your context</td></tr>
                            <tr><td>Usage</td><td>Aggregate counters (page count, field-fill %, login timestamps)</td><td>Dashboard display, abuse prevention</td></tr>
                            <tr><td>Support</td><td>Emails you send us</td><td>Answering your questions</td></tr>
                        </tbody>
                    </table>
                    <p>We do <em>not</em> collect: precise geolocation, device fingerprinting, third-party trackers, or advertising identifiers.</p>
                </section>

                <section className="legal__section">
                    <h2>2. How we use it</h2>
                    <p>Only to provide the product: render your dashboard, save your pages, authenticate your account, and let you export or delete your data. Craneta does not sell your content or send it to AI providers. If you copy or paste an export into another service, that service&apos;s privacy terms apply.</p>
                </section>

                <section className="legal__section">
                    <h2>3. Third-party services</h2>
                    <p>Craneta currently uses Prisma with a SQLite database. The hosting and storage providers depend on the deployment you use and may process requests and stored account data to operate the service. Craneta does not currently send passport content to AI providers or run product analytics in the application.</p>
                </section>

                <section className="legal__section">
                    <h2>4. Cookies</h2>
                    <p>Authentication uses a first-party session cookie issued by NextAuth. It is HttpOnly and SameSite=Lax. The application does not use advertising cookies or third-party tracking cookies.</p>
                </section>

                <section className="legal__section">
                    <h2>5. Data retention</h2>
                    <p>Your account data remains stored until you delete your account. Craneta does not currently run an automated inactivity deletion process. You can export or permanently delete your account at any time from <Link href="/dashboard/profile" style={{ color: 'var(--primary)' }}>your profile</Link>.</p>
                </section>

                <section className="legal__section">
                    <h2>6. Your rights</h2>
                    <ul>
                        <li>Export your full passport (JSON + plain text) — <Link href="/dashboard/export" style={{ color: 'var(--primary)' }}>Export page</Link></li>
                        <li>Update your name or email — <Link href="/dashboard/profile" style={{ color: 'var(--primary)' }}>Profile</Link></li>
                        <li>Change your password — <Link href="/dashboard/settings" style={{ color: 'var(--primary)' }}>Settings</Link></li>
                        <li>Delete your account and every byte tied to it — <Link href="/dashboard/profile" style={{ color: 'var(--primary)' }}>Profile → Delete</Link></li>
                        <li>Email <a href={`mailto:${contactEmail}`} style={{ color: 'var(--primary)' }}>{contactEmail}</a> for anything else</li>
                    </ul>
                </section>

                <section className="legal__section">
                    <h2>7. Security</h2>
                    <p>Passwords are hashed with bcrypt (cost 12), and authentication sessions are signed JWTs stored in HttpOnly cookies. A production deployment must use HTTPS and protect its database and backups. Backup, access-control, and incident-notification procedures depend on the deployment operator; Craneta does not currently automate backups or breach notifications.</p>
                </section>

                <section className="legal__section">
                    <h2>8. Contact</h2>
                    <p>Craneta is operated by a single founder from Lagos, Nigeria. Reach the privacy team at <a href={`mailto:${contactEmail}`} style={{ color: 'var(--primary)' }}>{contactEmail}</a>. Postal mail: 12 Adeola Odeku Street, Victoria Island, Lagos, Nigeria.</p>
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
