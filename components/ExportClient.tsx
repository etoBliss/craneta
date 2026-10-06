'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icon'
import CopyButton from './CopyButton'
import InjectFlow from './InjectFlow'
import type { PagePreview } from '@/lib/formatters'

interface ToolLite {
    id: string
    slug: string
    name: string
    includedPageIds: string[]
    isActive: boolean
}

interface ExportClientProps {
    userName: string | null
    pages: PagePreview[]
    tools: ToolLite[]
}

/**
 * Manual copy surface for the user's passport.
 *
 * Layout (top to bottom):
 *   1. Stats strip
 *   2. Stamp-into-a-tool flow — the recorded, auditable trip (InjectFlow)
 *   3. Hero "Copy formatted" card — preview, framing toggle, big copy
 *   4. Quick downloads (JSON, plain text file, markdown)
 *   5. Per-page list — each page has its own copy button + size hint
 *   6. Tool-specific how-to cards (ChatGPT, Claude, Gemini)
 */
export default function ExportClient({ userName, pages, tools }: ExportClientProps) {
    const [includeFraming, setIncludeFraming] = useState(false)

    // The full text users will copy. We compute it client-side so the
    // preview is exactly what the clipboard will receive — no drift
    // between what they see and what they paste.
    const fullText = useMemo(() => {
        const blocks = pages
            .filter((p) => p.filledCount > 0)
            .map((p) => p.text)

        if (blocks.length === 0) return ''

        const header = [
            'CRANETA PASSPORT',
            `Exported: ${new Date().toLocaleString()}`,
            userName ? `Name: ${userName}` : '',
            '',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            '',
        ]
            .filter((l) => l !== '')
            .join('\n')

        if (includeFraming) {
            const framing =
                'The following is structured personal context for the user, organised by topic. ' +
                'Each section is a different aspect of how they work, communicate, and what they are focused on. ' +
                'Treat it as standing context for this and follow-up conversations — not as a question or task.'
            return `${framing}\n\n${header}\n${blocks.join('\n')}`
        }
        return `${header}\n${blocks.join('\n')}`
    }, [pages, userName, includeFraming])

    const totalFilled = pages.reduce((acc, p) => acc + p.filledCount, 0)
    const totalSlots = pages.reduce((acc, p) => acc + p.totalCount, 0)
    const filledPages = pages.filter((p) => p.filledCount > 0).length
    const hasContent = fullText.length > 0

    return (
        <div className="dashboard-page-shell dashboard-page-shell--medium">
            <header className="soft-rise" style={{ marginBottom: 32 }}>
                <p className="section-eyebrow" style={{ marginBottom: 10 }}>
                    Export
                </p>
                <h1 style={{ fontSize: 'var(--fs-40)', lineHeight: 1.05 }}>
                    Copy your passport anywhere.
                </h1>
                <p
                    style={{
                        marginTop: 12,
                        fontSize: 'var(--fs-16)',
                        color: 'var(--ink-70)',
                        maxWidth: 580,
                    }}
                >
                    A single formatted block you can paste into any AI tool&apos;s
                    custom instructions. Your context, on your terms.
                </p>
            </header>

            {/* Stats strip */}
            <div
                className="soft-rise"
                style={{
                    display: 'flex',
                    gap: 24,
                    flexWrap: 'wrap',
                    marginBottom: 28,
                    padding: 18,
                    backgroundColor: 'var(--ink-05)',
                    border: '1px solid var(--ink-10)',
                    borderRadius: 'var(--radius-4)',
                }}
            >
                <Stat label="Pages" value={pages.length} sublabel={`${filledPages} with content`} icon="page" />
                <Stat
                    label="Fields filled"
                    value={totalFilled}
                    sublabel={`of ${totalSlots} slots`}
                    icon="check"
                />
                <Stat
                    label="Copy size"
                    value={hasContent ? `${fullText.length.toLocaleString()} chars` : '—'}
                    sublabel={hasContent ? `${fullText.split('\n').length} lines` : 'add a field first'}
                    icon="copy"
                />
            </div>

            {/* Stamp into a tool — the recorded trip */}
            <InjectFlow userName={userName} pages={pages} tools={tools} />

            {/* Big copy card */}
            <section
                className="soft-rise"
                style={{
                    marginBottom: 40,
                    padding: 24,
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--ink-10)',
                    borderRadius: 'var(--radius-4)',
                    animationDelay: '0.05s',
                }}
            >
                <header
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 16,
                        marginBottom: 16,
                        flexWrap: 'wrap',
                    }}
                >
                    <div>
                        <h2
                            style={{
                                fontSize: 'var(--fs-20)',
                                marginBottom: 4,
                                color: 'var(--ink)',
                            }}
                        >
                            Formatted context
                        </h2>
                        <p
                            style={{
                                fontSize: 'var(--fs-12)',
                                color: 'var(--ink-70)',
                                margin: 0,
                                lineHeight: 1.5,
                                maxWidth: 480,
                            }}
                        >
                            Plain text, ready to paste into any AI tool. Empty fields
                            are skipped.
                        </p>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            flexWrap: 'wrap',
                        }}
                    >
                        <FramingToggle
                            value={includeFraming}
                            onChange={setIncludeFraming}
                        />
                        <CopyButton
                            id="copy-full-passport-btn"
                            label={hasContent ? 'Copy formatted' : 'Nothing to copy yet'}
                            text={hasContent ? fullText : ''}
                        />
                    </div>
                </header>

                {/* Preview */}
                {hasContent ? (
                    <PreviewBlock text={fullText} />
                ) : (
                    <EmptyPreview pages={pages} />
                )}
            </section>

            {/* Downloads */}
            <section style={{ marginBottom: 40 }}>
                <header className="section-header">
                    <div>
                        <p className="section-eyebrow" style={{ marginBottom: 6 }}>
                            Downloads
                        </p>
                        <h2 style={{ fontSize: 'var(--fs-20)' }}>Save a file instead</h2>
                    </div>
                </header>
                <div className="list-panel">
                    <a
                        id="export-json-btn"
                        className="list-panel__row"
                        href="/api/export?format=json"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="list-panel__main">
                            <span className="list-panel__icon">
                                <Icon name="export" size={18} />
                            </span>
                            <div>
                                <p className="list-panel__title">JSON export</p>
                                <p className="list-panel__sub">
                                    Machine-readable. Use for integrations, backups, or restoring your passport to Craneta later.
                                </p>
                            </div>
                        </span>
                        <span className="btn-outline list-panel__action">
                            <Icon name="arrow-right" size={14} />
                            Download
                        </span>
                    </a>
                    <a
                        id="export-text-btn"
                        className="list-panel__row"
                        href="/api/export?format=text"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="list-panel__main">
                            <span className="list-panel__icon">
                                <Icon name="page" size={18} />
                            </span>
                            <div>
                                <p className="list-panel__title">Plaintext export</p>
                                <p className="list-panel__sub">
                                    Matches the &ldquo;Copy formatted&rdquo; preview. Paste into ChatGPT, Claude, Gemini — anything that takes custom instructions.
                                </p>
                            </div>
                        </span>
                        <span className="btn-outline list-panel__action">
                            <Icon name="arrow-right" size={14} />
                            Download
                        </span>
                    </a>
                    <a
                        id="export-md-btn"
                        className="list-panel__row"
                        href="/api/export?format=markdown"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="list-panel__main">
                            <span className="list-panel__icon">
                                <Icon name="copy" size={18} />
                            </span>
                            <div>
                                <p className="list-panel__title">Markdown export</p>
                                <p className="list-panel__sub">
                                    Bold field labels and headings — handy if you keep notes in Obsidian, Notion, or a repo.
                                </p>
                            </div>
                        </span>
                        <span className="btn-outline list-panel__action">
                            <Icon name="arrow-right" size={14} />
                            Download
                        </span>
                    </a>
                </div>
            </section>

            {/* Per-page copy */}
            <section style={{ marginBottom: 40 }}>
                <header style={{ marginBottom: 16 }}>
                    <p className="section-eyebrow" style={{ marginBottom: 6 }}>
                        Per page
                    </p>
                    <h2 style={{ fontSize: 'var(--fs-20)' }}>Copy a single page</h2>
                    <p
                        style={{
                            fontSize: 'var(--fs-12)',
                            color: 'var(--ink-70)',
                            marginTop: 6,
                            maxWidth: 520,
                        }}
                    >
                        Useful when one tool only needs a slice of your context —
                        e.g. just your communication style for a writing assistant.
                    </p>
                </header>

                {pages.length === 0 ? (
                    <div
                        className="card"
                        style={{
                            padding: '40px 24px',
                            textAlign: 'center',
                            color: 'var(--ink-70)',
                        }}
                    >
                        <p
                            style={{
                                fontSize: 'var(--fs-14)',
                                margin: 0,
                            }}
                        >
                            No pages yet. Add a page to your passport first.
                        </p>
                        <Link
                            href="/dashboard/pages/new"
                            className="btn-primary"
                            style={{ marginTop: 16, display: 'inline-flex' }}
                        >
                            <Icon name="plus" size={14} />
                            Add a page
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {pages.map((p) => (
                            <PerPageRow key={p.id} page={p} framing={includeFraming} />
                        ))}
                    </div>
                )}
            </section>

            {/* How to use */}
            <section className="soft-rise" style={{ marginTop: 32 }}>
                <header style={{ marginBottom: 24 }}>
                    <p className="section-eyebrow" style={{ marginBottom: 10 }}>
                        How to use
                    </p>
                    <h2 style={{ fontSize: 'var(--fs-28)' }}>
                        Paste your passport into any AI tool.
                    </h2>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        {
                            tool: 'ChatGPT',
                            icon: 'chat' as const,
                            where: 'Settings → Personalization → Custom instructions',
                        },
                        {
                            tool: 'Claude',
                            icon: 'page' as const,
                            where: 'Settings → Profile → What should Claude know about you?',
                        },
                    ].map((item) => (
                        <div key={item.tool} className="card" style={{ padding: 22 }}>
                            <span className="icon-chip-sm" style={{ marginBottom: 14 }}>
                                <Icon name={item.icon} size={16} />
                            </span>
                            <p
                                style={{
                                    fontSize: 'var(--fs-16)',
                                    fontWeight: 700,
                                    marginBottom: 4,
                                }}
                            >
                                {item.tool}
                            </p>
                            <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-70)' }}>
                                {item.where}
                            </p>
                        </div>
                    ))}
                </div>
                <p style={{ marginTop: 16, fontSize: 'var(--fs-13)', color: 'var(--ink-50)' }}>
                    Works the same in Gemini, Perplexity, open-source models, and any tool that takes a system prompt. Just paste your formatted text.
                </p>
                <div
                    className="card"
                    style={{
                        marginTop: 24,
                        padding: 22,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                    }}
                >
                    <span className="icon-chip-sm">
                        <Icon name="clock" size={16} />
                    </span>
                    <p style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-70)' }}>
                        You only need to paste once per tool. When your passport
                        changes, hit Copy again and update that tool&apos;s memory.
                    </p>
                </div>
            </section>

            <div style={{ marginTop: 48, textAlign: 'center' }}>
                <Link href="/dashboard" className="btn-ghost">
                    <Icon name="arrow-left" size={14} />
                    Back to passport
                </Link>
            </div>
        </div>
    )
}

