'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthScene } from '@/components/AuthScene'
import { AuthTransition } from '@/components/AuthTransition'

export default function SignInPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })
            if (result?.error) setError('Invalid email or password.')
            else router.push('/dashboard')
        } catch {
            setError('We could not reach Craneta. Check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthTransition>
        <div className="auth-split auth-split--form-left">
            <div className="auth-form">
                <div className="auth-form__inner fade-up">
                    <p className="auth-form__eyebrow">Pick up where you left off</p>
                    <h1 className="auth-form__title">Welcome back</h1>
                    <p className="auth-form__sub">
                        Your pages and ideas are right where you left them.
                    </p>

                    {error && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="px-4 py-3 rounded text-sm"
                            style={{
                                background: 'var(--state-error-bg)',
                                color: 'var(--state-error)',
                                border: '1px solid var(--state-error-border)',
                                marginBottom: 16,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="auth-form__row">
                            <div className="field">
                                <label className="field__label" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="field__input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                            </div>
                            <div className="field">
                                <label className="field__label" htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="field__input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            id="sign-in-btn"
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                fontSize: 'var(--fs-14)',
                                marginTop: 8,
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Finding your context…' : 'Sign in'}
                        </button>
                    </form>

                    <p className="auth-form__alt">
                        New to Craneta?{' '}
                        <Link
                            href="/auth/signup"
                            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>

            <AuthScene mode="signin" />
        </div>
        </AuthTransition>
    )
}
