import { prisma } from '@/lib/db'
import { stringifyFields } from '@/lib/utils'
import { getTemplate } from '@/lib/templates'
import { ApiError, ok, requireUserId, handleError } from '@/lib/api'

/**
 * POST /api/templates/[slug]/apply
 *
 * Creates every page defined in the template for the current user. Each page
 * and its v1 PassportPageVersion are created together in a single transaction,
 * so a page can never exist without its initial history row.
 *
 * Returns: { created: Array<{ id, title, category }>, template: { slug, name } }
 */
export async function POST(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const userId = await requireUserId()

        const { slug } = await params
        const template = getTemplate(slug)
        if (!template) throw new ApiError(404, 'Template not found')

        type Created = { id: string; title: string; category: string }

        const created = await prisma.$transaction(async (tx) => {
            const out: Created[] = []
            for (const page of template.pages) {
                const jsonFields = stringifyFields(page.fields)
                const p = await tx.passportPage.create({
                    data: {
                        userId,
                        category: page.category,
                        title: page.title,
                        fields: jsonFields,
                    },
                })
                await tx.passportPageVersion.create({
                    data: {
                        pageId: p.id,
                        version: 1,
                        title: p.title,
                        fields: jsonFields,
                        editNote: `Created from template · ${template.name}`,
                    },
                })
                out.push({ id: p.id, title: p.title, category: p.category })
            }
            return out
        })

        return ok({
            created,
            template: { slug: template.slug, name: template.name },
        })
    } catch (err) {
        return handleError(err)
    }
}