function Stat({
    label,
    value,
    sublabel,
    icon,
}: {
    label: string
    value: number | string
    sublabel?: string
    icon: 'page' | 'check' | 'copy'
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="icon-chip-sm">
                <Icon name={icon} size={16} />
            </span>
            <div>
                <p
                    style={{
                        fontSize: 'var(--fs-12)',
                        color: 'var(--ink-50)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 600,
                        margin: 0,
                    }}
                >
                    {label}
                </p>
                <p
                    style={{
                        fontSize: 'var(--fs-20)',
                        fontWeight: 800,
                        color: 'var(--ink)',
                        margin: 0,
                    }}
                >
                    {value}
                </p>
                {sublabel && (
                    <p
                        style={{
                            fontSize: 'var(--fs-12)',
                            color: 'var(--ink-50)',
                            margin: 0,
                        }}
                    >
                        {sublabel}
                    </p>
                )}
            </div>
        </div>
    )
}

function FramingToggle({
    value,
    onChange,
}: {
    value: boolean
    onChange: (v: boolean) => void
}) {
    return (
        <label
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                fontSize: 'var(--fs-12)',
                fontWeight: 600,
                color: value ? 'var(--primary)' : 'var(--ink-70)',
                backgroundColor: value ? 'var(--primary-soft)' : 'var(--ink-05)',
                border: '1px solid ' + (value ? 'var(--primary)' : 'var(--ink-10)'),
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                userSelect: 'none',
            }}
            title="Adds a &apos;this is standing context&apos; sentence before your passport so tools that don&apos;t have a custom-instructions field still treat the block correctly."
        >
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
            />
            <span>Include framing</span>
        </label>
    )
}

