'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CopyButton from './CopyButton'

interface QuickCopyButtonProps {
    /**
     * If true, render only a compact icon-only button (icon + label).
     * Defaults to false (full label visible).
     */
    compact?: boolean
}

/**
 * One-click "copy formatted passport" button for the dashboard.
 * Fetches the freshest text from /api/export?format=text and puts
 * it on the clipboard. No page navigation, no file download.
 */
export default function QuickCopyButton({ compact }: QuickCopyButtonProps) {
    const router = useRouter()
    const [error, setError] = useState('')

    async function fetchText(): Promise<string> {
        setError('')
        try {
            const res = await fetch('/api/export?format=text')
            if (!res.ok) {
                setError('Could not copy.')
                return ''
            }
            const text = await res.text()
            // The export endpoint always emits a header, so a non-empty
            // response means the user has at least one page.
            router.refresh()
            return text
        } catch {
            setError('Could not copy.')
            return ''
        }
    }

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
            }}
        >
            <CopyButton
                id="quick-copy-dashboard"
                size="sm"
                tone="outline"
                label={compact ? 'Copy' : 'Quick copy'}
                text={fetchText}
            />
            {error && (
                <span
                    role="alert"
                    style={{
                        fontSize: 'var(--fs-12)',
                        color: 'var(--state-error)',
                    }}
                >
                    {error}
                </span>
            )}
        </span>
    )
}
