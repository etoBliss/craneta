import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { parseFields } from '@/lib/utils'
import { requireUser } from '@/lib/auth-helpers'

/**
 * POST /api/pages/[id]/revert  Body: { version: number }
 *
 * Restores a page's title/fields to an earlier immutable version — WITHOUT
 * rewriting history. It reads the target PassportPageVersion, updates the live
 * page to match, and appends a NEW version (editNote "Reverted to vN"). So the
 * revert is itself recorded and can be undone by reverting again. Mirrors the
 * versioning transaction in PATCH /api/pages/[id] to avoid @@unique collisions.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    let body: { version?: unknown }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const targetVersion =
        typeof body.version === 'number' && Number.isInteger(body.version)
            ? body.version
            : null
    if (targetVersion === null || targetVersion < 1) {
        return NextResponse.json(
            { error: 'A valid version number is required' },
            { status: 400 }
        )
    }

    const page = await prisma.passportPage.findFirst({
        where: { id, userId: auth.userId },
    })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const target = await prisma.passportPageVersion.findUnique({
        where: { pageId_version: { pageId: id, version: targetVersion } },
    })
    if (!target) {
        return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

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
                // target.fields is already stored in the canonical JSON format.
                data: { title: target.title, fields: target.fields },
            })
            await tx.passportPageVersion.create({
                data: {
                    pageId: id,
                    version: nextVersion,
                    title: target.title,
                    fields: target.fields,
                    editNote: `Reverted to v${targetVersion}`,
                },
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
