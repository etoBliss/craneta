'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'

/**
 * Floating Quick-Add capture. Mounted in the dashboard layout so it's
 * available on every page. Opens a popover with a textarea; on submit
 * it POSTs to /api/inbox and shows a success confirmation with a link
 * to the inbox for triage.
 */
export default function QuickAdd() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [flash, setFlash] = useState<{ id: string; preview: string } | null>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Close on Escape, click outside, or route change
    useEffect(() => {
        if (!open) return

        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }
        function onClick(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }

        document.addEventListener('keydown', onKey)
        document.addEventListener('mousedown', onClick)
        // Focus textarea when opening
        setTimeout(() => textareaRef.current?.focus(), 30)
        return () => {
            document.removeEventListener('keydown', onKey)
            document.removeEventListener('mousedown', onClick)
        }
    }, [open])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const trimmed = text.trim()
        if (!trimmed) {
            setError('Write something to capture.')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            const res = await fetch('/api/inbox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: trimmed }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setError(data.error || 'Could not save. Please try again.')
                setSubmitting(false)
                return
            }
            const data = await res.json()
            setFlash({ id: data.item.id, preview: trimmed.slice(0, 80) })
            setText('')
            setOpen(false)
            setSubmitting(false)
            // Refresh any inbox-dependent server components
            router.refresh()
            // Auto-clear the flash after 4s
            setTimeout(() => setFlash(null), 4000)
        } catch {
            setError('Network error. Please try again.')
            setSubmitting(false)
        }
    }

    function dismissFlash() {
        setFlash(null)
    }

    return (
        <>
            {/* FAB */}
            <button
                id="quick-add-fab"
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="Quick capture a fact"
                title="Quick capture (jot it down)"
                className="quick-add-fab"
                style={{
                    position: 'fixed',
                    right: 'max(20px, env(safe-area-inset-right, 20px))',
                    bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
                    zIndex: 60,
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--white)',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(14, 94, 59, 0.28)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                }}
            >
                <Icon name={open ? 'close' : 'plus'} size={22} />
            </button>

            {/* Popover */}
            {open && (
                <div
                    ref={popoverRef}
                    role="dialog"
                    aria-label="Quick add"
                    className="soft-rise"
                    style={{
                        position: 'fixed',
                        right: 'max(20px, env(safe-area-inset-right, 20px))',
                        bottom: 'calc(max(20px, env(safe-area-inset-bottom, 20px)) + 72px)',
                        zIndex: 61,
                        width: 'min(380px, calc(100vw - 32px))',
                        backgroundColor: 'var(--white)',
                        border: '1px solid var(--ink-10)',
                        borderRadius: 'var(--radius-4)',
                        boxShadow: '0 18px 50px rgba(10, 42, 30, 0.18)',
                        padding: 18,
                    }}
                >
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <header
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                marginBottom: 2,
                            }}
                        >
                            <span className="icon-chip-sm">
                                <Icon name="inbox" size={14} />
                            </span>
                            <p className="label" style={{ margin: 0 }}>
                                Quick capture
                            </p>
                        </header>
                        <p
                            style={{
                                fontSize: 'var(--fs-12)',
                                color: 'var(--ink-50)',
                                marginTop: -4,
                                marginBottom: 4,
                                lineHeight: 1.4,
                            }}
                        >
                            File a stray fact now. Triage it into a page later.
                        </p>

                        <textarea
                            id="quick-add-textarea"
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="e.g. I answer email in the morning only"
                            rows={3}
                            maxLength={2000}
                            style={{
                                width: '100%',
                                resize: 'vertical',
                                minHeight: 80,
                                padding: '10px 12px',
                                border: '1px solid var(--ink-20)',
                                borderRadius: 'var(--radius-3)',
                                fontFamily: 'inherit',
                                fontSize: 'var(--fs-14)',
                                color: 'var(--ink)',
                                backgroundColor: 'var(--white)',
                                outline: 'none',
                                lineHeight: 1.4,
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)'
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--ink-20)'
                            }}
                        />

                        {error && (
                            <p
                                role="alert"
                                style={{
                                    fontSize: 'var(--fs-12)',
                                    color: 'var(--state-error)',
                                    margin: 0,
                                }}
                            >
                                {error}
                            </p>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 8,
                                marginTop: 4,
                            }}
                        >
                            <p
                                style={{
                                    fontSize: 'var(--fs-12)',
                                    color: 'var(--ink-50)',
                                    margin: 0,
                                }}
                            >
                                {text.length}/2000
                            </p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false)
                                        setText('')
                                        setError('')
                                    }}
                                    className="btn-ghost"
                                    style={{ padding: '8px 12px', fontSize: 'var(--fs-12)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    id="quick-add-submit"
                                    disabled={submitting}
                                    className="btn-primary"
                                    style={{ padding: '8px 14px', fontSize: 'var(--fs-12)' }}
                                >
                                    {submitting ? 'Saving…' : 'Save to inbox'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Success flash */}
            {flash && (
                <div
                    role="status"
                    aria-live="polite"
                    className="soft-rise"
                    style={{
                        position: 'fixed',
                        right: 'max(20px, env(safe-area-inset-right, 20px))',
                        bottom: 'calc(max(20px, env(safe-area-inset-bottom, 20px)) + 72px)',
                        zIndex: 62,
                        width: 'min(380px, calc(100vw - 32px))',
                        backgroundColor: 'var(--ink)',
                        color: 'var(--white)',
                        borderRadius: 'var(--radius-4)',
                        padding: '14px 16px',
                        boxShadow: '0 18px 50px rgba(10, 42, 30, 0.32)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                    }}
                >
                    <span
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'var(--primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Icon name="check" size={14} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 'var(--fs-14)', fontWeight: 700, margin: 0 }}>
                            Saved to inbox
                        </p>
                        <p
                            style={{
                                fontSize: 'var(--fs-12)',
                                color: 'rgba(255,255,255,0.6)',
                                marginTop: 4,
                                marginBottom: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {flash.preview}
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                marginTop: 10,
                            }}
                        >
                            <a
                                href="/dashboard/inbox"
                                onClick={dismissFlash}
                                style={{
                                    fontSize: 'var(--fs-12)',
                                    fontWeight: 700,
                                    color: 'var(--white)',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: 3,
                                    textDecorationThickness: '1px',
                                }}
                            >
                                Triage now →
                            </a>
                            <button
                                type="button"
                                onClick={dismissFlash}
                                style={{
                                    fontSize: 'var(--fs-12)',
                                    color: 'rgba(255,255,255,0.55)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                }}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
