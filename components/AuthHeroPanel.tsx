'use client'
import React from 'react'
import Image from 'next/image'

/**
 * AuthHeroPanel — left brand panel for /auth/signin and /auth/signup.
 * Mirrors the reference layout: solid cobalt background, featured headline +
 * sub copy at the top, numbered step pills at the bottom. Flat, no gradients.
 */
export function AuthHeroPanel({ mode }: { mode: 'signin' | 'signup' }) {
    const isSignup = mode === 'signup'

    const title = isSignup
        ? 'Get Started\nwith Craneta.'
        : 'Welcome back\nto your passport.'

    const sub = isSignup
        ? 'Three quick steps to a passport that travels with you — to every AI tool, every chat, every time.'
        : 'Pick up where you left off. Your passport, your context, exactly as you left it.'

    const steps = isSignup
        ? [
            { n: 1, label: 'Sign up your account' },
            { n: 2, label: 'Fill your pages' },
            { n: 3, label: 'Carry your context anywhere' },
        ]
        : [
            { n: 1, label: 'Open your passport' },
            { n: 2, label: 'Pick up where you left off' },
            { n: 3, label: 'Copy, export, or sync' },
        ]

    return (
        <aside className="auth-brand">
            <Image
                src="/craneta-logo-reversed.svg"
                alt="Craneta"
                width={120}
                height={48}
                className="h-8 w-auto"
                priority
            />

            <div style={{ position: 'relative' }}>
                <h2 className="auth-brand__title" style={{ whiteSpace: 'pre-line' }}>
                    {title}
                </h2>
                <p className="auth-brand__sub">{sub}</p>

                <div className="auth-brand__steps">
                    {steps.map((s) => (
                        <div key={s.n} className="auth-brand__step">
                            <span className="auth-brand__step-num">{s.n}</span>
                            <span>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="auth-brand__footer">
                © 2026 Craneta. Built for AI users who want control.
            </div>
        </aside>
    )
}