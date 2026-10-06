import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import PageEditorClient from '@/components/PageEditorClient'
import { CATEGORY_META, type PassportPageCategory } from '@/lib/constants'
import { parseFields } from '@/lib/utils'

export default async function PageEditorPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    // Guard before the query: with userId undefined, Prisma would drop the
    // ownership filter and match any user's page. The layout already gates
    // auth, so this is a defensive 404 rather than an expected path.
    if (!userId) notFound()
    const { id } = await params

    const page = await prisma.passportPage.findFirst({
        where: { id, userId, isActive: true },
        include: { versions: { orderBy: { version: 'desc' } } },
    })

    if (!page) notFound()

    const meta =
        CATEGORY_META[page.category as PassportPageCategory] || CATEGORY_META.custom

    return (
        <div className="dashboard-page-shell dashboard-page-shell--narrow">
            <PageEditorClient
                page={{
                    id: page.id,
                    category: page.category,
                    title: page.title,
                    fields: parseFields(page.fields),
                    versions: page.versions.map((v) => ({
                        id: v.id,
                        version: v.version,
                        title: v.title,
                        savedAt: v.savedAt.toISOString(),
                        editNote: v.editNote,
                    })),
                }}
                meta={meta}
            />
        </div>
    )
}
