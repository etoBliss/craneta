'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'craneta-cookie-consent'

/**
 * Cookie consent banner.
 *
 * Shown on first visit (no `craneta-cookie-consent` cookie / localStorage
 * entry). Accept stores "1", Decline stores "0". Either choice hides the
 * banner. The "essential only" choice corresponds to Decline (we only
 * use one first-party session cookie for sign-in).
 */
export function CookieBanner() {
    // Default to hidden during SSR so the markup doesn't appear in the
    // HTML stream (avoids hydration mismatch + first-paint flash).
    // Once mounted, we read the external storage and decide whether to show.
    const [visible, setVisible] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Defer state mutation to the next microtask so we don't trigger
        // a cascading synchronous re-render inside the effect body.
        Promise.resolve().then(() => {
            setMounted(true)
            try {
                const v = window.localStorage.getItem(STORAGE_KEY)
                if (v === null) setVisible(true)
            } catch {
                // localStorage blocked (private mode etc.) — show banner as a safe default.
                setVisible(true)
            }
        })
    }, [])

    function decide(choice: 'accept' | 'decline') {
        try {
            window.localStorage.setItem(STORAGE_KEY, choice === 'accept' ? '1' : '0')
            // Also drop a first-party cookie for parity with read paths that
            // check cookies instead of localStorage.
            document.cookie = `${STORAGE_KEY}=${choice === 'accept' ? '1' : '0'}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
        } catch {
            // ignore — banner still hides below
        }
        setVisible(false)
    }

    if (!mounted) return null

    return (
        <div
            className={visible ? 'cookie-banner' : 'cookie-banner cookie-banner--hidden'}
            role="dialog"
            aria-label="Cookie consent"
            aria-hidden={!visible}
        >
            <div className="cookie-banner__copy">
                <strong>We use one cookie.</strong>{' '}
                Just the session cookie that keeps you signed in. No tracking, no third parties.{' '}
                <Link href="/privacy" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                    Privacy
                </Link>
            </div>
            <div className="cookie-banner__actions">
                <button
                    type="button"
                    className="cookie-banner__btn"
                    onClick={() => decide('decline')}
                >
                    Essential only
                </button>
                <button
                    type="button"
                    className="cookie-banner__btn cookie-banner__btn--primary"
                    onClick={() => decide('accept')}
                >
                    Accept
                </button>
            </div>
        </div>
    )
}