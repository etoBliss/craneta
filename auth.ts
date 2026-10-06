import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { peek, hit, reset } from '@/lib/rate-limit'
import type { NextAuthOptions, DefaultSession } from 'next-auth'

/**
 * Validate NEXTAUTH_SECRET at boot.
 * NextAuth requires it in production; we warn loudly in dev so the issue
 * is obvious if someone clones the repo and forgets to set it.
 */
if (!process.env.NEXTAUTH_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('NEXTAUTH_SECRET is required in production')
    } else {
        console.warn('⚠️  NEXTAUTH_SECRET is not set. Using a development fallback. do NOT do this in production.')
    }
}

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
        } & DefaultSession['user']
    }
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET ?? 'dev-only-insecure-secret-do-not-use',
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/auth/signin',
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const email = credentials.email.trim().toLowerCase()
                const password = credentials.password

                // Throttle credential stuffing. We count *failed* attempts per
                // email (see the hit() calls below) and refuse once too many
                // pile up in the window — a successful login clears the counter,
                // so a legitimate user typing their real password is unaffected.
                const rlKey = `login:${email}`
                const LOGIN_LIMIT = 10
                const LOGIN_WINDOW_MS = 15 * 60 * 1000
                if (!peek(rlKey, LOGIN_LIMIT).ok) return null

                try {
                    const user = await prisma.user.findUnique({
                        where: { email },
                    })
                    if (!user || !user.passwordHash) {
                        hit(rlKey, LOGIN_LIMIT, LOGIN_WINDOW_MS)
                        return null
                    }

                    const valid = await bcrypt.compare(password, user.passwordHash)
                    if (!valid) {
                        hit(rlKey, LOGIN_LIMIT, LOGIN_WINDOW_MS)
                        return null
                    }

                    // Success — clear the failure counter for this email.
                    reset(rlKey)
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name ?? undefined,
                        authVersion: user.authVersion,
                    }
                } catch (err) {
                    console.error('Authorize error:', err)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.authVersion = (user as typeof user & { authVersion?: number }).authVersion ?? 0
            } else if (token.id) {
                const version = typeof token.authVersion === 'number' ? token.authVersion : 0
                const current = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { authVersion: true },
                })
                if (!current || current.authVersion !== version) {
                    delete token.id
                    delete token.authVersion
                } else {
                    token.authVersion = version
                }
            }
            return token
        },
        async session({ session, token }) {
            if (token?.id && session.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
}
