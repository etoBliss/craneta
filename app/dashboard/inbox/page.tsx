import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { parseFields } from '@/lib/utils'
import InboxClient from '@/components/InboxClient'

export const metadata: Metadata = {
    title: 'Inbox',
    description: 'Capture loose thoughts and triage them into the right passport page.',
    robots: { index: false, follow: false },
}

export default async function InboxPage() {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
        // Layout already guards this, but type-narrowing needs an explicit branch.
        return null
    }

    const [items, pages] = await Promise.all([
        prisma.inboxItem.findMany({
            where: { userId },
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        }),
        prisma.passportPage.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'asc' },
        }),
    ])

    const open = items.filter((i) => i.status === 'open')
    const triaged = items.filter((i) => i.status === 'triaged')
    const dismissed = items.filter((i) => i.status === 'dismissed')

    const pageOptions = pages.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        fields: parseFields(p.fields),
    }))

    return (
        <div className="dashboard-page-shell dashboard-page-shell--medium">
            <header className="soft-rise" style={{ marginBottom: 32 }}>
                <p className="section-eyebrow" style={{ marginBottom: 10 }}>
                    Inbox
                </p>
                <h1 style={{ fontSize: 'var(--fs-40)', lineHeight: 1.05 }}>
                    Capture, then triage.
                </h1>
                <p
                    style={{
                        marginTop: 12,
                        fontSize: 'var(--fs-16)',
                        color: 'var(--ink-70)',
                        maxWidth: 540,
                    }}
                >
                    Every stray fact lands here first. Drop a note with the
                    capture button anywhere in the app, then file it into the
                    right page when you have a moment.
                </p>
            </header>

            <InboxClient
                initialItems={items.map((i) => ({
                    id: i.id,
                    text: i.text,
                    status: i.status as 'open' | 'triaged' | 'dismissed',
                    source: i.source,
                    createdAt: i.createdAt.toISOString(),
                    triagedPageId: i.triagedPageId,
                    triagedFieldKey: i.triagedFieldKey,
                    triagedAt: i.triagedAt?.toISOString() ?? null,
                }))}
                pageOptions={pageOptions}
                counts={{
                    open: open.length,
                    triaged: triaged.length,
                    dismissed: dismissed.length,
                }}
            />
        </div>
    )
}
