'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import StampOverlay from './StampOverlay'

interface Field {
    key: string
    label: string
    value: string
}

interface Version {
    id: string
    version: number
    title: string
    savedAt: string
    editNote: string | null
}

interface PageData {
    id: string
    category: string
    title: string
    fields: Field[]
    versions: Version[]
}

interface Meta {
    label: string
    icon: import('@/components/Icon').IconName
    description: string
}

export default function PageEditorClient({
    page,
    meta,
}: {
    page: PageData
    meta: Meta
}) {
    const router = useRouter()
    const [title, setTitle] = useState(page.title)
    const [fields, setFields] = useState<Field[]>(page.fields)
    const [editNote, setEditNote] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [showStamp, setShowStamp] = useState(false)
    const [showVersions, setShowVersions] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')
    const noteRef = useRef<HTMLInputElement>(null)

    function updateField(key: string, value: string) {
        setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)))
    }

    function addField() {
        const key = `field_${Date.now()}`
        setFields((prev) => [...prev, { key, label: 'New field', value: '' }])
    }

    function removeField(key: string) {
        setFields((prev) => prev.filter((f) => f.key !== key))
    }

    function updateFieldLabel(key: string, label: string) {
        setFields((prev) => prev.map((f) => (f.key === key ? { ...f, label } : f)))
    }

    async function handleSave() {
        setSaving(true)
        setError('')
        try {
            const res = await fetch(`/api/pages/${page.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, fields, editNote: editNote || undefined }),
            })
            if (!res.ok) {
                setError('Save failed. Please try again.')
                setSaving(false)
                return
            }
            setSaved(true)
            setEditNote('')
            setShowStamp(true)
            setTimeout(() => setSaved(false), 2000)
            router.refresh()
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/pages/${page.id}`, { method: 'DELETE' })
            if (res.ok) {
                router.push('/dashboard')
            } else {
                setDeleting(false)
                setError('Delete failed.')
            }
        } catch {
            setDeleting(false)
            setError('Network error.')
        }
    }

    const latestVersion = page.versions[0]?.version ?? 1
    const filledFields = fields.filter((f) => f.value?.trim()).length
    const pct = fields.length ? Math.round((filledFields / fields.length) * 100) : 0
    const isComplete = fields.length > 0 && filledFields === fields.length

    return (
        <div style={{ position: 'relative' }}>
            {showStamp && (
                <StampOverlay
                    label={page.title}
                    onDone={() => setShowStamp(false)}
                />
            )}

            {/* Header */}
            <header className="soft-rise" style={{ marginBottom: 28 }}>
                <button
                    onClick={() => router.push('/dashboard')}
                    id="back-to-passport-btn"
                    className="btn-ghost"
                    style={{ paddingLeft: 0, marginBottom: 16, fontSize: 'var(--fs-12)' }}
                >
                    <Icon name="arrow-left" size={14} />
                    Back to passport
                </button>

                <div className="flex-col items-stretch gap-3 sm:flex-row sm:items-start" style={{ display: 'flex', gap: 16 }}>
                    <span className="icon-chip" style={{ width: 48, height: 48, flexShrink: 0 }}>
                        <Icon name={meta.icon} size={22} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="section-eyebrow" style={{ marginBottom: 6 }}>
                            {meta.label}
                        </p>
                        <input
                            id="page-title-input"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                fontSize: 'var(--fs-20)',
                                fontWeight: 800,
                                fontFamily: 'var(--font-display)',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                color: 'var(--ink)',
                                letterSpacing: '-0.01em',
                                padding: '2px 0',
                            }}
                        />
                        <div
                            style={{
                                marginTop: 10,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                flexWrap: 'wrap',
                            }}
                        >
                            <span className="badge">v{latestVersion}</span>
                            <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-50)' }}>
                                {filledFields} of {fields.length} fields filled
                            </span>
                            {isComplete && (
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: 'var(--fs-12)',
                                        fontWeight: 600,
                                        color: 'var(--primary)',
                                    }}
                                >
                                    <Icon name="check" size={12} />
                                    Complete
                                </span>
                            )}
                            {!isComplete && fields.length > 0 && (
                                <span style={{ fontSize: 'var(--fs-12)', fontWeight: 600, color: 'var(--ink)' }}>
                                    {pct}% filled
                                </span>
                            )}
                        </div>
                    </div>
                    <div
                        className="w-full justify-between gap-2 sm:w-auto sm:justify-end sm:gap-2"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <button
                            id="delete-page-btn"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="btn-ghost"
                            style={{
                                color: 'var(--state-error)',
                                fontSize: 'var(--fs-12)',
                                padding: '10px 14px',
                            }}
                        >
                            <Icon name="close" size={14} />
                            {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                        <button
                            id="save-page-btn"
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary"
                            style={{
                                padding: '12px 20px',
                                flex: 1,
                                justifyContent: 'center',
                            }}
                        >
                            {saving ? 'Saving…' : saved ? (
                                <>
                                    <Icon name="check" size={14} /> Saved
                                </>
                            ) : 'Save page'}
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="soft-bar" style={{ marginTop: 20 }}>
                    <span style={{ width: `${pct}%` }} />
                </div>
            </header>

            <div className="hairline" style={{ marginBottom: 24 }} />

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

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {fields.map((field) => (
                    <div key={field.key} className="card">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 10,
                                gap: 8,
                            }}
                        >
                            <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateFieldLabel(field.key, e.target.value)}
                                style={{
                                    fontSize: 'var(--fs-12)',
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    color: 'var(--ink-70)',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    padding: 0,
                                    fontFamily: 'var(--font-display)',
                                }}
                                id={`field-label-${field.key}`}
                            />
                            <button
                                onClick={() => removeField(field.key)}
                                className="btn-ghost"
                                style={{ fontSize: 'var(--fs-12)', padding: '6px 8px' }}
                                title="Remove field"
                                aria-label="Remove field"
                            >
                                <Icon name="close" size={14} />
                            </button>
                        </div>
                        <textarea
                            id={`field-value-${field.key}`}
                            className="textarea"
                            value={field.value}
                            onChange={(e) => updateField(field.key, e.target.value)}
                            placeholder={`Enter your ${field.label.toLowerCase()}…`}
                            rows={2}
                        />
                    </div>
                ))}
            </div>

            {/* Add field */}
            <button
                id="add-field-btn"
                onClick={addField}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 28 }}
            >
                <Icon name="plus" size={16} />
                Add field
            </button>

            {/* Edit note */}
            <div style={{ marginBottom: 40 }}>
                <label className="label" htmlFor="edit-note">
                    Note for this save{' '}
                    <span
                        style={{
                            color: 'var(--ink-50)',
                            textTransform: 'none',
                            fontWeight: 500,
                            letterSpacing: 0,
                        }}
                    >
                        (optional. helps track what changed)
                    </span>
                </label>
                <input
                    id="edit-note"
                    ref={noteRef}
                    type="text"
                    className="input"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="e.g. Updated project goals…"
                />
            </div>

            {/* Version history */}
            <div>
                <button
                    id="toggle-versions-btn"
                    onClick={() => setShowVersions((v) => !v)}
                    className="btn-ghost"
                    style={{ paddingLeft: 0, fontSize: 'var(--fs-14)', fontWeight: 600 }}
                >
                    <Icon name={showVersions ? 'arrow-right' : 'arrow-left'} size={14} />
                    <span style={{ marginLeft: 6 }}>
                        Version history ({page.versions.length})
                    </span>
                </button>
                {showVersions && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                        {page.versions.map((v) => (
                            <div
                                key={v.id}
                                className="card"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '14px 18px',
                                    animationDelay: '0.05s',
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <p
                                        style={{
                                            fontSize: 'var(--fs-14)',
                                            fontWeight: 600,
                                            color: 'var(--ink)',
                                        }}
                                    >
                                        v{v.version} , {v.title}
                                    </p>
                                    {v.editNote && (
                                        <p
                                            style={{
                                                fontSize: 'var(--fs-12)',
                                                color: 'var(--ink-50)',
                                                marginTop: 2,
                                            }}
                                        >
                                            {v.editNote}
                                        </p>
                                    )}
                                </div>
                                <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-50)', flexShrink: 0 }}>
                                    {new Date(v.savedAt).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}