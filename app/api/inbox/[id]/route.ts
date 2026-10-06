import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/db'
import { parseFields, stringifyFields, FIELD_LIMITS } from '@/lib/utils'
import { ApiError, readJson, ok, requireUserId, handleError } from '@/lib/api'

// PATCH /api/inbox/[id] — triage an inbox item.
//
// Body options:
//   { status: 'dismissed' }   — mark dismissed, no impact on any page
//   { status: 'open' }        — re-open a previously dismissed/triaged item
//   {
//     status: 'triaged',
//     pageId: string,
//     fieldKey: string,        // existing field key OR
//     newFieldLabel?: string,  // optional new field name to create
//     append?: boolean         // if true, append text to existing field value
//   }
//
// When triaged into a page, the target field's value is updated and a new
// PassportPageVersion is recorded so the change shows up in history.
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await requireUserId()
        const { id } = await params

        const body = await readJson<{
            status?: unknown
            pageId?: unknown
            fieldKey?: unknown
            newFieldLabel?: unknown
            append?: unknown
        }>(request)

        const item = await prisma.inboxItem.findFirst({ where: { id, userId } })
        if (!item) throw new ApiError(404, 'Not found')

        if (body.status === 'open') {
            const updated = await prisma.inboxItem.update({
                where: { id },
                data: {
                    status: 'open',
                    triagedPageId: null,
                    triagedFieldKey: null,
                    triagedAt: null,
                },
            })
            return ok({ item: updated })
        }

        if (body.status === 'dismissed') {
            const updated = await prisma.inboxItem.update({
                where: { id },
                data: { status: 'dismissed' },
            })
            return ok({ item: updated })
        }

        if (body.status === 'triaged') {
            if (typeof body.pageId !== 'string' || !body.pageId) {
                throw new ApiError(400, 'pageId is required to triage')
            }

            // Only triage into a live page the user owns — never a soft-deleted one.
            const page = await prisma.passportPage.findFirst({
                where: { id: body.pageId, userId, isActive: true },
            })
            if (!page) throw new ApiError(404, 'Page not found')

            const fields = parseFields(page.fields)
            const existingKey = typeof body.fieldKey === 'string' ? body.fieldKey : null
            const newLabel =
                typeof body.newFieldLabel === 'string' ? body.newFieldLabel.trim() : null
            const append = body.append === true

            if (!existingKey && !newLabel) {
                throw new ApiError(400, 'fieldKey or newFieldLabel is required')
            }
            if (newLabel && newLabel.length > FIELD_LIMITS.maxLabelLength) {
                throw new ApiError(400, 'Field label is too long')
            }

            const clampValue = (v: string) => v.slice(0, FIELD_LIMITS.maxValueLength)

            let targetKey = existingKey
            let updatedFields = fields

            if (existingKey) {
                const exists = fields.some((f) => f.key === existingKey)
                if (!exists) throw new ApiError(400, 'fieldKey not found on page')
                updatedFields = fields.map((f) => {
                    if (f.key !== existingKey) return f
                    if (append) {
                        const existingVal = (f.value || '').trim()
                        const next = existingVal ? `${existingVal}\n${item.text}` : item.text
                        return { ...f, value: clampValue(next) }
                    }
                    return { ...f, value: clampValue(item.text) }
                })
            } else if (newLabel) {
                // Random key so two fields added in the same millisecond can't
                // collide (the old `field_${Date.now()}` did).
                const baseKey = `field_${randomUUID().slice(0, 8)}`
                targetKey = baseKey
                updatedFields = [
                    ...fields,
                    { key: baseKey, label: newLabel, value: clampValue(item.text) },
                ]
            }

            const jsonFields = stringifyFields(updatedFields)

            // Compute the next version number INSIDE the transaction so two
            // concurrent triages can't collide on @@unique([pageId, version]).
            const result = await prisma.$transaction(async (tx) => {
                const latest = await tx.passportPageVersion.findFirst({
                    where: { pageId: page.id },
                    orderBy: { version: 'desc' },
                    select: { version: true },
                })
                const nextVersion = (latest?.version ?? 0) + 1
                const updatedItem = await tx.inboxItem.update({
                    where: { id },
                    data: {
                        status: 'triaged',
                        triagedPageId: page.id,
                        triagedFieldKey: targetKey,
                        triagedAt: new Date(),
                    },
                })
                const updatedPage = await tx.passportPage.update({
                    where: { id: page.id },
                    data: { fields: jsonFields },
                })
                await tx.passportPageVersion.create({
                    data: {
                        pageId: page.id,
                        version: nextVersion,
                        title: page.title,
                        fields: jsonFields,
                        editNote: `Inbox triage · ${item.text.slice(0, 80)}`,
                    },
                })
                return { updatedItem, updatedPage }
            })

            return ok({
                item: result.updatedItem,
                page: { id: result.updatedPage.id, title: result.updatedPage.title },
            })
        }

        throw new ApiError(400, 'Invalid status')
    } catch (err) {
        return handleError(err)
    }
}

// DELETE /api/inbox/[id] — remove an item permanently.
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await requireUserId()
        const { id } = await params
        const item = await prisma.inboxItem.findFirst({ where: { id, userId } })
        if (!item) throw new ApiError(404, 'Not found')

        await prisma.inboxItem.delete({ where: { id } })
        return ok({ ok: true })
    } catch (err) {
        return handleError(err)
    }
}
