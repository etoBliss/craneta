import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser, requireString } from '@/lib/auth-helpers'

// GET /api/inbox — list the current user's inbox items, newest first.
// Optional ?status=open|triaged|dismissed filter (defaults to all).
export async function GET(request: Request) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    const where: { userId: string; status?: string } = { userId: auth.userId }
    if (status === 'open' || status === 'triaged' || status === 'dismissed') {
        where.status = status
    }

    const items = await prisma.inboxItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ items })
}

// POST /api/inbox — quick-capture a stray fact.
// Body: { text: string, source?: string }
// Returns the created item.
export async function POST(request: Request) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    let body: { text?: unknown; source?: unknown }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const textErr = requireString(body.text, 'text')
    if (textErr) return NextResponse.json({ error: textErr }, { status: 400 })

    const text = (body.text as string).trim()
    if (text.length > 2000) {
        return NextResponse.json({ error: 'text is too long (max 2000 chars)' }, { status: 400 })
    }

    const source = typeof body.source === 'string' && body.source.trim()
        ? body.source.trim().slice(0, 64)
        : 'quick_add'

    const item = await prisma.inboxItem.create({
        data: { userId: auth.userId, text, source },
    })

    return NextResponse.json({ item }, { status: 201 })
}
