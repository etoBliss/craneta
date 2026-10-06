import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import DashboardPageShell from '@/components/DashboardPageShell'
import SettingsClient from '@/components/SettingsClient'

export const metadata: Metadata = {
    title: 'Settings',
    description: 'Manage your password and connected tools.',
    robots: { index: false, follow: false },
}

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) return null

    const [user, connectedTools] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        }),
        prisma.connectedTool.count({
            where: { userId, isActive: true },
        }),
    ])

    return (
        <DashboardPageShell
            eyebrow="Settings"
            title="Settings"
            description="Tune how Craneta works for you. Manage your password, see what tools you've connected, and review security controls."
        >
            <SettingsClient
                userEmail={user?.email ?? ''}
                connectedToolsCount={connectedTools}
            />
        </DashboardPageShell>
    )
}
