import Link from 'next/link'
import Icon from '@/components/Icon'

type Tone = 'primary' | 'secondary'

interface ExportRowProps {
    icon: 'export' | 'page' | 'sparkle' | 'pin'
    title: string
    body: string
    actionHref: string
    actionLabel: string
    actionId: string
    tone?: Tone
}

const TONE_STYLES: Record<Tone, { bg: string; color: string; border: string }> = {
    primary: {
        bg: 'var(--primary)',
        color: 'var(--white)',
        border: 'var(--primary)',
    },
    secondary: {
        bg: 'var(--white)',
        color: 'var(--ink)',
        border: 'var(--ink-20)',
    },
}

export default function ExportRow({
    icon,
    title,
    body,
    actionHref,
    actionLabel,
    actionId,
    tone = 'secondary',
}: ExportRowProps) {
    const t = TONE_STYLES[tone]
    return (
        <div
            style={{
                background: 'var(--white)',
                border: '1px solid var(--ink-10)',
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                borderRadius: 'var(--radius-3)',
            }}
        >
            <span
                className="icon-chip-sm"
                style={{ flexShrink: 0 }}
            >
                <Icon name={icon} size={16} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p
                    style={{
                        fontSize: 'var(--fs-16)',
                        fontWeight: 700,
                        marginBottom: 2,
                    }}
                >
                    {title}
                </p>
                <p
                    style={{
                        fontSize: 'var(--fs-13)',
                        color: 'var(--ink-70)',
                        lineHeight: 1.5,
                    }}
                >
                    {body}
                </p>
            </div>
            <Link
                href={actionHref}
                id={actionId}
                style={{
                    background: t.bg,
                    color: t.color,
                    border: `1px solid ${t.border}`,
                    padding: '10px 16px',
                    fontSize: 'var(--fs-13)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                    flexShrink: 0,
                    borderRadius: 'var(--radius-2)',
                }}
            >
                {actionLabel}
            </Link>
        </div>
    )
}
