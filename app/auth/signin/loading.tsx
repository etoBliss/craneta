/**
 * Sign-in loading state. Centered spinner instead of a skeleton form.
 */
export default function SignInLoading() {
    return (
        <div className="auth-form" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
            <div role="status" aria-label="Loading sign in">
                <span className="loading-spinner" aria-hidden />
                <span className="sr-only">Loading sign in</span>
            </div>
        </div>
    )
}