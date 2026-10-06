import Link from 'next/link'
import Icon from '@/components/Icon'
import DashboardContextFlow from '@/components/DashboardContextFlow'

interface GreetingProps {
    name: string | null
    pageCount: number
    fieldCount: number
    completion: number
    totalSlots?: number
}

export default function DashboardGreeting({
    name,
    pageCount,
    fieldCount,
    completion,
    totalSlots = 0,
}: GreetingProps) {
    const firstName = name?.trim().split(' ')[0]
    const hour = new Date().getHours()
    const greeting = hour < 5 ? 'Working late' : hour < 12 ? 'Good morning' : hour < 18 ? 'Welcome back' : 'Good evening'

    const stateLabel = pageCount === 0
        ? 'One useful detail is a good place to begin.'
        : completion === 100
            ? 'Your context is ready when you are.'
            : 'Your context is taking shape.'

    const stateBody = pageCount === 0
        ? 'Start with one detail you find yourself explaining often. You can build from there, one page at a time.'
        : completion === 100
            ? `${fieldCount} details across ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}. Choose what to copy or export for your next conversation.`
            : `${fieldCount} of ${totalSlots} details are filled. Add a little more whenever you want your context to feel more complete.`

    return (
        <section className="dashboard-welcome soft-rise" aria-labelledby="dashboard-welcome-title">
            <div className="dashboard-welcome__copy">
                <p className="dashboard-welcome__eyebrow"><span aria-hidden="true">✳</span> Your context, in motion</p>
                <h1 id="dashboard-welcome-title" className="dashboard-welcome__title">
                    {firstName ? `${greeting}, ${firstName}.` : 'Welcome to your passport.'}
                </h1>
                <p className="dashboard-welcome__summary">
                    <strong>{stateLabel}</strong> {stateBody}
                </p>
                <div className="dashboard-welcome__actions">
                    <Link href="/dashboard/pages/new" className="btn-primary">
                        <Icon name="plus" size={16} />
                        {pageCount === 0 ? 'Create your first page' : 'Add a page'}
                    </Link>
                    <Link href="/dashboard/export" className="dashboard-welcome__secondary">
                        Carry it with you <Icon name="arrow-right" size={14} />
                    </Link>
                </div>
            </div>

            <DashboardContextFlow />
        </section>
    )
}
