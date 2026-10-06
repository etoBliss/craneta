'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Icon from '@/components/Icon'

interface ProfileClientProps {
    initialUser: {
        id: string
        email: string
        name: string | null
        createdAt: string
    }
    stats: {
        pageCount: number
        connectedTools: number
        inboxOpen: number
    }
}

/**
 * Profile page — the user-facing surface for reading + editing the bare
 * account identity (name + email). The password lives on the Settings page,
 * and the danger-zone (delete account) is here too because that's where
 * users expect to find "my account" controls.
 */
export default function ProfileClient({ initialUser, stats }: ProfileClientProps) {
    const router = useRouter()
    const [name, setName] = useState(initialUser.name ?? '')
    const [email, setEmail] = useState(initialUser.email)
    const [savingProfile, setSavingProfile] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)
    const [savedProfile, setSavedProfile] = useState(false)

    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const [deletePhrase, setDeletePhrase] = useState('')
    const [deletePassword, setDeletePassword] = useState('')
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    async function saveProfile(e: React.FormEvent) {
        e.preventDefault()
        setSavingProfile(true)
        setProfileError(null)
        setSavedProfile(false)
        try {
            const res = await fetch('/api/me', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setProfileError(data.error ?? 'Could not save changes')
                return
            }
            setSavedProfile(true)
            router.refresh()
        } catch {
            setProfileError('Network error. Please try again.')
        } finally {
            setSavingProfile(false)
        }
    }

    async function deleteAccount() {
        setDeleting(true)
        setDeleteError(null)
        try {
            const res = await fetch('/api/me', {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ confirmation: deletePhrase.trim(), password: deletePassword }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setDeleteError(data.error ?? 'Could not delete account')
                setDeleting(false)
                return
            }
            await signOut({ callbackUrl: '/auth/signin' })
        } catch {
            setDeleteError('Network error. Please try again.')
            setDeleting(false)
        }
    }

    const memberSince = new Date(initialUser.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Identity */}
            <section className="settings-card">
                <header className="settings-card__head">
                    <h2 className="settings-card__title">Identity</h2>
                    <p className="settings-card__sub">
                        The name and email on your Craneta account. Both are visible
                        only to you.
                    </p>
                </header>

                <form onSubmit={saveProfile} className="settings-card__body">
                    <div className="field">
                        <label htmlFor="profile-name" className="field__label">
                            Name
                        </label>
                        <input
                            id="profile-name"
                            type="text"
                            className="field__input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            autoComplete="name"
                            maxLength={80}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="profile-email" className="field__label">
                            Email
                        </label>
                        <input
                            id="profile-email"
                            type="email"
                            className="field__input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    {profileError ? (
                        <p className="state-error" role="alert">{profileError}</p>
                    ) : null}
                    {savedProfile ? (
                        <p className="state-success" role="status">
                            Saved.
                        </p>
                    ) : null}

                    <div className="settings-card__actions">
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="btn-primary-md"
                        >
                            {savingProfile ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Stats */}
            <section className="settings-card">
                <header className="settings-card__head">
                    <h2 className="settings-card__title">Passport</h2>
                    <p className="settings-card__sub">
                        A snapshot of the context you&rsquo;ve built so far.
                    </p>
                </header>

                <ul className="settings-stat-row">
                    <li className="settings-stat">
                        <span className="settings-stat__value">{stats.pageCount}</span>
                        <span className="settings-stat__label">
                            {stats.pageCount === 1 ? 'page' : 'pages'}
                        </span>
                    </li>
                    <li className="settings-stat">
                        <span className="settings-stat__value">{stats.connectedTools}</span>
                        <span className="settings-stat__label">connected tools</span>
                    </li>
                    <li className="settings-stat">
                        <span className="settings-stat__value">{stats.inboxOpen}</span>
                        <span className="settings-stat__label">
                            {stats.inboxOpen === 1 ? 'note in inbox' : 'notes in inbox'}
                        </span>
                    </li>
                </ul>

                <p className="settings-card__footnote">
                    Member since {memberSince}.
                </p>
            </section>

            {/* Danger zone */}
            <section className="settings-card settings-card--danger">
                <header className="settings-card__head">
                    <h2 className="settings-card__title">Delete account</h2>
                    <p className="settings-card__sub">
                        Permanently delete your Craneta account and every passport
                        page, inbox note, and connected tool tied to it. There is
                        no undo.
                    </p>
                </header>

                {!confirmingDelete ? (
                    <div className="settings-card__actions">
                        <button
                            type="button"
                            className="btn-danger-md"
                            onClick={() => setConfirmingDelete(true)}
                        >
                            <Icon name="trash" size={16} />
                            Delete account
                        </button>
                    </div>
                ) : (
                    <div className="settings-card__body">
                        <p className="state-warning" role="alert">
                            Type <strong>delete my account</strong>{' '}below to confirm.
                        Enter your password to confirm. We&rsquo;ll sign you out and remove all your data.
                        </p>
                        <div className="field">
                            <label htmlFor="delete-confirm" className="field__label">
                                Confirmation
                            </label>
                            <input
                                id="delete-confirm"
                                type="text"
                                className="field__input"
                                value={deletePhrase}
                                onChange={(e) => setDeletePhrase(e.target.value)}
                                placeholder="delete my account"
                                autoComplete="off"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="delete-password" className="field__label">Current password</label>
                            <input
                                id="delete-password"
                                type="password"
                                className="field__input"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        {deleteError ? (
                            <p className="state-error" role="alert">{deleteError}</p>
                        ) : null}
                        <div className="settings-card__actions">
                            <button
                                type="button"
                                className="btn-outline-md"
                                onClick={() => {
                                    setConfirmingDelete(false)
                                    setDeletePhrase('')
                                    setDeletePassword('')
                                    setDeleteError(null)
                                }}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-danger-md"
                                onClick={deleteAccount}
                                disabled={deleting || deletePhrase.trim() !== 'delete my account' || !deletePassword}
                            >
                                {deleting ? 'Deleting…' : 'Permanently delete'}
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
