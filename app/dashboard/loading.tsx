/**
 * Dashboard loading state. Centered spinner, no skeleton rows.
 */
export default function DashboardLoading() {
    return (
        <div
            className="dashboard-page-shell dashboard-page-shell--wide dashboard-loading"
            aria-busy="true"
            aria-live="polite"
        >
            <div role="status" aria-label="Loading dashboard">
                <span className="loading-spinner" aria-hidden />
                <span className="sr-only">Loading your dashboard</span>
            </div>
        </div>
    )
}
