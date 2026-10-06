'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Icon from '@/components/Icon'
import type { IconName } from '@/components/Icon'
import { Logo } from '@/components/Logo'

interface NavItem {
    href: string
    label: string
    icon: IconName
}

interface MobileHeaderProps {
    user: {
        name?: string | null
        email?: string | null
    }
    navItems: NavItem[]
}

/**
 * Mobile-only top bar + drawer. Desktop users see the full sidebar shell.
 * Drawer is white-on-canvas with emerald accents — matches the new aesthetic.
 */
export default function MobileHeader({ user, navItems }: MobileHeaderProps) {
    const [open, setOpen] = useState(false)
    const shouldReduceMotion = useReducedMotion()
    const pathname = usePathname()
    const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase()

    // Close the drawer when browser Back/Forward changes the active route.
    useEffect(() => {
        const closeDrawer = () => setOpen(false)
        window.addEventListener('popstate', closeDrawer)
        return () => window.removeEventListener('popstate', closeDrawer)
    }, [])

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    return (
        <>
            {/* Top bar — only on mobile */}
            <header
                className="md:hidden sticky top-0 z-30 flex items-center justify-between px-5 py-3"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--ink-10)',
                }}
            >
                <Link href="/dashboard" aria-label="Craneta home" className="flex items-center">
                    <Logo />
                </Link>
                <button
                    onClick={() => setOpen((v) => !v)}
                    id="mobile-menu-btn"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    className=""
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-3)',
                        border: '1px solid var(--ink-10)',
                        backgroundColor: 'var(--white)',
                        color: 'var(--ink)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                >
                    {open ? <Icon name="close" size={18} /> : <Icon name="plus" size={18} className="rotate-45" />}
                </button>
            </header>

            {/* Drawer — mobile only */}
            <AnimatePresence>
            {open && (
                <motion.div
                    className="md:hidden fixed inset-0 z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                    style={{ backgroundColor: 'rgba(14, 17, 22, 0.40)' }}
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-0 right-0 h-full w-[88%] max-w-[340px] flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Dashboard navigation"
                        initial={{ x: shouldReduceMotion ? 0 : '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: shouldReduceMotion ? 0 : '100%' }}
                        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 38 }}
                        style={{
                            backgroundColor: 'var(--white)',
                            color: 'var(--ink)',
                            boxShadow: '-12px 0 40px rgba(14, 17, 22, 0.18)',
                        }}
                    >
                        {/* Top — brand + close */}
                        <div
                            className="flex items-center justify-between px-6 pt-7 pb-6"
                            style={{ borderBottom: '1px solid var(--ink-10)' }}
                        >
                            <Logo />
                            <button
                                onClick={() => setOpen(false)}
                                aria-label="Close menu"
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 'var(--radius-3)',
                                    border: '1px solid var(--ink-10)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--ink)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <Icon name="close" size={16} />
                            </button>
                        </div>

                        {/* User */}
                        <div
                            className="px-6 py-6 flex items-center gap-3"
                            style={{ borderBottom: '1px solid var(--ink-10)' }}
                        >
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--ink)',
                                    color: 'var(--white)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-display)',
                                    flexShrink: 0,
                                }}
                            >
                                {initial}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-14)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.name || 'Your passport'}
                                </div>
                                <div style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-50)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="flex-1 px-4 py-6 overflow-y-auto">
                            <div
                                style={{
                                    fontSize: 'var(--fs-12)',
                                    fontWeight: 600,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: 'var(--ink-50)',
                                    padding: '4px 14px 12px',
                                }}
                            >
                                Navigate
                            </div>
                            {navItems.map((item) => {
                                const isActive =
                                    item.href === '/dashboard'
                                        ? pathname === '/dashboard'
                                        : pathname.startsWith(item.href)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={isActive ? 'nav-link nav-link--active' : 'nav-link'}
                                        onClick={() => setOpen(false)}
                                    >
                                        <Icon name={item.icon} size={18} />
                                        <span style={{ minWidth: 0, flex: 1 }}>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Footer — sign out */}
                        <div
                            className="px-4 pb-8 pt-2"
                            style={{ borderTop: '1px solid var(--ink-10)' }}
                        >
                            <button
                                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                                id="mobile-sign-out-btn"
                                className="nav-link"
                                style={{
                                    width: '100%',
                                    cursor: 'pointer',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <Icon name="logout" size={18} />
                                <span style={{ minWidth: 0, flex: 1 }}>Sign out</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

        </>
    )
}
