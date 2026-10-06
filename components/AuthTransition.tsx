'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

const DIRECTION_KEY = 'craneta-auth-direction'
const EXIT_DURATION_MS = 280

/** A short forward/back motion that carries the form between auth routes. */
export function AuthTransition({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const rootRef = useRef<HTMLDivElement>(null)
    const navigating = useRef(false)

    useLayoutEffect(() => {
        const root = rootRef.current
        if (!root) return
        const direction = window.sessionStorage.getItem(DIRECTION_KEY)
        if (direction !== 'forward' && direction !== 'back') return

        root.classList.add(direction === 'forward' ? 'auth-transition-root--from-right' : 'auth-transition-root--from-left')
        const frame = requestAnimationFrame(() => {
            root.classList.add('auth-transition-root--entering')
        })
        const timer = window.setTimeout(() => {
            root.classList.remove('auth-transition-root--from-right', 'auth-transition-root--from-left', 'auth-transition-root--entering')
            window.sessionStorage.removeItem(DIRECTION_KEY)
        }, 560)
        return () => {
            cancelAnimationFrame(frame)
            window.clearTimeout(timer)
        }
    }, [pathname])

    useLayoutEffect(() => {
        const root = rootRef.current
        if (!root) return

        function onClick(event: MouseEvent) {
            const target = event.target as HTMLElement | null
            const link = target?.closest<HTMLAnchorElement>('a[href^="/auth/"]')
            if (!link || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || navigating.current) return

            const href = link.getAttribute('href') || ''
            if (!href.startsWith('/auth/signin') && !href.startsWith('/auth/signup')) return
            if (href === pathname) return

            event.preventDefault()
            navigating.current = true
            const forward = pathname.includes('/signin') && href.includes('/signup')
            const direction = forward ? 'forward' : 'back'
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            if (reduced) {
                router.push(href)
                return
            }

            window.sessionStorage.setItem(DIRECTION_KEY, direction)
            root?.classList.add(forward ? 'auth-transition-root--exit-forward' : 'auth-transition-root--exit-back')
            window.setTimeout(() => router.push(href), EXIT_DURATION_MS)
        }

        root.addEventListener('click', onClick)
        return () => root.removeEventListener('click', onClick)
    }, [pathname, router])

    return <div ref={rootRef} className="auth-transition-root">{children}</div>
}
