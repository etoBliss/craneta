'use client'

import { useState } from 'react'
import Icon from './Icon'

interface CopyButtonProps {
    /**
     * The text to copy. Either a string or an async function that returns one.
     * Async lets callers fetch from the API right before copying so they
     * always copy the freshest version, not a stale snapshot.
     */
    text: string | (() => Promise<string>)
    /**
     * Optional toast-style label override. Defaults to "Copy to clipboard".
     */
    label?: string
    /** Visual size — sm for inline toolbar use, md for primary actions. */
    size?: 'sm' | 'md'
    /** Visual tone — primary for the main copy action, ghost for secondary. */
    tone?: 'primary' | 'ghost' | 'outline'
    /** Optional id for tests / e2e selectors. */
    id?: string
    /** Icon to show instead of the default "copy" — e.g. an "all" icon for copy-all. */
    iconName?: 'copy' | 'page' | 'export' | 'pin'
    /** Optional className passthrough. */
    className?: string
}

/**
 * Reusable clipboard copy button with success / error states.
 *
 * Uses `navigator.clipboard.writeText` when available, with a graceful
 * fallback path for older browsers. The button briefly shows a checkmark
 * and the word "Copied" before reverting to its idle label.
 */
export default function CopyButton({
    text,
    label = 'Copy to clipboard',
    size = 'md',
    tone = 'primary',
    id,
    iconName = 'copy',
    className,
}: CopyButtonProps) {
    const [state, setState] = useState<'idle' | 'copying' | 'copied' | 'error'>(
        'idle'
    )

    async function handleCopy() {
        if (state === 'copying') return
        setState('copying')
        try {
            const resolved = typeof text === 'string' ? text : await text()
            if (!resolved) {
                setState('error')
                setTimeout(() => setState('idle'), 2200)
                return
            }
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(resolved)
            } else {
                // Fallback for older browsers / non-secure contexts
                const ta = document.createElement('textarea')
                ta.value = resolved
                ta.style.position = 'fixed'
                ta.style.opacity = '0'
                document.body.appendChild(ta)
                ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
            }
            setState('copied')
            setTimeout(() => setState('idle'), 1800)
        } catch {
            setState('error')
            setTimeout(() => setState('idle'), 2200)
        }
    }

    const isSmall = size === 'sm'
    const padding = isSmall ? '8px 12px' : '12px 16px'
    const fontSize = isSmall ? 'var(--fs-12)' : 'var(--fs-14)'
    const iconSize = isSmall ? 12 : 14

    let bg = 'var(--primary)'
    let color = 'var(--white)'
    let border = '1px solid var(--primary)'

    if (tone === 'ghost') {
        bg = 'transparent'
        color = 'var(--ink-70)'
        border = '1px solid transparent'
    } else if (tone === 'outline') {
        bg = 'var(--white)'
        color = 'var(--ink)'
        border = '1px solid var(--ink-20)'
    }

    if (state === 'copied') {
        bg = 'var(--ink)'
        color = 'var(--white)'
        border = '1px solid var(--ink)'
    } else if (state === 'error') {
        bg = 'var(--state-error-bg)'
        color = 'var(--state-error)'
        border = '1px solid var(--state-error-border)'
    }

    const labelText =
        state === 'copying'
            ? 'Copying…'
            : state === 'copied'
              ? 'Copied'
              : state === 'error'
                ? "Couldn't copy"
                : label

    return (
        <button
            type="button"
            onClick={handleCopy}
            id={id}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding,
                fontSize,
                fontWeight: 600,
                fontFamily: 'var(--font-display)',
                backgroundColor: bg,
                color,
                border,
                borderRadius: 'var(--radius-3)',
                cursor: state === 'copying' ? 'wait' : 'pointer',
                transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
            }}
        >
            <Icon
                name={state === 'copied' ? 'check' : state === 'error' ? 'close' : iconName}
                size={iconSize}
            />
            <span>{labelText}</span>
        </button>
    )
}
