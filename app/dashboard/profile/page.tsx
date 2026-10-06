import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import DashboardPageShell from '@/components/DashboardPageShell'
import ProfileClient from '@/components/ProfileClient'

export const metadata: Metadata = {
    title: 'Profile',
    description: 'Your Craneta account basics — name, email, and account deletion.',
    robots: { index: false, follow: false },
}

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) return null

    const [user, pageCount, connectedTools, inboxOpen] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, createdAt: true },
        }),
        prisma.passportPage.count({ where: { userId, isActive: true } }),
        prisma.connectedTool.count({ where: { userId, isActive: true } }),
        prisma.inboxItem.count({ where: { userId, status: 'open' } }),
    ])

    if (!user) return null

    return (
        <DashboardPageShell
            eyebrow="Profile"
            title="Your profile"
            description="The basics: who you are on Craneta. Touch anything here and the rest of the app picks up the new identity automatically."
        >
            <ProfileClient
                initialUser={{
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt.toISOString(),
                }}
                stats={{ pageCount, connectedTools, inboxOpen }}
            />
        </DashboardPageShell>
    )
}
