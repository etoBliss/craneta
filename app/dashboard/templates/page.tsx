import type { Metadata } from 'next'
import { TEMPLATES } from '@/lib/templates'
import TemplateCard from '@/components/TemplateCard'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Templates',
    description: 'Starter passports for common roles — developer, writer, founder, designer, freelancer, researcher.',
    robots: { index: false, follow: false },
}

export default function TemplatesPage() {
    return (
        <div className="dashboard-page-shell dashboard-page-shell--wide">
            <header className="soft-rise" style={{ marginBottom: 32 }}>
                <p className="section-eyebrow" style={{ marginBottom: 10 }}>
                    Starter templates
                </p>
                <h1 style={{ fontSize: 'var(--fs-40)', lineHeight: 1.05 }}>
                    Skip the blank page.
                </h1>
                <p
                    style={{
                        marginTop: 12,
                        fontSize: 'var(--fs-16)',
                        color: 'var(--ink-70)',
                        maxWidth: 580,
                    }}
                >
                    Pick a template and we&apos;ll add a starter set of pages with
                    smart fields pre-shaped for your situation. The fields start
                    empty — your context is yours to write.
                </p>
            </header>

            <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                style={{ marginBottom: 32 }}
            >
                {TEMPLATES.map((t, i) => (
                    <TemplateCard
                        key={t.slug}
                        slug={t.slug}
                        name={t.name}
                        icon={t.icon}
                        tagline={t.tagline}
                        description={t.description}
                        pageCount={t.pages.length}
                        fieldCount={t.pages.reduce(
                            (acc, p) => acc + p.fields.length,
                            0
                        )}
                        index={i}
                    />
                ))}
            </div>

            <div
                style={{
                    padding: 20,
                    backgroundColor: 'var(--ink-05)',
                    border: '1px solid var(--ink-10)',
                    borderRadius: 'var(--radius-4)',
                }}
            >
                <p
                    style={{
                        fontSize: 'var(--fs-14)',
                        color: 'var(--ink-70)',
                        margin: 0,
                        lineHeight: 1.5,
                    }}
                >
                    <strong style={{ color: 'var(--ink)' }}>
                        Prefer to start from scratch?
                    </strong>{' '}
                    You can still{' '}
                    <Link
                        href="/dashboard/pages/new"
                        style={{ color: 'var(--primary)', fontWeight: 600 }}
                    >
                        add a single page manually
                    </Link>{' '}
                    with one of the category templates — or build a totally
                    custom page.
                </p>
            </div>
        </div>
    )
}
