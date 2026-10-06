import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'
import MobileHeader from '@/components/MobileHeader'
import QuickAdd from '@/components/QuickAdd'
import DashboardPageMotion from '@/components/DashboardPageMotion'

const DASHBOARD_NAV = [
    { href: '/dashboard', label: 'Passport', icon: 'passport' as const },
    { href: '/dashboard/inbox', label: 'Inbox', icon: 'inbox' as const },
    { href: '/dashboard/templates', label: 'Templates', icon: 'sparkle' as const },
    { href: '/dashboard/export', label: 'Export', icon: 'export' as const },
    { href: '/dashboard/tools', label: 'Tools', icon: 'plug' as const },
    { href: '/dashboard/stamps', label: 'Stamps', icon: 'stamp' as const },
]

/**
 * Dashboard chrome. Middleware already redirects unauthenticated users
 * to /auth/signin, but we re-check here as defense-in-depth and to
 * surface the typed session to client components.
 */
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect('/auth/signin')

    return (
        <div
            className="min-h-screen flex"
            style={{ backgroundColor: 'var(--page-canvas)', color: 'var(--ink)' }}
        >
            <DashboardSidebar user={session.user} />
            <div className="flex-1 min-w-0 flex flex-col">
                <MobileHeader user={session.user} navItems={DASHBOARD_NAV} />
                <main className="flex-1 min-w-0 overflow-x-hidden"><DashboardPageMotion>{children}</DashboardPageMotion></main>
            </div>
            <QuickAdd />
        </div>
    )
}
