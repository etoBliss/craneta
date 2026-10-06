'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import type { IconName } from '@/components/Icon'

interface NavItem {
    href: string
    label: string
    icon: IconName
}

const PRIMARY: NavItem[] = [
    { href: '/dashboard', label: 'Passport', icon: 'passport' },
    { href: '/dashboard/inbox', label: 'Inbox', icon: 'inbox' },
    { href: '/dashboard/export', label: 'Export', icon: 'export' },
    { href: '/dashboard/profile', label: 'Profile', icon: 'user' },
]

function activeFor(pathname: string, href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
}

/**
 * Mobile bottom navigation bar.
 *
 * - Always visible on viewports below the `lg` breakpoint (≤1023px).
 * - Four slots: Passport · Inbox · Export · Profile. (The other two
 *   sidebar destinations — Templates + Settings — live behind the
 *   navigation rail's expand-on-hover desktop affordance and remain
 *   reachable on mobile via /dashboard/profile. We deliberately keep
 *   the bottom bar to 4 destinations so the labels read clearly.)
 * - Auto-hides when the user scrolls DOWN past 80px, reappears on
 *   scroll UP. Respects `prefers-reduced-motion`.
 * - Renders nothing on desktop; the sidebar rail takes over.
 */
export default function MobileNav() {
    const pathname = usePathname()
    const [visible, setVisible] = useState(true)
    const lastY = useRef(0)
    const ticking = useRef(false)

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        if (mq.matches) return

        function update() {
            const y = window.scrollY
            // Only react when there's a meaningful scroll delta to avoid jitter.
            const delta = y - lastY.current
            if (Math.abs(delta) < 6) {
                ticking.current = false
                return
            }
            if (delta > 0 && y > 80) {
                // Scrolling down → hide
                setVisible(false)
            } else if (delta < 0) {
                // Scrolling up → show
                setVisible(true)
            }
            lastY.current = y
            ticking.current = false
        }

        function onScroll() {
            if (!ticking.current) {
                ticking.current = true
                requestAnimationFrame(update)
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav
            className={
                'mobile-nav lg:hidden' +
                (visible ? ' mobile-nav--visible' : ' mobile-nav--hidden')
            }
            aria-label="Primary"
        >
            <ul className="mobile-nav__list">
                {PRIMARY.map((item) => {
                    const active = activeFor(pathname, item.href)
                    return (
                        <li key={item.href} className="mobile-nav__item">
                            <Link
                                href={item.href}
                                className={
                                    active
                                        ? 'mobile-nav__link mobile-nav__link--active'
                                        : 'mobile-nav__link'
                                }
                                aria-current={active ? 'page' : undefined}
                            >
                                <Icon name={item.icon} size={20} />
                                <span className="mobile-nav__label">{item.label}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
