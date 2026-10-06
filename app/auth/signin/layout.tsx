import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Sign in',
    description: 'Sign in to your Craneta passport and pick up where you left off.',
    alternates: { canonical: '/auth/signin' },
    robots: { index: false, follow: false },
    openGraph: {
        title: 'Sign in — Craneta',
        description: 'Pick up where you left off. Your passport, your context, exactly as you left it.',
        url: '/auth/signin',
    },
}

export default function SignInLayout({ children }: { children: React.ReactNode }) {
    return children
}