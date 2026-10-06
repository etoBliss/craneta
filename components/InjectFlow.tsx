'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import StampOverlay from '@/components/StampOverlay'
import type { PagePreview } from '@/lib/formatters'

interface ToolLite {
    id: string
    slug: string
    name: string
    includedPageIds: string[]
    isActive: boolean
}

interface InjectFlowProps {
    userName: string | null
    pages: PagePreview[]
    tools: ToolLite[]
}

interface Destination {
    /** Existing ConnectedTool id, or null when it must be upserted on confirm. */
    id: string | null
    slug: string
    name: string
}

/**
 * The "stamp into a tool" flow on the Export page — the step that makes the
 * ownership loop real. Pick a destination → review exactly which pages travel
 * (the declaration) → confirm → copy to clipboard → record a StampEvent → play
 * the earned stamp echo. "Manual copy" upserts a per-user pseudo-tool so the
 * StampEvent's required tool FK is always satisfied without a schema change.
 */
function buildHeader(userName: string | null): string {
    return [
        'CRANETA PASSPORT',
        `Exported: ${new Date().toLocaleString()}`,
        userName ? `Name: ${userName}` : '',
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '',
    ]
        .filter((l) => l !== '')
        .join('\n')
}

export default function InjectFlow({ userName, pages, tools }: InjectFlowProps) {
    const router = useRouter()
    const filledPages = useMemo(() => pages.filter((p) => p.filledCount > 0), [pages])
    const filledIds = useMemo(() => new Set(filledPages.map((p) => p.id)), [filledPages])
    const activeTools = useMemo(() => tools.filter((t) => t.isActive), [tools])

    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'choose' | 'review'>('choose')
    const [dest, setDest] = useState<Destination | null>(null)
    const [selection, setSelection] = useState<Set<string>>(new Set())
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [echo, setEcho] = useState<{ label: string; sub: string } | null>(null)

    const hasContent = filledPages.length > 0

    function reset() {
        setStep('choose')
        setDest(null)
        setSelection(new Set())
        setError('')
        setBusy(false)
    }

    function close() {
        setOpen(false)
        reset()
    }

    function chooseDestination(d: Destination) {
        // Default the page selection: for a connected tool, its included pages
        // (that still have content); otherwise every filled page.
        const existing = activeTools.find((t) => t.id === d.id)
        const seed =
            existing && existing.includedPageIds.length > 0
                ? existing.includedPageIds.filter((id) => filledIds.has(id))
                : []
        const chosen = seed.length > 0 ? seed : filledPages.map((p) => p.id)
        setDest(d)
        setSelection(new Set(chosen))
        setError('')
        setStep('review')
    }

    function toggle(id: string) {
        setSelection((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectedPreviews = useMemo(
        () => filledPages.filter((p) => selection.has(p.id)),
        [filledPages, selection]
    )

    const assembledText = useMemo(() => {
        if (selectedPreviews.length === 0) return ''
        return `${buildHeader(userName)}\n${selectedPreviews.map((p) => p.text).join('\n')}`
    }, [selectedPreviews, userName])

    async function copyText(text: string): Promise<boolean> {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text)
            } else {
                const ta = document.createElement('textarea')
                ta.value = text
                ta.style.position = 'fixed'
                ta.style.opacity = '0'
                document.body.appendChild(ta)
                ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
            }
            return true
        } catch {
            return false
        }
    }

    async function confirm() {
        if (!dest || selection.size === 0) return
        setBusy(true)
        setError('')

        const pageIds = [...selection]

        // 1. Copy the assembled context to the clipboard first — this is the
        //    part the user actually needs; we only record the stamp if it lands.
        const copied = await copyText(assembledText)
        if (!copied) {
            setError('Could not copy to the clipboard. Check your browser permissions.')
            setBusy(false)
            return
        }

        try {
            // 2. Resolve the destination to a ConnectedTool id, upserting the
            //    pseudo/unconnected tool when needed so the stamp FK is satisfied.
            let toolId = dest.id
            if (!toolId) {
                const res = await fetch('/api/tools', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        toolSlug: dest.slug,
                        toolName: dest.name,
                        includedPageIds: pageIds,
                    }),
                })
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}))
                    setError(data.error ?? 'Could not prepare the destination tool.')
                    setBusy(false)
                    return
                }
                toolId = ((await res.json()) as { id: string }).id
            }

            // 3. Record the stamp.
            const stampRes = await fetch('/api/stamps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectedToolId: toolId,
                    pageIds,
                    exportFormat: 'clipboard',
                }),
            })
            if (!stampRes.ok) {
                const data = await stampRes.json().catch(() => ({}))
                setError(data.error ?? 'Copied — but the stamp could not be recorded.')
                setBusy(false)
                return
            }

            // 4. Success — close the panel and play the earned stamp echo.
            const count = pageIds.length
            setEcho({
                label: dest.name,
                sub: `${count} ${count === 1 ? 'page' : 'pages'} · clipboard`,
            })
            setOpen(false)
            reset()
        } catch {
            setError('Network error. Your context was copied, but the stamp was not recorded.')
            setBusy(false)
        }
    }

    return (
        <>
            <section
                className="soft-rise"
                style={{
                    marginBottom: 40,
                    padding: 24,
                    background:
                        'linear-gradient(140% 120% at 0% 0%, var(--primary-soft), var(--white) 62%)',
                    border: '1px solid var(--primary)',
                    borderRadius: 'var(--radius-4)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 16,
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ display: 'flex', gap: 14, minWidth: 0 }}>
                        <span className="icon-chip-sm" style={{ flexShrink: 0 }}>
                            <Icon name="stamp" size={16} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                            <h2 style={{ fontSize: 'var(--fs-20)', marginBottom: 4, color: 'var(--ink)' }}>
                                Stamp into a tool
                            </h2>
                            <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-70)', margin: 0, maxWidth: 460, lineHeight: 1.5 }}>
                                Copy your passport to a destination and record the trip in
                                your stamp history — a private, auditable trail of where
                                your context has travelled.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '12px 18px' }}
                        onClick={() => {
                            reset()
                            setOpen(true)
                        }}
                        disabled={!hasContent}
                    >
                        <Icon name="stamp" size={14} />
                        {hasContent ? 'Stamp my passport' : 'Fill a field first'}
                    </button>
                </div>
            </section>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(10, 42, 30, 0.42)', backdropFilter: 'blur(3px)' }}
                    onClick={close}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Stamp your passport into a tool"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="soft-rise"
                        style={{
                            width: '100%',
                            maxWidth: 560,
                            maxHeight: '88vh',
                            overflowY: 'auto',
                            backgroundColor: 'var(--white)',
                            borderRadius: 'var(--radius-4)',
                            border: '1px solid var(--ink-10)',
                            boxShadow: '0 24px 70px rgba(10,42,30,0.28)',
                            padding: 24,
                        }}
                    >
                        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
                            <div>
                                <p className="section-eyebrow" style={{ marginBottom: 4 }}>
                                    {step === 'choose' ? 'Step 1 of 2' : 'Step 2 of 2'}
                                </p>
                                <h3 style={{ fontSize: 'var(--fs-20)', color: 'var(--ink)' }}>
                                    {step === 'choose' ? 'Where is this going?' : 'Confirm what travels'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                className="btn-ghost"
                                aria-label="Close"
                                style={{ padding: 8 }}
                            >
                                <Icon name="close" size={18} />
                            </button>
                        </header>

                        {error && (
                            <div
                                role="alert"
                                style={{
                                    marginBottom: 16,
                                    padding: '12px 16px',
                                    backgroundColor: 'var(--state-error-bg)',
                                    color: 'var(--state-error)',
                                    border: '1px solid var(--state-error-border)',
                                    borderRadius: 'var(--radius-3)',
                                    fontSize: 'var(--fs-13)',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {step === 'choose' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {activeTools.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        className="list-panel__row"
                                        style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                        onClick={() => chooseDestination({ id: t.id, slug: t.slug, name: t.name })}
                                    >
                                        <span className="list-panel__main">
                                            <span className="list-panel__icon">
                                                <Icon name="plug" size={18} />
                                            </span>
                                            <div>
                                                <p className="list-panel__title">{t.name}</p>
                                                <p className="list-panel__sub">
                                                    Connected · {t.includedPageIds.filter((id) => filledIds.has(id)).length || filledPages.length} pages
                                                </p>
                                            </div>
                                        </span>
                                        <span className="btn-outline list-panel__action">
                                            <Icon name="arrow-right" size={14} />
                                            Choose
                                        </span>
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    className="list-panel__row"
                                    style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                    onClick={() => chooseDestination({ id: null, slug: 'manual', name: 'Manual copy' })}
                                >
                                    <span className="list-panel__main">
                                        <span className="list-panel__icon">
                                            <Icon name="copy" size={18} />
                                        </span>
                                        <div>
                                            <p className="list-panel__title">Manual copy</p>
                                            <p className="list-panel__sub">
                                                Copy to the clipboard and paste into any tool — still recorded.
                                            </p>
                                        </div>
                                    </span>
                                    <span className="btn-outline list-panel__action">
                                        <Icon name="arrow-right" size={14} />
                                        Choose
                                    </span>
                                </button>

                                <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-50)', marginTop: 6 }}>
                                    Want a reusable destination with preset pages?{' '}
                                    <Link href="/dashboard/tools" style={{ color: 'var(--primary)' }}>
                                        Connect a tool
                                    </Link>
                                    .
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-70)', marginBottom: 14, lineHeight: 1.5 }}>
                                    You&apos;re about to copy the pages below to{' '}
                                    <strong style={{ color: 'var(--ink)' }}>{dest?.name}</strong>. Deselect
                                    anything you don&apos;t want to share on this trip.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                    {filledPages.map((p) => {
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
                                                        {p.categoryLabel} · {p.filledCount} fields · {p.charCount} chars
                                                    </span>
                                                </span>
                                            </label>
                                        )
                                    })}
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        style={{ fontSize: 'var(--fs-13)' }}
                                        onClick={() => setStep('choose')}
                                        disabled={busy}
                                    >
                                        <Icon name="arrow-left" size={14} />
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        style={{ padding: '12px 18px' }}
                                        onClick={confirm}
                                        disabled={busy || selection.size === 0}
                                    >
                                        <Icon name="stamp" size={14} />
                                        {busy
                                            ? 'Stamping…'
                                            : `Copy & stamp ${selection.size} ${selection.size === 1 ? 'page' : 'pages'}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {echo && (
                <StampOverlay
                    variant="inject"
                    label={echo.label}
                    sublabel={echo.sub}
                    onDone={() => {
                        setEcho(null)
                        router.refresh()
                    }}
                />
            )}
        </>
    )
}
