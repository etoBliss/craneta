import { prisma } from '@/lib/db'
import { ApiError, readJson, ok, requireUserId, handleError } from '@/lib/api'

const VALID_EXPORT_FORMATS = new Set(['clipboard', 'json', 'text', 'markdown'])
const MAX_STAMP_PAGES = 100

/**
 * POST /api/stamps — record a "stamp" event: the user exported a set of pages
 * to a connected tool. Verifies the tool and every referenced page belong to
 * the user before recording.
 */
export async function POST(request: Request) {
    try {
        const userId = await requireUserId()

        const body = await readJson<{
            connectedToolId?: unknown
            pageIds?: unknown
            exportFormat?: unknown
        }>(request)

        if (typeof body.connectedToolId !== 'string' || !body.connectedToolId.trim()) {
            throw new ApiError(400, 'connectedToolId is required')
        }
        const connectedToolId = body.connectedToolId.trim()

        const tool = await prisma.connectedTool.findFirst({
            where: { id: connectedToolId, userId },
        })
        if (!tool) throw new ApiError(404, 'Tool not found')

        // De-dupe and keep only strings.
        const pageIds = Array.isArray(body.pageIds)
            ? Array.from(
                  new Set(
                      (body.pageIds as unknown[]).filter(
                          (v): v is string => typeof v === 'string'
                      )
                  )
              )
            : []
        if (pageIds.length > MAX_STAMP_PAGES) {
            throw new ApiError(400, 'Too many pages in a single stamp')
        }

        // Verify every referenced page belongs to this user and is live —
        // don't record a stamp that points at someone else's (or a deleted) page.
        if (pageIds.length > 0) {
            const owned = await prisma.passportPage.count({
                where: { id: { in: pageIds }, userId, isActive: true },
            })
            if (owned !== pageIds.length) {
                throw new ApiError(400, 'One or more pages do not belong to you')
            }
        }

        const exportFormat =
            typeof body.exportFormat === 'string' &&
            VALID_EXPORT_FORMATS.has(body.exportFormat.trim())
                ? body.exportFormat.trim()
                : 'clipboard'

        const event = await prisma.stampEvent.create({
            data: {
                userId,
                connectedToolId: tool.id,
                pageIds: pageIds.join(','),
                exportFormat,
            },
        })

        return ok(event, { status: 201 })
    } catch (err) {
        return handleError(err)
    }
}

export async function GET() {
    try {
        const userId = await requireUserId()

        const events = await prisma.stampEvent.findMany({
            where: { userId },
            include: { connectedTool: true },
            orderBy: { stampedAt: 'desc' },
            take: 50,
        })

        return ok(events)
    } catch (err) {
        return handleError(err)
    }
}
