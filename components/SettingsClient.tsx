'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Icon from '@/components/Icon'

interface SettingsClientProps {
    userEmail: string
    connectedToolsCount: number
}

/**
 * Settings page — password management + quick shortcuts. Currently keeps
 * scope intentionally small (no preferences/preferences-store yet). When
 * we add per-tool profiles or notification prefs, this is where they live.
 */
export default function SettingsClient({ userEmail, connectedToolsCount }: SettingsClientProps) {
    const [current, setCurrent] = useState('')
    const [next, setNext] = useState('')
    const [confirm, setConfirm] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)

    const passwordsReady =
        current.length > 0 &&
        next.length >= 8 &&
        next === confirm

    async function changePassword(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSaved(false)
        try {
            const res = await fetch('/api/me/password', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ current, next }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Could not change password')
                return
            }
            setSaved(true)
            setCurrent('')
            setNext('')
            setConfirm('')
            await signOut({ callbackUrl: '/auth/signin?passwordChanged=1' })
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Security — password */}
            <section className="settings-card">
                <header className="settings-card__head">
                    <h2 className="settings-card__title">Password</h2>
                    <p className="settings-card__sub">
                        Changing your password signs out every active session. You&rsquo;ll
                        need to sign in again with your new password.
                    </p>
                </header>

                <form onSubmit={changePassword} className="settings-card__body">
                    <div className="field">
                        <label htmlFor="current-password" className="field__label">
                            Current password
                        </label>
                        <input
                            id="current-password"
                            type="password"
                            className="field__input"
                            value={current}
                            onChange={(e) => setCurrent(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="new-password" className="field__label">
                            New password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            className="field__input"
                            value={next}
                            onChange={(e) => setNext(e.target.value)}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                        />
                        <p className="field__hint">Must be at least 8 characters.</p>
                    </div>

                    <div className="field">
                        <label htmlFor="confirm-password" className="field__label">
                            Confirm new password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            className="field__input"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Type the new password again"
                            autoComplete="new-password"
                        />
                        {confirm.length > 0 && next !== confirm ? (
                            <p className="field__hint" style={{ color: 'var(--state-error)' }}>
                                Passwords don&rsquo;t match.
                            </p>
                        ) : null}
                    </div>

                    {error ? (
                        <p className="state-error" role="alert">{error}</p>
                    ) : null}
                    {saved ? (
                        <p className="state-success" role="status">
                            Password updated.
                        </p>
                    ) : null}

                    <div className="settings-card__actions">
                        <button
                            type="submit"
                            className="btn-primary-md"
                            disabled={!passwordsReady || saving}
                        >
                            {saving ? 'Updating…' : 'Update password'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Session */}
            <section className="settings-card">
                <header className="settings-card__head">
                    <h2 className="settings-card__title">Session</h2>
                    <p className="settings-card__sub">
                        Signed in as <strong>{userEmail}</strong>.
                    </p>
                </header>

                <div className="settings-card__actions">
                    <button
                        type="button"
                        className="btn-outline-md"
                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    >
                        <Icon name="logout" size={16} />
                        Sign out
                    </button>
                </div>
            </section>

            {/* Tools snapshot */}
            <section className="settings-card">
                <header className="settings-card__head">
                    <h2 className="settings-card__title">Tools you carry to</h2>
                    <p className="settings-card__sub">
                        Connected surfaces that have pulled your passport. Manage
                        individual stamps on each tool&rsquo;s page.
                    </p>
                </header>

                {connectedToolsCount === 0 ? (
                    <p className="settings-card__body settings-card__footnote">
                        No tools connected yet. Stamp your passport into a tool
                        from the Export page to see it here.
                    </p>
                ) : (
                    <>
                        <p className="settings-card__body">
                            {connectedToolsCount === 1
                                ? '1 tool is currently connected.'
                                : `${connectedToolsCount} tools are currently connected.`}
                        </p>
                        <div className="settings-card__actions">
                            <Link href="/dashboard/export" className="btn-outline-md">
                                View exports
                            </Link>
                        </div>
                    </>
                )}
            </section>
        </div>
    )
}
