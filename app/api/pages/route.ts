import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFields, stringifyFields, validateFields, FIELD_LIMITS } from '@/lib/utils'
import { requireUser, requireString } from '@/lib/auth-helpers'
import { CATEGORY_META } from '@/lib/constants'

// GET all pages for current user
export async function GET() {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const pages = await prisma.passportPage.findMany({
        where: { userId: auth.userId, isActive: true },
        orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(
        pages.map((page) => ({ ...page, fields: parseFields(page.fields) }))
    )
}

// POST create new page
export async function POST(request: Request) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    let body: { category?: unknown; title?: unknown; fields?: unknown }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const catErr = requireString(body.category, 'category')
    if (catErr) return NextResponse.json({ error: catErr }, { status: 400 })
    const titleErr = requireString(body.title, 'title')
    if (titleErr) return NextResponse.json({ error: titleErr }, { status: 400 })

    const category = (body.category as string).trim()
    if (!(category in CATEGORY_META)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    const title = (body.title as string).trim()
    if (title.length > FIELD_LIMITS.maxTitleLength) {
        return NextResponse.json(
            { error: `Title too long (max ${FIELD_LIMITS.maxTitleLength} characters)` },
            { status: 400 }
        )
    }

    const validated = validateFields(body.fields)
    if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 })
    }
    const jsonFields = stringifyFields(validated.fields)

    // Create the page and its first version atomically, so a page can never
    // exist without its v1 history row (previously two un-transacted awaits).
    const page = await prisma.$transaction(async (tx) => {
        const created = await tx.passportPage.create({
            data: { userId: auth.userId, category, title, fields: jsonFields },
        })
        await tx.passportPageVersion.create({
            data: {
                pageId: created.id,
                version: 1,
                title: created.title,
                fields: jsonFields,
                editNote: 'Page created',
            },
        })
        return created
    })

    return NextResponse.json(
        { ...page, fields: parseFields(page.fields) },
        { status: 201 }
    )
}