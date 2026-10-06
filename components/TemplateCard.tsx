'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import type { IconName } from '@/components/Icon'

interface TemplateCardProps {
    slug: string
    name: string
    icon: IconName
    tagline: string
    description: string
    pageCount: number
    fieldCount: number
    index: number
}

export default function TemplateCard({
    slug,
    name,
    icon,
    tagline,
    description,
    pageCount,
    fieldCount,
    index,
}: TemplateCardProps) {
    const router = useRouter()
    const [applying, setApplying] = useState(false)
    const [error, setError] = useState('')

    async function handleApply() {
        if (applying) return
        setApplying(true)
        setError('')
        try {
            const res = await fetch(`/api/templates/${slug}/apply`, { method: 'POST' })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Could not apply template')
            }
            const data = await res.json()
            const firstId = data.created?.[0]?.id
            router.refresh()
            if (firstId) {
                router.push(`/dashboard/pages/${firstId}`)
            } else {
                router.push('/dashboard')
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not apply template')
            setApplying(false)
        }
    }

    return (
        <article
            className="card"
            style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                animationDelay: `${Math.min(index * 0.05, 0.3)}s`,
            }}
        >
            <header
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                }}
            >
                <span className="icon-chip">
                    <Icon name={icon} size={22} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                        style={{
                            fontSize: 'var(--fs-20)',
                            marginBottom: 2,
                            color: 'var(--ink)',
                        }}
                    >
                        {name}
                    </h3>
                    <p
                        style={{
                            fontSize: 'var(--fs-12)',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            margin: 0,
                        }}
                    >
                        {tagline}
                    </p>
                </div>
            </header>

            <p
                style={{
                    fontSize: 'var(--fs-14)',
                    color: 'var(--ink-70)',
                    lineHeight: 1.5,
                    margin: 0,
                }}
            >
                {description}
            </p>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                }}
            >
                <span className="badge">
                    {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                </span>
                <span className="badge">
                    {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                </span>
            </div>

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

            <button
                type="button"
                onClick={handleApply}
                disabled={applying}
                id={`apply-template-${slug}`}
                className="btn-primary"
                style={{
                    marginTop: 4,
                    justifyContent: 'center',
                    padding: '10px 16px',
                }}
            >
                {applying ? 'Adding to your passport…' : 'Use this template'}
                {!applying && <Icon name="arrow-right" size={14} />}
            </button>
        </article>
    )
}
