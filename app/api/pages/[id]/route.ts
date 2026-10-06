import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { parseFields, stringifyFields, validateFields, FIELD_LIMITS } from '@/lib/utils'
import type { PassportField } from '@/lib/utils'
import { requireUser } from '@/lib/auth-helpers'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const page = await prisma.passportPage.findFirst({
        where: { id, userId: auth.userId },
        include: { versions: { orderBy: { version: 'desc' } } },
    })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
        ...page,
        fields: parseFields(page.fields),
        versions: page.versions.map((v) => ({
            ...v,
            fields: parseFields(v.fields),
        })),
    })
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    let body: { title?: unknown; fields?: unknown; editNote?: unknown }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const page = await prisma.passportPage.findFirst({
        where: { id, userId: auth.userId },
    })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let title = page.title
    if (typeof body.title === 'string' && body.title.trim()) {
        title = body.title.trim()
        if (title.length > FIELD_LIMITS.maxTitleLength) {
            return NextResponse.json(
                { error: `Title too long (max ${FIELD_LIMITS.maxTitleLength} characters)` },
                { status: 400 }
            )
        }
    }

    let fields: PassportField[]
    if (body.fields === undefined) {
        fields = parseFields(page.fields)
    } else {
        const validated = validateFields(body.fields)
        if (!validated.ok) {
            return NextResponse.json({ error: validated.error }, { status: 400 })
        }
        fields = validated.fields
    }

    const editNote =
        typeof body.editNote === 'string' && body.editNote.trim()
            ? body.editNote.trim()
            : null

    const jsonFields = stringifyFields(fields)

    // Compute the next version number INSIDE the transaction so two
    // concurrent PATCHes can't both read the same latest version and then
    // collide on @@unique([pageId, version]) (previously surfaced as a 500).
    try {
        const updated = await prisma.$transaction(async (tx) => {
            const latest = await tx.passportPageVersion.findFirst({
                where: { pageId: id },
                orderBy: { version: 'desc' },
                select: { version: true },
            })
            const nextVersion = (latest?.version ?? 0) + 1
            const result = await tx.passportPage.update({
                where: { id },
                data: { title, fields: jsonFields },
            })
            await tx.passportPageVersion.create({
                data: { pageId: id, version: nextVersion, title, fields: jsonFields, editNote },
            })
            return result
        })

        return NextResponse.json({
            ...updated,
            fields: parseFields(updated.fields),
        })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return NextResponse.json(
                { error: 'This page was edited at the same time elsewhere. Please retry.' },
                { status: 409 }
            )
        }
        throw e
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const page = await prisma.passportPage.findFirst({
        where: { id, userId: auth.userId },
    })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.passportPage.update({
        where: { id },
        data: { isActive: false },
    })
    return NextResponse.json({ success: true })
}