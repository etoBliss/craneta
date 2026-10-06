import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser, requireString, requireStringArray } from '@/lib/auth-helpers'

// Recognised destination slugs. 'manual' is the "Manual copy" pseudo-tool the
// injection flow upserts so a StampEvent always has its required FK; 'custom'
// is the single user-named slot. 'both'/'other' are retained from onboarding.
const SUPPORTED_TOOLS = new Set([
    'chatgpt',
    'claude',
    'gemini',
    'perplexity',
    'manual',
    'custom',
    'both',
    'other',
])

/**
 * GET /api/tools. list connected tools for the current user.
 */
export async function GET() {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const tools = await prisma.connectedTool.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tools)
}

/**
 * POST /api/tools. register a new connected tool.
 * Body: { toolSlug, toolName, includedPageIds, includedFields? }
 */
export async function POST(request: Request) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    let body: {
        toolSlug?: unknown
        toolName?: unknown
        includedPageIds?: unknown
        includedFields?: unknown
    }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const slugErr = requireString(body.toolSlug, 'toolSlug')
    if (slugErr) return NextResponse.json({ error: slugErr }, { status: 400 })
    const nameErr = requireString(body.toolName, 'toolName')
    if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 })
    const idsErr = requireStringArray(body.includedPageIds, 'includedPageIds')
    if (idsErr) return NextResponse.json({ error: idsErr }, { status: 400 })

    const slug = (body.toolSlug as string).trim().toLowerCase()
    if (!SUPPORTED_TOOLS.has(slug)) {
        return NextResponse.json({ error: 'Unsupported tool' }, { status: 400 })
    }

    const toolName = (body.toolName as string).trim().slice(0, 80)

    // Verify every pageId belongs to this user
    const pageIds = body.includedPageIds as string[]
    if (pageIds.length > 0) {
        const owned = await prisma.passportPage.count({
            where: { id: { in: pageIds }, userId: auth.userId, isActive: true },
        })
        if (owned !== pageIds.length) {
            return NextResponse.json(
                { error: 'One or more page IDs do not belong to you' },
                { status: 403 }
            )
        }
    }

    const includedFields =
        body.includedFields && typeof body.includedFields === 'object'
            ? JSON.stringify(body.includedFields)
            : null

    const tool = await prisma.connectedTool.upsert({
        where: { userId_toolSlug: { userId: auth.userId, toolSlug: slug } },
        update: {
            toolName,
            includedPageIds: pageIds.join(','),
            includedFields,
            isActive: true,
        },
        create: {
            userId: auth.userId,
            toolSlug: slug,
            toolName,
            includedPageIds: pageIds.join(','),
            includedFields,
            isActive: true,
        },
    })

    return NextResponse.json(tool, { status: 201 })
}

/**
 * DELETE /api/tools?slug=<toolSlug>. Disconnect a tool.
 *
 * Soft-disables (isActive:false) rather than deleting the row: StampEvent has a
 * required FK onto ConnectedTool with onDelete:Cascade, so a hard delete would
 * silently erase the user's stamp history. Reconnecting later re-activates the
 * same row via the POST upsert, so the audit trail stays continuous.
 */
export async function DELETE(request: Request) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const slug = new URL(request.url).searchParams.get('slug')?.trim().toLowerCase()
    const slugErr = requireString(slug, 'slug')
    if (slugErr) return NextResponse.json({ error: slugErr }, { status: 400 })

    const tool = await prisma.connectedTool.findUnique({
        where: { userId_toolSlug: { userId: auth.userId, toolSlug: slug as string } },
    })
    if (!tool) return NextResponse.json({ error: 'Tool not found' }, { status: 404 })

    await prisma.connectedTool.update({
        where: { id: tool.id },
        data: { isActive: false },
    })
    return NextResponse.json({ ok: true })
}