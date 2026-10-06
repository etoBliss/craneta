'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import { CATEGORY_OPTIONS } from '@/lib/constants'

const DEFAULT_FIELDS: Record<string, Array<{ key: string; label: string; value: string }>> = {
    working_style: [
        { key: 'focus', label: 'How I focus best', value: '' },
        { key: 'hours', label: 'Preferred working hours', value: '' },
        { key: 'structure', label: 'How structured I like my work', value: '' },
        { key: 'collaboration', label: 'Collaboration preferences', value: '' },
    ],
    standing_facts: [
        { key: 'role', label: 'Current role / title', value: '' },
        { key: 'domain', label: 'Domain / industry', value: '' },
        { key: 'location', label: 'Location / timezone', value: '' },
        { key: 'tools', label: 'Primary tools', value: '' },
    ],
    communication_preferences: [
        { key: 'tone', label: 'Preferred tone', value: '' },
        { key: 'format', label: 'Preferred response format', value: '' },
        { key: 'verbosity', label: 'Verbosity level', value: '' },
        { key: 'avoid', label: 'Things to avoid', value: '' },
    ],
    active_projects: [
        { key: 'project1', label: 'Project 1', value: '' },
        { key: 'project2', label: 'Project 2', value: '' },
        { key: 'goals', label: 'Current goals', value: '' },
        { key: 'blockers', label: 'Current blockers', value: '' },
    ],
    custom: [
        { key: 'field1', label: 'Field 1', value: '' },
        { key: 'field2', label: 'Field 2', value: '' },
    ],
}

export default function NewPageForm() {
    const router = useRouter()
    const [category, setCategory] = useState('working_style')
    const [title, setTitle] = useState(CATEGORY_OPTIONS[0].label)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function handleCategoryChange(value: string) {
        setCategory(value)
        const opt = CATEGORY_OPTIONS.find((o) => o.value === value)
        if (opt) setTitle(opt.label)
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const fields = DEFAULT_FIELDS[category] || DEFAULT_FIELDS.custom

        try {
            const res = await fetch('/api/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, title, fields }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Failed to create page')
                setLoading(false)
                return
            }
            router.push(`/dashboard/pages/${data.id}`)
        } catch {
            setError('Network error. Please try again.')
            setLoading(false)
        }
    }

    const selectedMeta = CATEGORY_OPTIONS.find((o) => o.value === category)
    const fieldPreview = DEFAULT_FIELDS[category] || DEFAULT_FIELDS.custom

    return (
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {error && (
                <div
                    role="alert"
                    style={{
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

            {/* Category selector */}
            <div>
                <label className="label" htmlFor="category-grid">
                    Category
                </label>
                <div
                    id="category-grid"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    style={{ marginTop: 4 }}
                >
                    {CATEGORY_OPTIONS.map((opt, i) => {
                        const selected = category === opt.value
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                id={`category-${opt.value}`}
                                onClick={() => handleCategoryChange(opt.value)}
                                aria-pressed={selected}
                                className="hover-lift soft-rise"
                                style={{
                                    textAlign: 'left',
                                    padding: 20,
                                    borderRadius: 'var(--radius-4)',
                                    border: selected
                                        ? '2px solid var(--primary)'
                                        : '1px solid var(--ink-10)',
                                    backgroundColor: selected
                                        ? 'var(--primary-soft)'
                                        : 'var(--white)',
                                    cursor: 'pointer',
                                    animationDelay: `${Math.min(i * 0.05, 0.3)}s`,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                    <span
                                        className="icon-chip"
                                        style={
                                            selected
                                                ? { backgroundColor: 'var(--white)' }
                                                : undefined
                                        }
                                    >
                                        <Icon name={opt.icon} size={20} />
                                    </span>
                                    <p style={{ fontSize: 'var(--fs-16)', fontWeight: 700 }}>{opt.label}</p>
                                </div>
                                <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-70)', lineHeight: 1.5 }}>
                                    {opt.description}
                                </p>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Title */}
            <div>
                <label className="label" htmlFor="page-title">Page title</label>
                <input
                    id="page-title"
                    type="text"
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. My Working Style"
                />
            </div>

            {/* Preview */}
            {selectedMeta && (
                <div
                    style={{
                        backgroundColor: 'var(--ink-05)',
                        border: '1px solid var(--ink-10)',
                        borderRadius: 'var(--radius-4)',
                        padding: 20,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span className="icon-chip-sm">
                            <Icon name="check" size={14} />
                        </span>
                        <p className="label" style={{ margin: 0 }}>
                            Will include these fields
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {fieldPreview.map((f) => (
                            <span key={f.key} className="badge">
                                {f.label}
                            </span>
                        ))}
                    </div>
                    <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-50)', marginTop: 14 }}>
                        You can add, rename, or remove fields after creation.
                    </p>
                </div>
            )}

            <div className="flex-col gap-3 sm:flex-row sm:items-center" style={{ display: 'flex', gap: 12 }}>
                <button
                    type="submit"
                    id="create-page-btn"
                    className="btn-primary"
                    disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', padding: '14px 20px' }}
                >
                    {loading ? 'Creating…' : 'Create page'}
                    {!loading && <Icon name="arrow-right" size={16} />}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-ghost"
                    style={{ justifyContent: 'center' }}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}