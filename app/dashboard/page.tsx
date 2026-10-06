import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Icon from '@/components/Icon'
import DashboardStats from '@/components/DashboardStats'
import DashboardGreeting from '@/components/DashboardGreeting'
import ExportRow from '@/components/ExportRow'
import { CATEGORY_META, type PassportPageCategory } from '@/lib/constants'
import { parseFields } from '@/lib/utils'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
        // Layout already guards this, but type-narrowing needs an explicit branch.
        return null
    }

    const pages = await prisma.passportPage.findMany({
        where: { userId, isActive: true },
        include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'asc' },
    })

    const allFields = pages.flatMap((p) => parseFields(p.fields))
    const totalFields = allFields.filter((f) => f.value?.trim()).length
    const totalSlots = allFields.length
    const completion = totalSlots ? Math.round((totalFields / totalSlots) * 100) : 0

    return (
        <div className="dashboard-page-shell dashboard-page-shell--home">
            <DashboardGreeting
                name={session?.user?.name ?? null}
                pageCount={pages.length}
                fieldCount={totalFields}
                completion={completion}
                totalSlots={totalSlots}
            />

            <DashboardStats
                pageCount={pages.length}
                fieldCount={totalFields}
                totalSlots={totalSlots}
                completion={completion}
            />

            {/* Pages grid */}
            <section className="dashboard-section dashboard-section--pages">
                <header
                    className="dashboard-section__header"
                >
                    <div>
                        <p className="section-eyebrow dashboard-section__eyebrow">
                            Passport pages
                        </p>
                        <h2 className="dashboard-section__title">
                            {pages.length === 0 ? 'Start your passport' : 'Your pages'}
                        </h2>
                    </div>
                    <Link href="/dashboard/pages/new" id="dashboard-add-page-btn" className="btn-primary dashboard-section__action">
                        <span className="sm:hidden inline-flex items-center gap-2">
                            <Icon name="plus" size={16} />
                            {pages.length === 0 ? 'Add your first page' : 'Add a page'}
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-2">
                            <Icon name="plus" size={16} />
                            Add page
                        </span>
                    </Link>
                </header>

                {pages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pages.map((page, i) => {
                            const meta =
                                CATEGORY_META[page.category as PassportPageCategory] ||
                                CATEGORY_META.custom
                            const fields = parseFields(page.fields)
                            const filled = fields.filter((f) => f.value?.trim()).length
                            const version = page.versions[0]?.version ?? 1
                            const pct = fields.length ? Math.round((filled / fields.length) * 100) : 0
                            const isComplete = fields.length > 0 && filled === fields.length

                            return (
                                <Link
                                    key={page.id}
                                    href={`/dashboard/pages/${page.id}`}
                                    id={`page-card-${page.id}`}
                                    className="card dashboard-page-card hover-lift soft-rise"
                                    style={{
                                        textDecoration: 'none',
                                        display: 'block',
                                        animationDelay: `${Math.min(i * 0.05, 0.3)}s`,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            gap: 16,
                                            marginBottom: 18,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                            <span className="icon-chip">
                                                <Icon name={meta.icon} size={20} />
                                            </span>
                                            <div style={{ minWidth: 0 }}>
                                                <p
                                                    style={{
                                                        fontSize: 'var(--fs-16)',
                                                        fontWeight: 700,
                                                        color: 'var(--ink)',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {page.title}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: 'var(--fs-12)',
                                                        color: 'var(--ink-50)',
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {meta.label}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="badge">v{version}</span>
                                    </div>

                                    {/* Progress */}
                                    <div>
                                        <div className="soft-bar">
                                            <span
                                                style={{
                                                    width: `${pct}%`,
                                                        backgroundColor: 'var(--primary)',
                                                }}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginTop: 10,
                                            }}
                                        >
                                            <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-50)' }}>
                                                {filled} of {fields.length} fields filled
                                            </p>
                                            {isComplete ? (
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                        fontSize: 'var(--fs-12)',
                                                        fontWeight: 600,
                                                        color: 'var(--primary)',
                                                    }}
                                                >
                                                    <Icon name="check" size={12} />
                                                    Complete
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 'var(--fs-12)', fontWeight: 600, color: 'var(--ink)' }}>
                                                    {pct}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}

                        {/* Add tile */}
                        <Link
                            href="/dashboard/pages/new"
                            id="dashboard-add-page-tile"
                            className="dashboard-page-card dashboard-page-card--add hover-lift soft-rise"
                            style={{ animationDelay: '0.3s' }}
                        >
                            <span className="icon-chip-sm">
                                <Icon name="plus" size={16} />
                            </span>
                            <p className="dashboard-page-card__add-label">Add a custom page</p>
                        </Link>
                    </div>
                )}
            </section>

            {/* Export panel — flat, hairline-bordered card */}
            <section className="dashboard-section dashboard-section--export">
                <header className="dashboard-section__header dashboard-section__header--simple">
                    <div>
                    <p className="section-eyebrow dashboard-section__eyebrow">
                        Export
                    </p>
                    <h2 className="dashboard-section__title">Carry it anywhere</h2>
                    </div>
                    <p className="dashboard-section__hint">Your context stays under your control.</p>
                </header>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <ExportRow
                        icon="export"
                        title="JSON export"
                        body="Machine-readable format. Use for integrations, backups, or restoring your passport to Craneta later."
                        actionHref="/api/export?format=json"
                        actionLabel="Download JSON"
                        actionId="dashboard-export-json"
                        tone="primary"
                    />
                    <ExportRow
                        icon="page"
                        title="Plaintext export"
                        body="A formatted text block you can paste into any AI tool's custom instructions field — ChatGPT, Claude, Gemini, anything."
                        actionHref="/api/export?format=text"
                        actionLabel="Download text"
                        actionId="dashboard-export-text"
                    />
                    <ExportRow
                        icon="sparkle"
                        title="Need more options?"
                        body="Choose specific pages, copy formatted text, or browse the full export view with copy-to-clipboard."
                        actionHref="/dashboard/export"
                        actionLabel="Open export view"
                        actionId="dashboard-export-link"
                    />
                </div>
            </section>
        </div>
    )
}

function EmptyState() {
    return (
        <div
            className="card soft-rise"
            style={{
                border: '1.5px dashed var(--ink-20)',
                padding: '48px 28px',
                textAlign: 'center',
                animationDelay: '0.05s',
            }}
        >
            <div
                className="soft-drift"
                style={{
                    width: 88,
                    height: 88,
                    margin: '0 auto 20px',
                    borderRadius: 'var(--radius-4)',
                    backgroundColor: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon name="passport" size={40} />
            </div>
            <h3 style={{ fontSize: 'var(--fs-20)', marginBottom: 8 }}>
                Start with a template.
            </h3>
            <p
                style={{
                    color: 'var(--ink-70)',
                    fontSize: 'var(--fs-14)',
                    maxWidth: 420,
                    margin: '0 auto 24px',
                    lineHeight: 1.5,
                }}
            >
                Pick one of our starter kits and we&apos;ll add a pre-shaped set of pages to your passport. You fill in the rest — your context, your wording.
            </p>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <Link href="/dashboard/templates" className="btn-primary" id="empty-state-templates">
                    <Icon name="sparkle" size={16} />
                    Browse starter templates
                </Link>
                <Link
                    href="/dashboard/pages/new"
                    className="btn-ghost"
                    style={{ fontSize: 'var(--fs-12)' }}
                >
                    Or start from a blank page →
                </Link>
            </div>
        </div>
    )
}
