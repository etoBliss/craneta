import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import ExportClient from '@/components/ExportClient'
import { buildPagePreviews } from '@/lib/formatters'

export const metadata: Metadata = {
    title: 'Export',
    description: 'Copy your passport into any chat, or download it as JSON, plain text, or markdown.',
    robots: { index: false, follow: false },
}

export default async function ExportPage() {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
        // Layout already guards this — defense in depth for type narrowing.
        return null
    }

    const [user, pages, tools] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
        }),
        prisma.passportPage.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.connectedTool.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'asc' },
        }),
    ])

    const previews = buildPagePreviews(
        pages.map((p) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            fields: p.fields,
        }))
    )

    const connected = tools.map((t) => ({
        id: t.id,
        slug: t.toolSlug,
        name: t.toolName,
        includedPageIds: t.includedPageIds
            ? t.includedPageIds.split(',').filter(Boolean)
            : [],
        isActive: t.isActive,
    }))

    return (
        <ExportClient
            userName={user?.name ?? null}
            pages={previews}
            tools={connected}
        />
    )
}