function PreviewBlock({ text }: { text: string }) {
    return (
        <div
            style={{
                position: 'relative',
                backgroundColor: 'var(--ink)',
                color: 'var(--white)',
                borderRadius: 'var(--radius-3)',
                padding: 0,
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 'var(--fs-12)',
                    color: 'rgba(255,255,255,0.55)',
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                    }}
                >
                    Preview · what will be copied
                </span>
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'var(--primary)',
                        }}
                    />
                    plain text
                </span>
            </div>
            <pre
                style={{
                    margin: 0,
                    padding: 18,
                    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: 'var(--fs-12)',
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.85)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: 360,
                    overflowY: 'auto',
                }}
            >
                {text}
            </pre>
        </div>
    )
}

function EmptyPreview({ pages }: { pages: PagePreview[] }) {
    const hasAny = pages.length > 0
    return (
        <div
            style={{
                padding: '32px 24px',
                border: '1.5px dashed var(--ink-20)',
                borderRadius: 'var(--radius-3)',
                textAlign: 'center',
                color: 'var(--ink-70)',
            }}
        >
            <span
                className="icon-chip-sm"
                style={{ marginBottom: 12, margin: '0 auto 12px' }}
            >
                <Icon name="copy" size={16} />
            </span>
            <p
                style={{
                    fontSize: 'var(--fs-14)',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    margin: 0,
                    marginBottom: 6,
                }}
            >
                {hasAny
                    ? 'No filled fields yet.'
                    : 'No pages yet.'}
            </p>
            <p
                style={{
                    fontSize: 'var(--fs-12)',
                    color: 'var(--ink-50)',
                    maxWidth: 360,
                    margin: '0 auto',
                    lineHeight: 1.5,
                }}
            >
                {hasAny
                    ? 'Fill in at least one field on a page and the formatted preview will appear here.'
                    : 'Add a page to your passport to start filling in your context.'}
            </p>
            <Link
                href={hasAny ? '/dashboard' : '/dashboard/pages/new'}
                className="btn-primary"
                style={{ marginTop: 16, display: 'inline-flex' }}
            >
                <Icon name="plus" size={14} />
                {hasAny ? 'Fill a field' : 'Add a page'}
            </Link>
        </div>
    )
}

