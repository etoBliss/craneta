'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/components/Icon'
import { CATEGORY_META, type PassportPageCategory } from '@/lib/constants'

interface InboxItem {
    id: string
    text: string
    status: 'open' | 'triaged' | 'dismissed'
    source: string
    createdAt: string
    triagedPageId: string | null
    triagedFieldKey: string | null
    triagedAt: string | null
}

interface PageOption {
    id: string
    title: string
    category: string
    fields: Array<{ key: string; label: string; value: string }>
}

type Tab = 'open' | 'triaged' | 'dismissed'

interface TriageDraft {
    itemId: string
    pageId: string
    newFieldLabel: string
    mode: 'existing' | 'new'
    fieldKey: string
    append: boolean
}

export default function InboxClient({
    initialItems,
    pageOptions,
    counts,
}: {
    initialItems: InboxItem[]
    pageOptions: PageOption[]
    counts: { open: number; triaged: number; dismissed: number }
}) {
    const router = useRouter()
    const [items, setItems] = useState<InboxItem[]>(initialItems)
    const [tab, setTab] = useState<Tab>('open')
    const [triage, setTriage] = useState<TriageDraft | null>(null)
    const [busy, setBusy] = useState<string | null>(null)
    const [error, setError] = useState('')

    const visible = useMemo(
        () => items.filter((i) => i.status === tab),
        [items, tab]
    )

    const tabOptions: Array<{ key: Tab; label: string; count: number }> = [
        { key: 'open', label: 'Open', count: counts.open },
        { key: 'triaged', label: 'Triaged', count: counts.triaged },
        { key: 'dismissed', label: 'Dismissed', count: counts.dismissed },
    ]

    function startTriage(itemId: string) {
        setError('')
        const firstPage = pageOptions[0]
        if (!firstPage) {
            setError('Create a passport page first to triage items.')
            return
        }
        setTriage({
            itemId,
            pageId: firstPage.id,
            newFieldLabel: '',
            mode: 'existing',
            fieldKey: firstPage.fields[0]?.key ?? '',
            append: true,
        })
    }

    async function handleDismiss(itemId: string) {
        setBusy(itemId)
        setError('')
        try {
            const res = await fetch(`/api/inbox/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'dismissed' }),
            })
            if (!res.ok) throw new Error('failed')
            setItems((prev) =>
                prev.map((i) => (i.id === itemId ? { ...i, status: 'dismissed' } : i))
            )
            if (triage?.itemId === itemId) setTriage(null)
            router.refresh()
        } catch {
            setError('Could not dismiss. Please try again.')
        } finally {
            setBusy(null)
        }
    }

    async function handleReopen(itemId: string) {
        setBusy(itemId)
        setError('')
        try {
            const res = await fetch(`/api/inbox/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'open' }),
            })
            if (!res.ok) throw new Error('failed')
            setItems((prev) =>
                prev.map((i) =>
                    i.id === itemId
                        ? {
                            ...i,
                            status: 'open',
                            triagedPageId: null,
                            triagedFieldKey: null,
                            triagedAt: null,
                        }
                        : i
                )
            )
            router.refresh()
        } catch {
            setError('Could not re-open. Please try again.')
        } finally {
            setBusy(null)
        }
    }

    async function handleDelete(itemId: string) {
        if (!confirm('Delete this item permanently?')) return
        setBusy(itemId)
        setError('')
        try {
            const res = await fetch(`/api/inbox/${itemId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('failed')
            setItems((prev) => prev.filter((i) => i.id !== itemId))
            if (triage?.itemId === itemId) setTriage(null)
            router.refresh()
        } catch {
            setError('Could not delete. Please try again.')
        } finally {
            setBusy(null)
        }
    }

    async function confirmTriage() {
        if (!triage) return
        setBusy(triage.itemId)
        setError('')

        const payload: Record<string, unknown> = { status: 'triaged', pageId: triage.pageId }
        if (triage.mode === 'new') {
            if (!triage.newFieldLabel.trim()) {
                setError('Name the new field first.')
                setBusy(null)
                return
            }
            payload.newFieldLabel = triage.newFieldLabel.trim()
        } else {
            if (!triage.fieldKey) {
                setError('Pick a field on the page.')
                setBusy(null)
                return
            }
            payload.fieldKey = triage.fieldKey
            payload.append = triage.append
        }

        try {
            const res = await fetch(`/api/inbox/${triage.itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'failed')
            }
            setItems((prev) =>
                prev.map((i) =>
                    i.id === triage.itemId
                        ? {
                            ...i,
                            status: 'triaged',
                            triagedPageId: triage.pageId,
                            triagedFieldKey:
                                triage.mode === 'new'
                                    ? `field_${Date.now()}`
                                    : triage.fieldKey,
                            triagedAt: new Date().toISOString(),
                        }
                        : i
                )
            )
            setTriage(null)
            router.refresh()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not triage. Please try again.')
        } finally {
            setBusy(null)
        }
    }

    return (
        <div>
            {/* Tabs */}
            <div
                role="tablist"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: 4,
                    backgroundColor: 'var(--ink-05)',
                    borderRadius: 'var(--radius-pill)',
                    marginBottom: 24,
                }}
            >
                {tabOptions.map((opt) => (
                    <button
                        key={opt.key}
                        role="tab"
                        aria-selected={tab === opt.key}
                        onClick={() => setTab(opt.key)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 14px',
                            fontSize: 'var(--fs-12)',
                            fontWeight: 700,
                            fontFamily: 'var(--font-display)',
                            border: 'none',
                            borderRadius: 'var(--radius-pill)',
                            cursor: 'pointer',
                            backgroundColor: tab === opt.key ? 'var(--white)' : 'transparent',
                            color: tab === opt.key ? 'var(--ink)' : 'var(--ink-70)',
                            boxShadow: tab === opt.key ? 'var(--elev-1)' : 'none',
                            transition: 'background-color 0.15s ease, color 0.15s ease',
                        }}
                    >
                        {opt.label}
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 22,
                                height: 22,
                                padding: '0 7px',
                                borderRadius: 'var(--radius-pill)',
                                fontSize: '11px',
                                fontFamily: 'var(--font-body)',
                                fontWeight: 600,
                                backgroundColor:
                                    tab === opt.key ? 'var(--primary-soft)' : 'rgba(0,0,0,0.05)',
                                color: tab === opt.key ? 'var(--primary)' : 'var(--ink-70)',
                            }}
                        >
                            {opt.count}
                        </span>
                    </button>
                ))}
            </div>

            {error && (
                <div
                    role="alert"
                    style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--state-error-bg)',
                        color: 'var(--state-error)',
                        border: '1px solid var(--state-error-border)',
                        borderRadius: 'var(--radius-3)',
                        fontSize: 'var(--fs-14)',
                        marginBottom: 16,
                    }}
                >
                    {error}
                </div>
            )}

            {/* Empty state */}
            {visible.length === 0 && (
                <div
                    className="card"
                    style={{
                        padding: '48px 24px',
                        textAlign: 'center',
                        color: 'var(--ink-70)',
                    }}
                >
                    <span
                        className="icon-chip"
                        style={{
                            width: 56,
                            height: 56,
                            margin: '0 auto 16px',
                        }}
                    >
                        <Icon name={tab === 'open' ? 'inbox' : 'check'} size={26} />
                    </span>
                    <h3 style={{ fontSize: 'var(--fs-20)', marginBottom: 8 }}>
                        {tab === 'open' && 'Inbox is empty.'}
                        {tab === 'triaged' && 'Nothing triaged yet.'}
                        {tab === 'dismissed' && 'No dismissed items.'}
                    </h3>
                    <p
                        style={{
                            fontSize: 'var(--fs-14)',
                            maxWidth: 380,
                            margin: '0 auto',
                            lineHeight: 1.5,
                        }}
                    >
                        {tab === 'open' &&
                            'Tap the + button anywhere in the app to jot a stray fact down. You can file it into a page later.'}
                        {tab === 'triaged' &&
                            'Triaged items will list here so you can see what you filed and where it landed.'}
                        {tab === 'dismissed' &&
                            'Dismissed items sit here in case you change your mind. You can re-open them anytime.'}
                    </p>
                </div>
            )}

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {visible.map((item) => {
                    const isTriaging = triage?.itemId === item.id
                    const triagedPage = item.triagedPageId
                        ? pageOptions.find((p) => p.id === item.triagedPageId) ?? null
                        : null
                    const triagedField =
                        triagedPage && item.triagedFieldKey
                            ? triagedPage.fields.find((f) => f.key === item.triagedFieldKey) ?? null
                            : null
                    const isBusy = busy === item.id

                    return (
                        <article
                            key={item.id}
                            className="card"
                            style={{
                                padding: 18,
                                opacity: isBusy ? 0.6 : 1,
                                transition: 'opacity 0.15s ease',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 12,
                                }}
                            >
                                <span
                                    className="icon-chip-sm"
                                    style={{
                                        backgroundColor:
                                            item.status === 'triaged'
                                                ? 'rgba(14,94,59,0.08)'
                                                : 'var(--primary-soft)',
                                        marginTop: 2,
                                    }}
                                >
                                    <Icon
                                        name={
                                            item.status === 'triaged'
                                                ? 'check'
                                                : item.status === 'dismissed'
                                                  ? 'close'
                                                  : 'inbox'
                                        }
                                        size={14}
                                    />
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p
                                        style={{
                                            fontSize: 'var(--fs-14)',
                                            lineHeight: 1.5,
                                            margin: 0,
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            color: 'var(--ink)',
                                        }}
                                    >
                                        {item.text}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: 'var(--fs-12)',
                                            color: 'var(--ink-50)',
                                            marginTop: 6,
                                            marginBottom: 0,
                                        }}
                                    >
                                        {labelRelativeTime(item.createdAt)}
                                        {item.status === 'triaged' && triagedPage && (
                                            <>
                                                {' · filed to '}
                                                <Link
                                                    href={`/dashboard/pages/${triagedPage.id}`}
                                                    style={{
                                                        color: 'var(--primary)',
                                                        fontWeight: 600,
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    {triagedPage.title}
                                                </Link>
                                                {triagedField && (
                                                    <span style={{ color: 'var(--ink-50)' }}>
                                                        {' '}→ {triagedField.label}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </p>

                                    {/* Triage form */}
                                    {isTriaging && (
                                        <TriageForm
                                            draft={triage}
                                            pageOptions={pageOptions}
                                            onChange={setTriage}
                                            onCancel={() => setTriage(null)}
                                            onConfirm={confirmTriage}
                                            busy={isBusy}
                                        />
                                    )}
                                </div>
                            </div>

                            {!isTriaging && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginTop: 14,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {item.status === 'open' && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => startTriage(item.id)}
                                                disabled={isBusy}
                                                className="btn-primary"
                                                style={{
                                                    padding: '8px 14px',
                                                    fontSize: 'var(--fs-12)',
                                                }}
                                            >
                                                <Icon name="arrow-right" size={12} />
                                                Triage into a page
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDismiss(item.id)}
                                                disabled={isBusy}
                                                className="btn-ghost"
                                                style={{ fontSize: 'var(--fs-12)' }}
                                            >
                                                Dismiss
                                            </button>
                                        </>
                                    )}
                                    {item.status === 'triaged' && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleReopen(item.id)}
                                                disabled={isBusy}
                                                className="btn-ghost"
                                                style={{ fontSize: 'var(--fs-12)' }}
                                            >
                                                Re-open
                                            </button>
                                        </>
                                    )}
                                    {item.status === 'dismissed' && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleReopen(item.id)}
                                                disabled={isBusy}
                                                className="btn-ghost"
                                                style={{ fontSize: 'var(--fs-12)' }}
                                            >
                                                Re-open
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item.id)}
                                        disabled={isBusy}
                                        className="btn-ghost"
                                        style={{
                                            fontSize: 'var(--fs-12)',
                                            color: 'var(--state-error)',
                                            marginLeft: 'auto',
                                        }}
                                        aria-label="Delete item"
                                    >
                                        <Icon name="trash" size={12} />
                                    </button>
                                </div>
                            )}
                        </article>
                    )
                })}
            </div>
        </div>
    )
}

