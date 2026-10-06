import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Create your Craneta account',
    description: 'Create a home for your writing voice, working style, and the context you choose to carry into AI chats.',
    alternates: { canonical: '/auth/signup' },
    robots: { index: true, follow: true },
    openGraph: {
        title: 'Create your Craneta account',
        description: 'Set up your portable context in a few minutes.',
        url: '/auth/signup',
    },
}

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
    return children
}
