import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth-helpers'
import bcrypt from 'bcryptjs'

/**
 * GET /api/me — returns the authenticated user's profile + summary stats.
 */
export async function GET() {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const [pageCount, connectedTools, inboxOpen] = await Promise.all([
        prisma.passportPage.count({
            where: { userId: auth.userId, isActive: true },
        }),
        prisma.connectedTool.count({
            where: { userId: auth.userId, isActive: true },
        }),
        prisma.inboxItem.count({
            where: { userId: auth.userId, status: 'open' },
        }),
    ])

    return NextResponse.json({
        user,
        stats: { pageCount, connectedTools, inboxOpen },
    })
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * PATCH /api/me — update the authenticated user's profile (name + email).
 *
 * We never expose passwordHash here. Use /api/me/password for that.
 */
export async function PATCH(request: Request) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    let body: { name?: unknown; email?: unknown }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const updates: { name?: string | null; email?: string } = {}

    if (body.name !== undefined) {
        if (typeof body.name !== 'string') {
            return NextResponse.json({ error: 'Name must be a string' }, { status: 400 })
        }
        const trimmed = body.name.trim()
        if (trimmed.length > 80) {
            return NextResponse.json({ error: 'Name is too long (max 80 characters)' }, { status: 400 })
        }
        // Allow empty name (clears it): store null for consistency with register.
        updates.name = trimmed.length === 0 ? null : trimmed
    }

    if (body.email !== undefined) {
        if (typeof body.email !== 'string') {
            return NextResponse.json({ error: 'Email must be a string' }, { status: 400 })
        }
        const normalized = body.email.trim().toLowerCase()
        if (!EMAIL_REGEX.test(normalized)) {
            return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
        }
        if (normalized.length > 254) {
            return NextResponse.json({ error: 'Email is too long' }, { status: 400 })
        }
        // Collision check — exclude this user.
        const conflict = await prisma.user.findFirst({
            where: { email: normalized, NOT: { id: auth.userId } },
            select: { id: true },
        })
        if (conflict) {
            return NextResponse.json(
                { error: 'That email is already in use by another account' },
                { status: 409 }
            )
        }
        updates.email = normalized
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await prisma.user.update({
        where: { id: auth.userId },
        data: updates,
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    })

    return NextResponse.json({ user: updated })
}

/**
 * DELETE /api/me — permanently delete the authenticated user's account and
 * all dependent records (cascade). The client should sign the user out
 * immediately after a successful response.
 */
export async function DELETE(request: Request) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    let body: { password?: unknown; confirmation?: unknown }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Confirm account deletion to continue' }, { status: 400 })
    }
    if (body.confirmation !== 'delete my account' || typeof body.password !== 'string' || !body.password) {
        return NextResponse.json({ error: 'Enter the confirmation phrase and your password' }, { status: 400 })
    }
    const account = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { passwordHash: true },
    })
    if (!account?.passwordHash || !(await bcrypt.compare(body.password, account.passwordHash))) {
        return NextResponse.json({ error: 'The password is incorrect' }, { status: 401 })
    }

    await prisma.user.delete({ where: { id: auth.userId } })
    return NextResponse.json({ ok: true })
}