function PerPageRow({
    page,
    framing,
}: {
    page: PagePreview
    framing: boolean
}) {
    const [expanded, setExpanded] = useState(false)
    const canCopy = page.filledCount > 0
    const text = framing
        ? `The following is structured personal context for the user. Treat it as standing context for this conversation, not as a question or task.\n\n${page.text}`
        : page.text

    return (
        <article
            className="card"
            style={{
                padding: 16,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                    }}
                >
                    <p
                        style={{
                            fontSize: 'var(--fs-14)',
                            fontWeight: 700,
                            color: 'var(--ink)',
                            margin: 0,
                        }}
                    >
                        {page.title}
                    </p>
                    <span
                        style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--ink-50)',
                            padding: '2px 8px',
                            backgroundColor: 'var(--ink-05)',
                            borderRadius: 'var(--radius-pill)',
                        }}
                    >
                        {page.categoryLabel}
                    </span>
                </div>
                <p
                    style={{
                        fontSize: 'var(--fs-12)',
                        color: 'var(--ink-50)',
                        margin: 0,
                    }}
                >
                    {canCopy ? (
                        <>
                            {page.filledCount} of {page.totalCount} fields · {page.charCount} chars
                        </>
                    ) : (
                        'No fields filled yet'
                    )}
                </p>

                {expanded && canCopy && (
                    <pre
                        style={{
                            marginTop: 12,
                            padding: 12,
                            backgroundColor: 'var(--ink-05)',
                            border: '1px solid var(--ink-10)',
                            borderRadius: 'var(--radius-3)',
                            fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                            fontSize: 'var(--fs-12)',
                            lineHeight: 1.55,
                            color: 'var(--ink)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: 220,
                            overflowY: 'auto',
                            marginBottom: 0,
                        }}
                    >
                        {text}
                    </pre>
                )}
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                }}
            >
                {canCopy && (
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        className="btn-ghost"
                        style={{
                            fontSize: 'var(--fs-12)',
                            padding: '8px 10px',
                        }}
                        aria-expanded={expanded}
                    >
                        {expanded ? 'Hide' : 'Preview'}
                    </button>
                )}
                <CopyButton
                    id={`copy-page-${page.id}`}
                    size="sm"
                    tone={canCopy ? 'primary' : 'ghost'}
                    label={canCopy ? 'Copy' : 'Empty'}
                    text={canCopy ? text : ''}
                />
            </div>
        </article>
    )
}