function TriageForm({
    draft,
    pageOptions,
    onChange,
    onCancel,
    onConfirm,
    busy,
}: {
    draft: TriageDraft
    pageOptions: PageOption[]
    onChange: (d: TriageDraft) => void
    onCancel: () => void
    onConfirm: () => void
    busy: boolean
}) {
    const page = pageOptions.find((p) => p.id === draft.pageId) ?? pageOptions[0]
    const meta = page
        ? CATEGORY_META[page.category as PassportPageCategory] || CATEGORY_META.custom
        : null

    return (
        <div
            style={{
                marginTop: 14,
                padding: 14,
                backgroundColor: 'var(--ink-05)',
                border: '1px solid var(--ink-10)',
                borderRadius: 'var(--radius-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
            }}
        >
            {/* Page picker */}
            <div>
                <label className="label" htmlFor={`triage-page-${draft.itemId}`}>
                    Page
                </label>
                <select
                    id={`triage-page-${draft.itemId}`}
                    className="select"
                    value={draft.pageId}
                    onChange={(e) => {
                        const p = pageOptions.find((x) => x.id === e.target.value)
                        onChange({
                            ...draft,
                            pageId: e.target.value,
                            fieldKey: p?.fields[0]?.key ?? '',
                        })
                    }}
                    disabled={busy}
                    style={{ fontSize: 'var(--fs-14)' }}
                >
                    {pageOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Mode toggle */}
            {page && (
                <>
                    <div
                        role="tablist"
                        style={{
                            display: 'inline-flex',
                            gap: 4,
                            padding: 3,
                            backgroundColor: 'var(--white)',
                            border: '1px solid var(--ink-10)',
                            borderRadius: 'var(--radius-pill)',
                            alignSelf: 'flex-start',
                        }}
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={draft.mode === 'existing'}
                            onClick={() => onChange({ ...draft, mode: 'existing' })}
                            style={{
                                padding: '6px 12px',
                                fontSize: 'var(--fs-12)',
                                fontWeight: 600,
                                fontFamily: 'var(--font-display)',
                                border: 'none',
                                borderRadius: 'var(--radius-pill)',
                                cursor: 'pointer',
                                backgroundColor:
                                    draft.mode === 'existing' ? 'var(--primary)' : 'transparent',
                                color: draft.mode === 'existing' ? 'var(--white)' : 'var(--ink-70)',
                            }}
                        >
                            Existing field
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={draft.mode === 'new'}
                            onClick={() => onChange({ ...draft, mode: 'new' })}
                            style={{
                                padding: '6px 12px',
                                fontSize: 'var(--fs-12)',
                                fontWeight: 600,
                                fontFamily: 'var(--font-display)',
                                border: 'none',
                                borderRadius: 'var(--radius-pill)',
                                cursor: 'pointer',
                                backgroundColor:
                                    draft.mode === 'new' ? 'var(--primary)' : 'transparent',
                                color: draft.mode === 'new' ? 'var(--white)' : 'var(--ink-70)',
                            }}
                        >
                            New field
                        </button>
                    </div>

                    {draft.mode === 'existing' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>
                                <label className="label" htmlFor={`triage-field-${draft.itemId}`}>
                                    Field
                                </label>
                                <select
                                    id={`triage-field-${draft.itemId}`}
                                    className="select"
                                    value={draft.fieldKey}
                                    onChange={(e) =>
                                        onChange({ ...draft, fieldKey: e.target.value })
                                    }
                                    disabled={busy}
                                    style={{ fontSize: 'var(--fs-14)' }}
                                >
                                    {page.fields.map((f) => (
                                        <option key={f.key} value={f.key}>
                                            {f.label}
                                            {f.value?.trim() ? ' • (filled)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <label
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 'var(--fs-12)',
                                    color: 'var(--ink-70)',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={draft.append}
                                    onChange={(e) =>
                                        onChange({ ...draft, append: e.target.checked })
                                    }
                                    disabled={busy}
                                />
                                Append to existing value (else overwrite)
                            </label>
                        </div>
                    ) : (
                        <div>
                            <label className="label" htmlFor={`triage-new-field-${draft.itemId}`}>
                                New field name
                            </label>
                            <input
                                id={`triage-new-field-${draft.itemId}`}
                                type="text"
                                className="input"
                                value={draft.newFieldLabel}
                                onChange={(e) =>
                                    onChange({ ...draft, newFieldLabel: e.target.value })
                                }
                                placeholder="e.g. Pet peeves"
                                disabled={busy}
                                style={{ fontSize: 'var(--fs-14)' }}
                            />
                            <p
                                style={{
                                    fontSize: 'var(--fs-12)',
                                    color: 'var(--ink-50)',
                                    marginTop: 6,
                                    marginBottom: 0,
                                }}
                            >
                                A new field will be added to {page.title}
                                {meta ? ` (${meta.label})` : ''}.
                            </p>
                        </div>
                    )}
                </>
            )}

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                }}
            >
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={busy}
                    className="btn-ghost"
                    style={{ fontSize: 'var(--fs-12)' }}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={busy}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: 'var(--fs-12)' }}
                >
                    {busy ? 'Filing…' : 'File it'}
                </button>
            </div>
        </div>
    )
}

/**
 * Lightweight relative time — no external dep. Returns a short string
 * like "2m ago", "yesterday", "Mar 14".
 */
function labelRelativeTime(iso: string): string {
    const date = new Date(iso)
    const now = Date.now()
    const diff = (now - date.getTime()) / 1000 // seconds

    if (diff < 45) return 'just now'
    if (diff < 90) return '1 minute ago'
    if (diff < 60 * 45) return `${Math.round(diff / 60)} minutes ago`
    if (diff < 60 * 90) return '1 hour ago'
    if (diff < 60 * 60 * 24) return `${Math.round(diff / 3600)} hours ago`
    if (diff < 60 * 60 * 36) return 'yesterday'
    if (diff < 60 * 60 * 24 * 7) return `${Math.round(diff / 86400)} days ago`

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
}
