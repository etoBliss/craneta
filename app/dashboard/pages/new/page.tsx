import NewPageForm from '@/components/NewPageForm'
import Link from 'next/link'
import Icon from '@/components/Icon'
import { TEMPLATES } from '@/lib/templates'

export default function NewPagePage() {
    return (
        <div className="dashboard-page-shell dashboard-page-shell--narrow">
            <header className="soft-rise" style={{ marginBottom: 36 }}>
                <p className="section-eyebrow" style={{ marginBottom: 10 }}>
                    New page
                </p>
                <h1 style={{ fontSize: 'var(--fs-40)', lineHeight: 1.05 }}>
                    Add a passport page
                </h1>
                <p
                    style={{
                        marginTop: 12,
                        fontSize: 'var(--fs-16)',
                        color: 'var(--ink-70)',
                        maxWidth: 540,
                    }}
                >
                    Choose a category to add to your passport. Each page holds a set of structured fields you can fill in, version, and export.
                </p>
            </header>

            {/* Starter templates — quick path */}
            <section
                className="soft-rise"
                style={{
                    marginBottom: 40,
                    padding: 22,
                    backgroundColor: 'var(--ink-05)',
                    border: '1px solid var(--ink-10)',
                    borderRadius: 'var(--radius-4)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 16,
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontSize: 'var(--fs-12)',
                                fontWeight: 700,
                                fontFamily: 'var(--font-display)',
                                color: 'var(--primary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: 4,
                            }}
                        >
                            Faster path
                        </p>
                        <h2
                            style={{
                                fontSize: 'var(--fs-20)',
                                color: 'var(--ink)',
                                marginBottom: 4,
                            }}
                        >
                            Use a starter template
                        </h2>
                        <p
                            style={{
                                fontSize: 'var(--fs-12)',
                                color: 'var(--ink-70)',
                                margin: 0,
                                lineHeight: 1.5,
                            }}
                        >
                            Drop a pre-shaped set of pages into your passport — empty fields, smart framing.
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        flexWrap: 'wrap',
                    }}
                >
                    {TEMPLATES.map((t) => (
                        <Link
                            key={t.slug}
                            href={`/dashboard/templates?focus=${t.slug}`}
                            id={`quick-template-${t.slug}`}
                            className="hover-lift"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 12px',
                                fontSize: 'var(--fs-12)',
                                fontWeight: 600,
                                fontFamily: 'var(--font-display)',
                                color: 'var(--ink)',
                                backgroundColor: 'var(--white)',
                                border: '1px solid var(--ink-10)',
                                borderRadius: 'var(--radius-pill)',
                                textDecoration: 'none',
                                transition: 'border-color 0.15s ease, color 0.15s ease',
                            }}
                        >
                            <Icon name={t.icon} size={12} />
                            {t.name}
                        </Link>
                    ))}
                    <Link
                        href="/dashboard/templates"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 12px',
                            fontSize: 'var(--fs-12)',
                            fontWeight: 600,
                            color: 'var(--primary)',
                            textDecoration: 'none',
                        }}
                    >
                        See all
                        <Icon name="arrow-right" size={12} />
                    </Link>
                </div>
            </section>

            {/* Manual single-page builder */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 24,
                    color: 'var(--ink-50)',
                }}
            >
                <span
                    style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: 'var(--ink-10)',
                    }}
                />
                <p
                    style={{
                        fontSize: 'var(--fs-12)',
                        fontWeight: 600,
                        fontFamily: 'var(--font-display)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        margin: 0,
                    }}
                >
                    Or build one page manually
                </p>
                <span
                    style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: 'var(--ink-10)',
                    }}
                />
            </div>

            <NewPageForm />
        </div>
    )
}
