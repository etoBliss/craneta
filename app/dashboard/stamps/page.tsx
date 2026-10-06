import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import Icon from '@/components/Icon'

export const metadata: Metadata = {
    title: 'Stamp history',
    description: 'A private record of the times you copied your Craneta passport into a connected destination.',
    robots: { index: false, follow: false },
}

function parsePageIds(value: string): string[] {
    try {
        const parsed: unknown = JSON.parse(value)
        if (Array.isArray(parsed)) return parsed.filter((id): id is string => typeof id === 'string')
    } catch {
        // Older events store page IDs as a comma-separated string.
    }
    return value.split(',').map((id) => id.trim()).filter(Boolean)
}

function formatLabel(value: string | null) {
    if (!value) return 'Clipboard copy'
    return value === 'clipboard' ? 'Clipboard copy' : `${value[0].toUpperCase()}${value.slice(1)} export`
}

export default async function StampHistoryPage() {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) return null

    const [events, pages] = await Promise.all([
        prisma.stampEvent.findMany({
            where: { userId },
            include: { connectedTool: { select: { toolName: true, toolSlug: true } } },
            orderBy: { stampedAt: 'desc' },
            take: 50,
        }),
        prisma.passportPage.findMany({ where: { userId }, select: { id: true, title: true } }),
    ])

    const pageNames = new Map(pages.map((page) => [page.id, page.title]))
    const destinationCount = new Set(events.map((event) => event.connectedTool.toolSlug)).size
    const lastEvent = events[0]?.stampedAt

    return (
        <div className="dashboard-page-shell dashboard-page-shell--medium stamp-history">
            <header className="stamp-history__hero soft-rise">
                <div className="stamp-history__hero-copy">
                    <p className="section-eyebrow stamp-history__eyebrow"><Icon name="stamp" size={14} /> Passport trail</p>
                    <h1>Where your context has travelled.</h1>
                    <p>Each stamp marks a moment you chose to copy part of your passport into a connected destination. Your context stays yours to share.</p>
                </div>
                <div className="stamp-history__hero-mark" aria-hidden="true"><Icon name="stamp" size={42} /></div>
            </header>

            <section className="stamp-history__stats" aria-label="Stamp history summary">
                <article className="stamp-history__stat"><span>Total stamps</span><strong>{events.length}</strong><small>Recent activity saved here</small></article>
                <article className="stamp-history__stat"><span>Destinations</span><strong>{destinationCount}</strong><small>{destinationCount === 1 ? 'One tool used' : 'Tools used'}</small></article>
                <article className="stamp-history__stat"><span>Most recent</span><strong>{lastEvent ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(lastEvent) : 'Not yet'}</strong><small>{lastEvent ? 'Your latest recorded copy' : 'Your first stamp will show up here'}</small></article>
            </section>

            <section className="stamp-history__list-section" aria-labelledby="stamp-history-title">
                <div className="dashboard-section__header dashboard-section__header--simple">
                    <div>
                        <p className="section-eyebrow dashboard-section__eyebrow">Your activity</p>
                        <h2 className="dashboard-section__title" id="stamp-history-title">Stamp history</h2>
                    </div>
                    <Link href="/dashboard/export" className="stamp-history__export-link">Go to export <Icon name="arrow-right" size={14} /></Link>
                </div>

                {events.length === 0 ? (
                    <div className="stamp-history__empty">
                        <span className="stamp-history__empty-icon"><Icon name="passport" size={28} /></span>
                        <h3>Your trail starts when you do.</h3>
                        <p>When you copy selected passport pages with a connected destination, Craneta records the date and what you chose to carry.</p>
                        <Link href="/dashboard/export" className="btn-primary"><Icon name="export" size={15} /> Open export</Link>
                    </div>
                ) : (
                    <ol className="stamp-history__list">
                        {events.map((event) => {
                            const ids = parsePageIds(event.pageIds)
                            const names = ids.map((id) => pageNames.get(id)).filter((name): name is string => Boolean(name))
                            const omittedCount = Math.max(0, ids.length - names.length)
                            return (
                                <li className="stamp-history__event" key={event.id}>
                                    <span className="stamp-history__event-mark" aria-hidden="true"><Icon name="stamp" size={18} /></span>
                                    <div className="stamp-history__event-main">
                                        <div className="stamp-history__event-heading">
                                            <h3>{event.connectedTool.toolName}</h3>
                                            <time dateTime={event.stampedAt.toISOString()}>{new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(event.stampedAt)}</time>
                                        </div>
                                        <p>{formatLabel(event.exportFormat)} <span aria-hidden="true">·</span> {ids.length} {ids.length === 1 ? 'page' : 'pages'} carried</p>
                                        <div className="stamp-history__tags">
                                            {names.slice(0, 4).map((name) => <span key={name}>{name}</span>)}
                                            {omittedCount > 0 && <span>{omittedCount} removed {omittedCount === 1 ? 'page' : 'pages'}</span>}
                                            {names.length > 4 && <span>+{names.length - 4} more</span>}
                                            {ids.length === 0 && <span>No page details recorded</span>}
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                )}
                {events.length === 50 && <p className="stamp-history__limit-note">Showing your 50 most recent stamps.</p>}
            </section>
        </div>
    )
}
