import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import ToolsClient from '@/components/ToolsClient'
import { buildPagePreviews } from '@/lib/formatters'

export const metadata: Metadata = {
    title: 'Tools',
    description: 'Connect the AI tools you carry your passport to, and choose which pages each one receives.',
    robots: { index: false, follow: false },
}

export default async function ToolsPage() {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
        // Layout already guards this — defense in depth for type narrowing.
        return null
    }

    const [pages, tools] = await Promise.all([
        prisma.passportPage.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.connectedTool.findMany({
            where: { userId },
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
    ).map((p) => ({
        id: p.id,
        title: p.title,
        categoryLabel: p.categoryLabel,
        filledCount: p.filledCount,
        totalCount: p.totalCount,
    }))

    const connected = tools.map((t) => ({
        id: t.id,
        slug: t.toolSlug,
        name: t.toolName,
        includedPageIds: t.includedPageIds
            ? t.includedPageIds.split(',').filter(Boolean)
            : [],
        isActive: t.isActive,
    }))

    return <ToolsClient pages={previews} tools={connected} />
}
