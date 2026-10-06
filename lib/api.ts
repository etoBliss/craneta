import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getUserId } from '@/lib/auth-helpers'

/**
 * Shared request/response layer for API route handlers.
 *
 * Goal: a handler reads top-to-bottom with no boilerplate —
 *
 *   export async function POST(request: Request) {
 *     try {
 *       const userId = await requireUserId()
 *       const body = await readJson<{ title?: unknown }>(request)
 *       if (!body.title) throw new ApiError(400, 'title is required')
 *       ...
 *       return ok(result, { status: 201 })
 *     } catch (err) {
 *       return handleError(err)
 *     }
 *   }
 *
 * Every success is a raw JSON body and every error is `{ error: string }`,
 * matching what the existing client already reads — so this standardizes the
 * shape without changing the wire contract.
 */

/** Throw inside a handler to short-circuit with a specific status + message. */
export class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

/** JSON success response. */
export function ok<T>(
    data: T,
    init?: { status?: number; headers?: HeadersInit }
): NextResponse {
    return NextResponse.json(data, init)
}

/** JSON error response — always `{ error: string }`. */
export function fail(message: string, status = 400, headers?: HeadersInit): NextResponse {
    return NextResponse.json({ error: message }, { status, headers })
}

/** Parse a JSON request body; throws `ApiError(400)` on malformed input. */
export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
    try {
        return (await request.json()) as T
    } catch {
        throw new ApiError(400, 'Invalid JSON')
    }
}

/** Require an authenticated user; throws `ApiError(401)` if not signed in. */
export async function requireUserId(): Promise<string> {
    const userId = await getUserId()
    if (!userId) throw new ApiError(401, 'Unauthorized')
    return userId
}

/** Best-effort client IP from proxy headers, for rate-limit keys. */
export function clientIp(request: Request): string | null {
    // Trust only the proxy-supplied single-address header. The first X-Forwarded-For
    // entry can be supplied by the client on common proxy chains.
    return request.headers.get('x-real-ip')?.trim() || null
}

/**
 * Map a thrown error to a response. Keeps every route's error shape identical
 * and stops stack traces / Prisma internals leaking to the client. Call this
 * from each handler's catch block.
 */
export function handleError(err: unknown): NextResponse {
    if (err instanceof ApiError) return fail(err.message, err.status)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') return fail('That already exists.', 409)
        if (err.code === 'P2025') return fail('Not found.', 404)
    }
    console.error('Unhandled API error:', err)
    return fail('Something went wrong. Please try again.', 500)
}
