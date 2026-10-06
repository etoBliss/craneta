'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Icon from '@/components/Icon'
import type { IconName } from '@/components/Icon'
import { Logo } from '@/components/Logo'

interface SidebarUser {
    name?: string | null
    email?: string | null
}

interface NavItem {
    href: string
    label: string
    icon: IconName
}

const NAV: NavItem[] = [
    { href: '/dashboard', label: 'Passport', icon: 'passport' },
    { href: '/dashboard/inbox', label: 'Inbox', icon: 'inbox' },
    { href: '/dashboard/templates', label: 'Templates', icon: 'sparkle' },
    { href: '/dashboard/export', label: 'Export', icon: 'export' },
    { href: '/dashboard/tools', label: 'Tools', icon: 'plug' },
    { href: '/dashboard/stamps', label: 'Stamps', icon: 'stamp' },
]

const SETTINGS: NavItem = { href: '/dashboard/settings', label: 'Settings', icon: 'settings' }
const PROFILE: NavItem = { href: '/dashboard/profile', label: 'Profile', icon: 'user' }

const FOOTER: NavItem[] = [PROFILE, SETTINGS]

function isActive(pathname: string, href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
}

/** Persistent, fully labeled workspace navigation with brand and account links. */
export default function DashboardSidebar({ user }: { user: SidebarUser }) {
    const pathname = usePathname()
    const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase()
    const displayName = user.name?.trim() || 'Your passport'
    const displayEmail = user.email ?? ''

    return (
        <aside className="icon-rail" aria-label="Primary">
            {/* Brand lockup */}
            <Link href="/dashboard" className="icon-rail__brand" aria-label="Craneta dashboard">
                <Logo />
            </Link>

            {/* Main nav */}
            <nav className="icon-rail__nav" aria-label="Main">
                {NAV.map((item) => {
                    const active = isActive(pathname, item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                active
                                    ? 'icon-rail__item icon-rail__item--active'
                                    : 'icon-rail__item'
                            }
                            aria-current={active ? 'page' : undefined}
                        >
                            <Icon name={item.icon} size={18} />
                            <span className="icon-rail__label">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="icon-rail__spacer" />

            {/* Footer — profile + settings + sign out */}
            <div className="icon-rail__footer">
                {FOOTER.map((item) => {
                    const active = isActive(pathname, item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                active
                                    ? 'icon-rail__item icon-rail__item--active'
                                    : 'icon-rail__item'
                            }
                            aria-current={active ? 'page' : undefined}
                        >
                            <Icon name={item.icon} size={18} />
                            <span className="icon-rail__label">{item.label}</span>
                        </Link>
                    )
                })}

                <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    id="sign-out-btn"
                    className="icon-rail__item"
                    aria-label="Sign out"
                    type="button"
                >
                    <Icon name="logout" size={18} />
                    <span className="icon-rail__label">Sign out</span>
                </button>
            </div>

            {/* User identity strip */}
            <Link
                href="/dashboard/profile"
                className="icon-rail__identity"
                aria-label={`Open profile for ${displayName}`}
            >
                <span className="icon-rail__avatar" aria-hidden>{initial}</span>
                <span className="icon-rail__identity-text">
                    <span className="icon-rail__identity-name">{displayName}</span>
                    {displayEmail ? (
                        <span className="icon-rail__identity-email">{displayEmail}</span>
                    ) : null}
                </span>
            </Link>
        </aside>
    )
}
