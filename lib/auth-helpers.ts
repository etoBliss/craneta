import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { NextResponse } from 'next/server'

/**
 * Returns the authenticated user ID, or null.
 * Use as the first line of any protected API route.
 */
export async function getUserId(): Promise<string | null> {
    const session = await getServerSession(authOptions)
    const id = (session?.user as { id?: string } | undefined)?.id
    return id ?? null
}

/**
 * Returns either a 401 NextResponse, or the user ID.
 * Convenience wrapper for the most common route pattern.
 */
export async function requireUser(): Promise<{ userId: string } | NextResponse> {
    const userId = await getUserId()
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return { userId }
}

/**
 * Validates a value is a non-empty trimmed string.
 */
export function requireString(value: unknown, name: string): string | null {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return `${name} is required`
    }
    return null
}

/**
 * Validates a value is a string array.
 */
export function requireStringArray(value: unknown, name: string): string | null {
    if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
        return `${name} must be an array of strings`
    }
    return null
}