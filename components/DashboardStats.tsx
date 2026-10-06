import Icon from '@/components/Icon'
import type { IconName } from '@/components/Icon'

interface StatsProps {
    pageCount: number
    fieldCount: number
    totalSlots: number
    completion: number
}

interface Cell {
    icon: IconName
    label: string
    value: string
    sub: string
}

export default function DashboardStats({ pageCount, fieldCount, totalSlots, completion }: StatsProps) {
    const cells: Cell[] = [
        {
            icon: 'page',
            label: 'Contexts',
            value: String(pageCount),
            sub: pageCount === 1 ? 'One good place to start' : 'Made for different moments',
        },
        {
            icon: 'pencil',
            label: 'Details saved',
            value: `${fieldCount} / ${totalSlots}`,
            sub: 'Your words, your context',
        },
        {
            icon: 'stamp',
            label: 'Context progress',
            value: `${completion}%`,
            sub: completion === 100 ? 'Ready when you are' : 'There is no rush to finish',
        },
    ]

    return (
        <section className="stat-row soft-rise" aria-label="Passport overview" style={{ animationDelay: '0.06s' }}>
            {cells.map((cell, index) => (
                <article className="stat-row__cell" key={cell.label} style={{ animationDelay: `${0.08 + index * 0.06}s` }}>
                    <div className="stat-row__top">
                        <span className="icon-chip-sm"><Icon name={cell.icon} size={16} /></span>
                        <span className="stat-row__label">{cell.label}</span>
                    </div>
                    <span className="stat-row__value">{cell.value}</span>
                    <span className="stat-row__sub">{cell.sub}</span>
                    {index === 2 && (
                        <div
                            className="stat-row__meter"
                            role="progressbar"
                            aria-label="Passport progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={completion}
                        >
                            <span style={{ width: `${completion}%` }} />
                        </div>
                    )}
                </article>
            ))}
        </section>
    )
}
