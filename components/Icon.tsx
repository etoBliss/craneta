import React from 'react'

export type IconName =
    | 'page'
    | 'working'
    | 'facts'
    | 'chat'
    | 'projects'
    | 'custom'
    | 'sparkle'
    | 'arrow-right'
    | 'arrow-left'
    | 'plus'
    | 'close'
    | 'check'
    | 'copy'
    | 'quote'
    | 'stamp'
    | 'clock'
    | 'logout'
    | 'export'
    | 'passport'
    | 'inbox'
    | 'trash'
    | 'pencil'
    | 'pin'
    | 'settings'
    | 'user'
    | 'plug'

interface IconProps {
    name: IconName
    size?: number
    className?: string
    strokeWidth?: number
}

/**
 * Soft, monochrome SVG icon set.
 * Renders inline so it inherits `currentColor`. Always 1em × 1em by default,
 * fully strokeable via the `strokeWidth` prop.
 */
export default function Icon({ name, size = 18, className = '', strokeWidth }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            width={size}
            height={size}
            className={className}
            aria-hidden="true"
            style={strokeWidth ? { strokeWidth } : undefined}
        >
            <IconPath name={name} />
        </svg>
    )
}

function IconPath({ name }: { name: IconName }) {
    switch (name) {
        case 'page':
            return (
                <>
                    <path d="M14 3h-7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M13 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M9 13h6M9 17h6M9 9h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </>
            )
        case 'working':
            return (
                <>
                    <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M8 14h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="7" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="17" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.6" />
                </>
            )
        case 'custom':
            return (
                <>
                    <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                </>
            )
        case 'arrow-right':
            return (
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            )
        case 'arrow-left':
            return (
                <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            )
        case 'plus':
            return <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        case 'close':
            return <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        case 'check':
            return (
                <>
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M7 14l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </>
            )
        case 'copy':
            return (
                <>
                    <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </>
            )
        case 'quote':
            return (
                <path
                    d="M21 12c0 4.97-4.03 9-9 9-1.5 0-2.93-.37-4.18-1.03L3 21l1.03-4.82A8.96 8.96 0 0 1 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
            )
        case 'chat':
            return (
                <>
                    <path d="M4 6h16v10a2 2 0 0 1-2 2H8l-4 4V6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <circle cx="9" cy="11" r="1" fill="currentColor" />
                    <circle cx="12.5" cy="11" r="1" fill="currentColor" />
                    <circle cx="16" cy="11" r="1" fill="currentColor" />
                </>
            )
        case 'sparkle':
            return (
                <path
                    d="M12 2C9 6 7 9 7 13a5 5 0 0 0 10 0c0-4-2-7-5-11Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
            )
        case 'facts':
            return (
                <path
                    d="M12 2l2.4 5 5.5.8-4 3.9 1 5.5-4.9-2.6-4.9 2.6 1-5.5-4-3.9 5.5-.8L12 2Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
            )
        case 'projects':
            return (
                <>
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </>
            )
        case 'stamp':
            return (
                <>
                    <path d="M5 8a7 7 0 0 1 14 0v4a5 5 0 0 1-10 0v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M5 8v3M19 8v3M9 18l-2 4M15 18l2 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="9" cy="8" r="1.2" fill="currentColor" />
                    <circle cx="15" cy="8" r="1.2" fill="currentColor" />
                </>
            )
        case 'clock':
            return (
                <>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </>
            )
        case 'logout':
            return (
                <path
                    d="M17 16l4-4-4-4M21 12H9M9 21H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )
        case 'export':
            return (
                <>
                    <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </>
            )
        case 'passport':
            return (
                <>
                    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="6.5" cy="6.5" r="0.8" fill="currentColor" />
                    <circle cx="9" cy="6.5" r="0.8" fill="currentColor" />
                    <path d="M7 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </>
            )
        case 'inbox':
            return (
                <>
                    <path d="M3 13l3-8h12l3 8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M3 13h6l1 2h4l1-2h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </>
            )
        case 'trash':
            return (
                <>
                    <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </>
            )
        case 'pencil':
            return (
                <>
                    <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M14 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </>
            )
        case 'pin':
            return (
                <>
                    <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                </>
            )
        case 'settings':
            return (
                <>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                    <path
                        d="M19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.4-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.4 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </>
            )
        case 'user':
            return (
                <>
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </>
            )
        case 'plug':
            return (
                <>
                    <path d="M9 3v5M15 3v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M6 8h12v3a6 6 0 0 1-12 0V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </>
            )
        default:
            return null
    }
}