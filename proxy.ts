import { withAuth } from 'next-auth/middleware'

/**
 * Route protection , Next.js 16 renamed `middleware.ts` to `proxy.ts`.
 * Anyone without a valid session trying to hit a protected route gets
 * redirected to /auth/signin.
 */
export default withAuth({
    pages: {
        signIn: '/auth/signin',
    },
})

export const config = {
    matcher: ['/dashboard/:path*'],
}
