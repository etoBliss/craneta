import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth-helpers'
import { formatPageAsText } from '@/lib/formatters'

/**
 * GET /api/pages/[id]/copy?format=text&framing=1
 *
 * Returns the page as plain text — a compact block ready to paste
 * into any AI tool's custom instructions field.
 *
 *   format  = 'text' (default) — human-readable plain text
 *   framing = '1'             — prepend a "this is standing context" sentence
 *
 * The `framing` flag is useful when pasting into a tool that doesn't
 * already prompt the model to read the block as instructions.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const framing = searchParams.get('framing') === '1'

    const page = await prisma.passportPage.findFirst({
        where: { id, userId: auth.userId, isActive: true },
    })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const text = formatPageAsText(
        {
            id: page.id,
            title: page.title,
            category: page.category,
            fields: page.fields,
        },
        { includeFraming: framing, skipEmpty: true }
    )

    return new NextResponse(text, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
        },
    })
}
