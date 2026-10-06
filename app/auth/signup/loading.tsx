/**
 * Sign-up loading state. Centered spinner instead of a skeleton form.
 */
export default function SignUpLoading() {
    return (
        <div className="auth-form" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
            <div role="status" aria-label="Loading sign up">
                <span className="loading-spinner" aria-hidden />
                <span className="sr-only">Loading sign up</span>
            </div>
        </div>
    )
}