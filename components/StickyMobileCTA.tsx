'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

/**
 * Sticky mobile CTA shown on the landing page only (≤767px).
 * Sits above the dashboard bottom-nav (which isn't rendered on /).
 * Hidden until the user scrolls past 360px so the in-hero CTA gets
 * first crack at attention.
 */
export function StickyMobileCTA() {
    const [visible, setVisible] = useState(false)
    const lastY = useRef(0)
    const ticking = useRef(false)

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        if (mq.matches) return

        function update() {
            const y = window.scrollY
            const delta = y - lastY.current
            if (Math.abs(delta) < 6) {
                ticking.current = false
                return
            }
            // Show after scrolling past the hero, hide when scrolling back up
            if (delta > 0 && y > 360) setVisible(false)
            else if (delta < 0) setVisible(true)
            lastY.current = y
            ticking.current = false
        }

        function onScroll() {
            if (!ticking.current) {
                ticking.current = true
                window.requestAnimationFrame(update)
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <Link
            href="/auth/signup"
            className={visible ? 'sticky-mobile-cta' : 'sticky-mobile-cta sticky-mobile-cta--hidden'}
            aria-hidden={!visible}
        >
            Get your passport
            <span aria-hidden>→</span>
        </Link>
    )
}