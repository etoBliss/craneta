import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth-helpers'

/**
 * POST /api/me/password — change the authenticated user's password.
 *
 * Requires the current password for verification. Returns 401 if the
 * current password is wrong, 400 if the new one fails policy.
 */
export async function POST(request: Request) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    let body: { current?: unknown; next?: unknown }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const current = typeof body.current === 'string' ? body.current : ''
    const next = typeof body.next === 'string' ? body.next : ''

    if (!current || !next) {
        return NextResponse.json(
            { error: 'Both current and new password are required' },
            { status: 400 }
        )
    }
    if (next.length < 8) {
        return NextResponse.json(
            { error: 'New password must be at least 8 characters' },
            { status: 400 }
        )
    }
    if (next.length > 200) {
        return NextResponse.json(
            { error: 'New password is too long' },
            { status: 400 }
        )
    }

    const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { passwordHash: true },
    })
    if (!user || !user.passwordHash) {
        return NextResponse.json(
            { error: 'Account does not use a password' },
            { status: 400 }
        )
    }

    const valid = await bcrypt.compare(current, user.passwordHash)
    if (!valid) {
        return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 401 }
        )
    }

    const sameAsOld = await bcrypt.compare(next, user.passwordHash)
    if (sameAsOld) {
        return NextResponse.json(
            { error: 'New password must be different from the current one' },
            { status: 400 }
        )
    }

    const passwordHash = await bcrypt.hash(next, 12)
    await prisma.user.update({
        where: { id: auth.userId },
        data: { passwordHash, authVersion: { increment: 1 } },
    })

    return NextResponse.json({ ok: true })
}
