import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFields } from '@/lib/utils'
import { requireUser } from '@/lib/auth-helpers'

const VALID_FORMATS = new Set(['json', 'text', 'markdown'])

/** Parse a stored JSON string, tolerating null/legacy/garbage values. */
function safeJson(value: string | null): unknown {
    if (!value) return null
    try {
        return JSON.parse(value)
    } catch {
        return null
    }
}

/** Split a comma-separated id list, dropping empties. */
function idList(value: string | null): string[] {
    return value ? value.split(',').filter(Boolean) : []
}

export async function GET(request: Request) {
    const auth = await requireUser()
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || 'json').toLowerCase()
    if (!VALID_FORMATS.has(format)) {
        return NextResponse.json(
            { error: 'Invalid format. Use json, text, or markdown.' },
            { status: 400 }
        )
    }

    const [user, pages] = await Promise.all([
        prisma.user.findUnique({
            where: { id: auth.userId },
            select: { id: true, email: true, name: true, createdAt: true },
        }),
        prisma.passportPage.findMany({
            where: { userId: auth.userId, isActive: true },
            orderBy: { createdAt: 'asc' },
        }),
    ])

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (format === 'json') {
        // A full-account archive — "zero omissions" so it can restore the
        // passport later. Includes inactive (soft-deleted) pages, every
        // immutable version, connected tools, the stamp trail, and the inbox.
        const [archivePages, tools, stamps, inbox] = await Promise.all([
            prisma.passportPage.findMany({
                where: { userId: auth.userId },
                orderBy: { createdAt: 'asc' },
                include: { versions: { orderBy: { version: 'asc' } } },
            }),
            prisma.connectedTool.findMany({
                where: { userId: auth.userId },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.stampEvent.findMany({
                where: { userId: auth.userId },
                orderBy: { stampedAt: 'asc' },
            }),
            prisma.inboxItem.findMany({
                where: { userId: auth.userId },
                orderBy: { createdAt: 'asc' },
            }),
        ])

        const exportData = {
            craneta_version: '1.0',
            exported_at: new Date().toISOString(),
            user: {
                name: user.name,
                email: user.email,
                created_at: user.createdAt,
            },
            passport_pages: archivePages.map((p) => ({
                id: p.id,
                category: p.category,
                title: p.title,
                is_active: p.isActive,
                created_at: p.createdAt,
                updated_at: p.updatedAt,
                fields: parseFields(p.fields),
                versions: p.versions.map((v) => ({
                    version: v.version,
                    title: v.title,
                    fields: parseFields(v.fields),
                    edit_note: v.editNote,
                    saved_at: v.savedAt,
                })),
            })),
            connected_tools: tools.map((t) => ({
                slug: t.toolSlug,
                name: t.toolName,
                included_page_ids: idList(t.includedPageIds),
                included_fields: safeJson(t.includedFields),
                is_active: t.isActive,
                created_at: t.createdAt,
                updated_at: t.updatedAt,
            })),
            stamp_events: stamps.map((s) => ({
                connected_tool_id: s.connectedToolId,
                page_ids: idList(s.pageIds),
                export_format: s.exportFormat,
                stamped_at: s.stampedAt,
            })),
            inbox_items: inbox.map((i) => ({
                text: i.text,
                status: i.status,
                source: i.source,
                created_at: i.createdAt,
                updated_at: i.updatedAt,
                triaged_page_id: i.triagedPageId,
                triaged_field_key: i.triagedFieldKey,
                triaged_at: i.triagedAt,
            })),
        }

        return NextResponse.json(exportData, {
            headers: {
                'Content-Disposition':
                    'attachment; filename="craneta-passport-archive.json"',
            },
        })
    }

    if (format === 'markdown') {
        const md: string[] = [
            `# Craneta Passport`,
            ``,
            `*Exported ${new Date().toLocaleString()}*`,
            user.name ? `*${user.name}*  ` : '',
            `---`,
            ``,
        ]
        for (const page of pages) {
            md.push(`## ${page.title}`)
            md.push(``)
            const fields = parseFields(page.fields)
            for (const field of fields) {
                if (field.value?.trim()) {
                    md.push(`**${field.label}:** ${field.value}`)
                    md.push(``)
                }
            }
            md.push(`---`)
            md.push(``)
        }
        return new NextResponse(md.join('\n'), {
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
                'Content-Disposition': 'attachment; filename="craneta-passport.md"',
            },
        })
    }

    // text
    const lines: string[] = [
        `CRANETA PASSPORT`,
        `Exported: ${new Date().toLocaleString()}`,
        user.name ? `Name: ${user.name}` : '',
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ``,
    ]

    for (const page of pages) {
        lines.push(`## ${page.title.toUpperCase()}`)
        lines.push(``)
        const fields = parseFields(page.fields)
        for (const field of fields) {
            if (field.value?.trim()) {
                lines.push(`${field.label}: ${field.value}`)
            }
        }
        lines.push(``)
        lines.push(`──────────────────────────────────`)
        lines.push(``)
    }

    return new NextResponse(lines.join('\n'), {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'attachment; filename="craneta-passport.txt"',
        },
    })
}