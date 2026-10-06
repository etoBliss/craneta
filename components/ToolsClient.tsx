'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import type { IconName } from '@/components/Icon'

interface PageLite {
    id: string
    title: string
    categoryLabel: string
    filledCount: number
    totalCount: number
}

interface ToolLite {
    id: string
    slug: string
    name: string
    includedPageIds: string[]
    isActive: boolean
}

interface ToolsClientProps {
    pages: PageLite[]
    tools: ToolLite[]
}

interface CatalogEntry {
    slug: string
    name: string
    icon: IconName
    where: string
    /** Custom tools let the user name the destination themselves. */
    nameable?: boolean
}

/**
 * The destinations Craneta knows how to help you paste into. Every slug here is
 * also in the API's SUPPORTED_TOOLS set. "Manual copy" is the paste-anywhere
 * pseudo-tool; "Custom" is a single user-named slot.
 */
const CATALOG: CatalogEntry[] = [
    { slug: 'chatgpt', name: 'ChatGPT', icon: 'chat', where: 'Settings → Personalization → Custom instructions' },
    { slug: 'claude', name: 'Claude', icon: 'page', where: 'Settings → Profile → personal preferences' },
    { slug: 'gemini', name: 'Gemini', icon: 'sparkle', where: 'Saved info → personal context' },
    { slug: 'perplexity', name: 'Perplexity', icon: 'facts', where: 'Settings → Profile → “Introduce yourself”' },
    { slug: 'manual', name: 'Manual copy', icon: 'copy', where: 'Copy to clipboard, paste into any tool' },
    { slug: 'custom', name: 'Custom tool', icon: 'custom', where: 'Any other AI surface you use', nameable: true },
]

