/**
 * In-memory rate limiter (fixed window).
 *
 * Right-sized for this app: a single Node process backed by SQLite. Counters
 * live in module memory and reset on restart. If this ever runs on more than
 * one instance, back these functions with Redis/Upstash — the call sites
 * (`hit` / `peek` / `reset`) don't need to change.
 */

interface Bucket {
    count: number
    resetAt: number
}

const buckets = new Map<string, Bucket>()
// Backstop so a flood of distinct keys (emails, IPs) can't grow the map without
// bound. When we cross this, drop everything already expired.
const MAX_BUCKETS = 10_000

function sweep(now: number): void {
    if (buckets.size < MAX_BUCKETS) return
    for (const [key, b] of buckets) {
        if (now >= b.resetAt) buckets.delete(key)
    }
}

export interface RateLimitResult {
    ok: boolean
    /** Seconds until the window resets; 0 when `ok` is true. */
    retryAfterSec: number
}

/**
 * Count one request against `key` and report whether it's within `limit`
 * per `windowMs`. Increments the counter.
 */
export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now()
    sweep(now)
    const b = buckets.get(key)
    if (!b || now >= b.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs })
        return { ok: true, retryAfterSec: 0 }
    }
    if (b.count >= limit) {
        return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) }
    }
    b.count += 1
    return { ok: true, retryAfterSec: 0 }
}

/** Read the current count for `key` WITHOUT incrementing it. */
export function peek(key: string, limit: number): RateLimitResult {
    const now = Date.now()
    const b = buckets.get(key)
    if (!b || now >= b.resetAt) return { ok: true, retryAfterSec: 0 }
    if (b.count >= limit) {
        return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) }
    }
    return { ok: true, retryAfterSec: 0 }
}

/** Clear a key's counter — e.g. after a successful login. */
export function reset(key: string): void {
    buckets.delete(key)
}
