import Image from 'next/image'

type LogoSize = 'default' | 'large'

/** Shared Craneta lockup: the original passport-crane mark and a live type wordmark. */
export function LogoMark({ className }: { className?: string }) {
    return (
        <Image
            src="/craneta-icon-green.svg"
            alt=""
            aria-hidden="true"
            width={64}
            height={64}
            className={className ?? 'brand-lockup__mark'}
        />
    )
}

export function Logo({ light = false, size = 'default' }: { light?: boolean; size?: LogoSize }) {
    return (
        <span className={`brand-lockup${light ? ' brand-lockup--light' : ''}${size === 'large' ? ' brand-lockup--large' : ''}`}>
            <LogoMark />
            <span className="brand-lockup__word">Craneta</span>
        </span>
    )
}
