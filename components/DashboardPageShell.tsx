import React from 'react'

/**
 * Layout wrapper for all non-home dashboard pages (Profile, Settings, etc.).
 * Provides consistent gutter + max-width so every internal page has the
 * same breathing rhythm.
 */
export default function DashboardPageShell({
    eyebrow,
    title,
    description,
    children,
}: {
    eyebrow?: string
    title: string
    description?: string
    children: React.ReactNode
}) {
    return (
        <div className="dashboard-page-shell dashboard-page-shell--narrow">
            <header className="greeting-block" style={{ marginBottom: 32 }}>
                {eyebrow ? (
                    <p className="greeting-block__eyebrow">{eyebrow}</p>
                ) : null}
                <h1
                    className="greeting-block__title"
                    style={{ fontSize: 'var(--fs-32)', marginTop: 6 }}
                >
                    {title}
                </h1>
                {description ? (
                    <p
                        className="greeting-block__sub"
                        style={{ marginTop: 8, maxWidth: 560 }}
                    >
                        {description}
                    </p>
                ) : null}
            </header>

            {children}
        </div>
    )
}