export default function ToolsClient({ pages, tools }: ToolsClientProps) {
    const router = useRouter()
    const [connected, setConnected] = useState<ToolLite[]>(tools)
    const [editing, setEditing] = useState<string | null>(null)
    const [selection, setSelection] = useState<Set<string>>(new Set())
    const [customName, setCustomName] = useState('')
    const [busy, setBusy] = useState<string | null>(null)
    const [error, setError] = useState('')

    const hasPages = pages.length > 0
    const pageIdSet = new Set(pages.map((p) => p.id))

    function activeTool(slug: string): ToolLite | undefined {
        return connected.find((t) => t.slug === slug && t.isActive)
    }

    function beginEdit(entry: CatalogEntry) {
        const existing = activeTool(entry.slug)
        // Seed the checklist from the tool's current pages, or all pages for a
        // fresh connection. Only keep ids that still map to a live page.
        const seed =
            existing && existing.includedPageIds.length > 0
                ? existing.includedPageIds.filter((id) => pageIdSet.has(id))
                : pages.map((p) => p.id)
        setSelection(new Set(seed))
        setCustomName(entry.nameable ? existing?.name ?? '' : '')
        setError('')
        setEditing(entry.slug)
    }

    function toggle(id: string) {
        setSelection((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    async function save(entry: CatalogEntry) {
        setBusy(entry.slug)
        setError('')
        const toolName = entry.nameable
            ? customName.trim().slice(0, 80) || 'Custom tool'
            : entry.name
        try {
            const res = await fetch('/api/tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    toolSlug: entry.slug,
                    toolName,
                    includedPageIds: [...selection],
                }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setError(data.error ?? 'Could not connect this tool.')
                return
            }
            const saved = (await res.json()) as {
                id: string
                toolSlug: string
                toolName: string
            }
            setConnected((prev) => {
                const rest = prev.filter((t) => t.slug !== entry.slug)
                return [
                    ...rest,
                    {
                        id: saved.id,
                        slug: saved.toolSlug,
                        name: saved.toolName,
                        includedPageIds: [...selection],
                        isActive: true,
                    },
                ]
            })
            setEditing(null)
            router.refresh()
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setBusy(null)
        }
    }

    async function disconnect(slug: string) {
        setBusy(slug)
        setError('')
        try {
            const res = await fetch(`/api/tools?slug=${encodeURIComponent(slug)}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setError(data.error ?? 'Could not disconnect this tool.')
                return
            }
            setConnected((prev) =>
                prev.map((t) => (t.slug === slug ? { ...t, isActive: false } : t))
            )
            if (editing === slug) setEditing(null)
            router.refresh()
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setBusy(null)
        }
    }

    const connectedCount = connected.filter((t) => t.isActive).length

    return (
        <div className="dashboard-page-shell dashboard-page-shell--medium">
            <header className="soft-rise" style={{ marginBottom: 32 }}>
                <p className="section-eyebrow" style={{ marginBottom: 10 }}>
                    Tools
                </p>
                <h1 style={{ fontSize: 'var(--fs-40)', lineHeight: 1.05 }}>
                    The tools you carry your passport to.
                </h1>
                <p
                    style={{
                        marginTop: 12,
                        fontSize: 'var(--fs-16)',
                        color: 'var(--ink-70)',
                        maxWidth: 560,
                    }}
                >
                    Connect a destination and choose which pages it receives. When
                    you stamp your passport into a tool from the{' '}
                    <Link href="/dashboard/export" style={{ color: 'var(--primary)' }}>
                        Export page
                    </Link>
                    , that trip is recorded in your{' '}
                    <Link href="/dashboard/stamps" style={{ color: 'var(--primary)' }}>
                        stamp history
                    </Link>
                    .
                </p>
            </header>

            {error && (
                <div
                    role="alert"
                    style={{
                        marginBottom: 16,
                        padding: '14px 18px',
                        backgroundColor: 'var(--state-error-bg)',
                        color: 'var(--state-error)',
                        border: '1px solid var(--state-error-border)',
                        borderRadius: 'var(--radius-3)',
                        fontSize: 'var(--fs-14)',
                    }}
                >
                    {error}
                </div>
            )}

            {!hasPages && (
                <div
                    className="card"
                    style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--ink-70)', marginBottom: 24 }}
                >
                    <p style={{ fontSize: 'var(--fs-14)', margin: 0, marginBottom: 12 }}>
                        Add a page to your passport before connecting a tool — there&apos;s
                        nothing to carry across yet.
                    </p>
                    <Link href="/dashboard/pages/new" className="btn-primary" style={{ display: 'inline-flex' }}>
                        <Icon name="plus" size={14} />
                        Add a page
                    </Link>
                </div>
            )}

            <p
                style={{
                    fontSize: 'var(--fs-12)',
                    color: 'var(--ink-50)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 12,
                }}
            >
                {connectedCount === 0
                    ? 'No tools connected yet'
                    : `${connectedCount} connected`}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {CATALOG.map((entry) => {
                    const tool = activeTool(entry.slug)
                    const isEditing = editing === entry.slug
                    const includedLive = tool
                        ? tool.includedPageIds.filter((id) => pageIdSet.has(id))
                        : []

                    return (
                        <article key={entry.slug} className="card" style={{ padding: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                <span className="icon-chip-sm" style={{ flexShrink: 0 }}>
                                    <Icon name={entry.icon} size={16} />
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <p style={{ fontSize: 'var(--fs-16)', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                                            {tool && entry.nameable ? tool.name : entry.name}
                                        </p>
                                        {tool && (
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    color: 'var(--primary)',
                                                    backgroundColor: 'var(--primary-soft)',
                                                    padding: '2px 8px',
                                                    borderRadius: 'var(--radius-pill)',
                                                }}
                                            >
                                                <Icon name="check" size={11} />
                                                Connected
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-50)', margin: '4px 0 0' }}>
                                        {tool
                                            ? `${includedLive.length} of ${pages.length} ${pages.length === 1 ? 'page' : 'pages'} included · ${entry.where}`
                                            : entry.where}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                    {tool && (
                                        <button
                                            type="button"
                                            className="btn-ghost"
                                            style={{ fontSize: 'var(--fs-12)', padding: '8px 10px', color: 'var(--state-error)' }}
                                            onClick={() => disconnect(entry.slug)}
                                            disabled={busy === entry.slug}
                                        >
                                            {busy === entry.slug ? '…' : 'Disconnect'}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={tool ? 'btn-outline' : 'btn-primary'}
                                        style={{ fontSize: 'var(--fs-12)', padding: '8px 14px' }}
                                        onClick={() => (isEditing ? setEditing(null) : beginEdit(entry))}
                                        disabled={!hasPages}
                                        aria-expanded={isEditing}
                                    >
                                        {isEditing ? 'Cancel' : tool ? 'Edit' : 'Connect'}
                                    </button>
                                </div>
                            </div>

                            {isEditing && (
                                <div
                                    style={{
                                        marginTop: 16,
                                        paddingTop: 16,
                                        borderTop: '1px solid var(--ink-10)',
                                    }}
                                >
                                    {entry.nameable && (
                                        <div style={{ marginBottom: 14 }}>
                                            <label className="label" htmlFor={`tool-name-${entry.slug}`}>
                                                Tool name
                                            </label>
                                            <input
                                                id={`tool-name-${entry.slug}`}
                                                type="text"
                                                className="input"
                                                value={customName}
                                                onChange={(e) => setCustomName(e.target.value)}
                                                placeholder="e.g. Cursor, Raycast AI, Poe…"
                                                maxLength={80}
                                            />
                                        </div>
                                    )}

                                    <p
                                        style={{
                                            fontSize: 'var(--fs-12)',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            color: 'var(--ink-70)',
                                            marginBottom: 10,
                                        }}
                                    >
                                        Pages to include
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {pages.map((p) => {
                                            const checked = selection.has(p.id)
                                            return (
                                                <label
                                                    key={p.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 12,
                                                        padding: '10px 12px',
                                                        borderRadius: 'var(--radius-3)',
                                                        border: '1px solid ' + (checked ? 'var(--primary)' : 'var(--ink-10)'),
                                                        backgroundColor: checked ? 'var(--primary-soft)' : 'var(--white)',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggle(p.id)}
                                                        style={{ accentColor: 'var(--primary)' }}
                                                    />
                                                    <span style={{ flex: 1, minWidth: 0 }}>
                                                        <span style={{ display: 'block', fontSize: 'var(--fs-14)', fontWeight: 600, color: 'var(--ink)' }}>
                                                            {p.title}
                                                        </span>
                                                        <span style={{ display: 'block', fontSize: 'var(--fs-12)', color: 'var(--ink-50)' }}>
                                                            {p.categoryLabel} · {p.filledCount}/{p.totalCount} fields filled
                                                        </span>
                                                    </span>
                                                </label>
                                            )
                                        })}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            style={{ padding: '10px 18px' }}
                                            onClick={() => save(entry)}
                                            disabled={busy === entry.slug}
                                        >
                                            {busy === entry.slug ? 'Saving…' : tool ? 'Save changes' : 'Connect tool'}
                                        </button>
                                        <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-50)' }}>
                                            {selection.size} selected
                                        </span>
                                    </div>
                                </div>
                            )}
                        </article>
                    )
                })}
            </div>

            <div style={{ marginTop: 40, textAlign: 'center' }}>
                <Link href="/dashboard/export" className="btn-ghost">
                    <Icon name="export" size={14} />
                    Go to Export to stamp a tool
                </Link>
            </div>
        </div>
    )
}
