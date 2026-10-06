import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { stringifyFields } from '@/lib/utils'
import { ApiError, readJson, ok, fail, clientIp, handleError } from '@/lib/api'
import { hit } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Seed pages every new account starts with (all fields empty, ready to fill). */
const DEFAULT_PAGES = [
    {
        category: 'working_style',
        title: 'Working Style',
        fields: [
            { key: 'focus', label: 'How I focus best', value: '' },
            { key: 'hours', label: 'Preferred working hours', value: '' },
            { key: 'structure', label: 'How structured I like my work', value: '' },
            { key: 'collaboration', label: 'Collaboration preferences', value: '' },
        ],
    },
    {
        category: 'standing_facts',
        title: 'Standing Facts',
        fields: [
            { key: 'role', label: 'Current role / title', value: '' },
            { key: 'domain', label: 'Domain / industry', value: '' },
            { key: 'location', label: 'Location / timezone', value: '' },
            { key: 'tools', label: 'Primary tools', value: '' },
        ],
    },
    {
        category: 'communication_preferences',
        title: 'Communication Preferences',
        fields: [
            { key: 'tone', label: 'Preferred tone', value: '' },
            { key: 'format', label: 'Preferred response format', value: '' },
            { key: 'verbosity', label: 'Verbosity level', value: '' },
            { key: 'avoid', label: 'Things to avoid', value: '' },
        ],
    },
    {
        category: 'active_projects',
        title: 'Active Projects',
        fields: [
            { key: 'project1', label: 'Project 1', value: '' },
            { key: 'project2', label: 'Project 2', value: '' },
            { key: 'goals', label: 'Current goals', value: '' },
            { key: 'blockers', label: 'Current blockers', value: '' },
        ],
    },
]

export async function POST(request: Request) {
    try {
        // Throttle sign-ups per IP so the "already exists" response below can't
        // be used to enumerate accounts en masse.
        const ip = clientIp(request)
        if (!ip && process.env.NODE_ENV === 'production') {
            return fail('Sign-up is temporarily unavailable.', 503)
        }
        const rl = ip ? hit(`register:${ip}`, 8, 15 * 60 * 1000) : null
        if (rl && !rl.ok) {
            return fail('Too many sign-up attempts. Please try again later.', 429, {
                'Retry-After': String(rl.retryAfterSec),
            })
        }

        const body = await readJson<{ name?: unknown; email?: unknown; password?: unknown }>(request)

        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
        const password = typeof body.password === 'string' ? body.password : ''
        const name =
            typeof body.name === 'string' && body.name.trim()
                ? body.name.trim().slice(0, 80)
                : null

        if (!email) throw new ApiError(400, 'Email is required')
        if (!EMAIL_REGEX.test(email) || email.length > 254) {
            throw new ApiError(400, 'Please enter a valid email address')
        }
        if (!password || password.length < 8) {
            throw new ApiError(400, 'Password must be at least 8 characters')
        }
        if (password.length > 200) {
            throw new ApiError(400, 'Password is too long')
        }

        const existing = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        })
        if (existing) {
            // This does reveal the email is registered — a deliberate UX choice
            // for sign-up. Enumeration-at-scale is blunted by the rate limit above.
            throw new ApiError(409, 'An account with this email already exists')
        }

        const passwordHash = await bcrypt.hash(password, 12)

        // User + seed pages + v1 version rows all created atomically, so a
        // failure can never leave a half-provisioned account behind.
        const user = await prisma.$transaction(async (tx) => {
            const created = await tx.user.create({
                data: { email, name, passwordHash },
                select: { id: true, email: true, name: true, createdAt: true },
            })
            for (const page of DEFAULT_PAGES) {
                const jsonFields = stringifyFields(page.fields)
                const p = await tx.passportPage.create({
                    data: {
                        userId: created.id,
                        category: page.category,
                        title: page.title,
                        fields: jsonFields,
                    },
                })
                await tx.passportPageVersion.create({
                    data: {
                        pageId: p.id,
                        version: 1,
                        title: p.title,
                        fields: jsonFields,
                        editNote: 'Initial page',
                    },
                })
            }
            return created
        })

        return ok({ user }, { status: 201 })
    } catch (err) {
        return handleError(err)
    }
}
