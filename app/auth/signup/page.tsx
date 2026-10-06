'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { AuthScene } from '@/components/AuthScene'
import { AuthTransition } from '@/components/AuthTransition'

export default function SignUpPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Registration failed')
                return
            }

            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })
            if (result?.error) router.push('/auth/signin')
            else router.push('/dashboard')
        } catch {
            setError('We could not reach Craneta. Check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthTransition>
        <div className="auth-split auth-split--form-right">
            <AuthScene mode="signup" />

            <div className="auth-form">
                <div className="auth-form__inner fade-up">
                    <p className="auth-form__eyebrow">A thoughtful start</p>
                    <h1 className="auth-form__title">Start with one useful detail.</h1>
                    <p className="auth-form__sub">
                        Set up a few ways to carry your voice, work style, and priorities into the next AI chat.
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
                        <div className="field">
                            <label className="field__label" htmlFor="name">Your name <span className="text-[var(--ink-50)]">(optional)</span></label>
                            <input
                                id="name"
                                type="text"
                                className="field__input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="How should we address you?"
                                autoComplete="name"
                                maxLength={80}
                            />
                        </div>

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
                                placeholder="Enter your password"
                                autoComplete="new-password"
                                minLength={8}
                            />
                            <p className="field__hint">Must be at least 8 characters.</p>
                        </div>

                        <button
                            type="submit"
                            id="create-passport-btn"
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                fontSize: 'var(--fs-14)',
                                marginTop: 8,
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Setting up your context…' : 'Create my account'}
                        </button>
                    </form>

                    <p className="auth-form__legal">
                        By creating an account, you agree to our{' '}
                        <Link href="/terms">Terms</Link> and have read our{' '}
                        <Link href="/privacy">Privacy note</Link>.
                    </p>

                    <p className="auth-form__alt">
                        Already have an account?{' '}
                        <Link
                            href="/auth/signin"
                            style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </AuthTransition>
    )
}
