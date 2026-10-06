'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const previews = {
    Work: {
        eyebrow: 'How I work',
        headline: 'Clear, practical, and straight to the point.',
        fields: [
            ['My role', 'Product designer · early-stage teams'],
            ['Good work looks like', 'A clear decision and a useful next step'],
            ['Please avoid', 'Jargon, filler, and invented certainty'],
        ],
    },
    Writing: {
        eyebrow: 'How I write',
        headline: 'Warm and direct. Never overly polished.',
        fields: [
            ['My readers', 'People who know their craft, not my context'],
            ['My voice', 'Short sentences. Specific examples. Room to breathe.'],
            ['Please avoid', 'Corporate phrases and empty openers'],
        ],
    },
    Personal: {
        eyebrow: 'What matters',
        headline: 'Make space for the details that make it mine.',
        fields: [
            ['Right now', 'Learning to slow down and choose well'],
            ['I value', 'Curiosity, care, and honest feedback'],
            ['Please remember', 'Ask before assuming what I mean'],
        ],
    },
} as const

type PreviewKey = keyof typeof previews

/** A small, interactive sample of the structured context a user can carry. */
export default function LandingPassportPreview() {
    const [active, setActive] = useState<PreviewKey>('Work')
    const shouldReduceMotion = useReducedMotion()
    const preview = previews[active]

    return (
        <div className="passport-demo">
            <div className="passport-demo__toolbar">
                <span className="passport-demo__status"><span aria-hidden="true" /> LIVE PREVIEW</span>
                <span className="passport-demo__count">{String(Object.keys(previews).indexOf(active) + 1).padStart(2, '0')} / 03</span>
            </div>
            <div className="passport-demo__tabs" role="group" aria-label="Choose a sample context">
                {(Object.keys(previews) as PreviewKey[]).map((key, index) => (
                    <button
                        key={key}
                        type="button"
                        className={active === key ? 'passport-demo__tab passport-demo__tab--active' : 'passport-demo__tab'}
                        aria-pressed={active === key}
                        onClick={() => setActive(key)}
                    >
                        {active === key && (
                            <motion.span
                                className="passport-demo__tab-highlight"
                                layoutId="active-context-tab"
                                transition={{ type: 'spring', stiffness: 460, damping: 38 }}
                                aria-hidden="true"
                            />
                        )}
                        <span className="passport-demo__tab-content">
                            <span className="passport-demo__tab-number">0{index + 1}</span>
                            {key}
                        </span>
                    </button>
                ))}
            </div>
            <div aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.article
                        key={active}
                        className="passport-card"
                        layout
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -7 }}
                        transition={{ duration: shouldReduceMotion ? 0.12 : 0.24, ease: 'easeOut' }}
                    >
                        <div className="passport-card__topline">
                            <motion.span
                                className="passport-card__seal"
                                key={`seal-${active}`}
                                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.72, rotate: shouldReduceMotion ? 0 : -18 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 330, damping: 22, delay: shouldReduceMotion ? 0 : 0.12 }}
                                aria-hidden="true"
                            >C</motion.span>
                            <span className="passport-card__label">A NOTE ABOUT ME</span>
                            <span className="passport-card__edition">CRN · 001</span>
                        </div>
                        <p className="passport-card__eyebrow">{preview.eyebrow}</p>
                        <h2 className="passport-card__headline">{preview.headline}</h2>
                        <dl className="passport-card__fields">
                            {preview.fields.map(([label, value]) => (
                                <div className="passport-card__field" key={label}>
                                    <dt>{label}</dt>
                                    <dd>{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <div className="passport-card__footer">
                            <span>Written once.</span>
                            <span>Yours to carry.</span>
                        </div>
                    </motion.article>
                </AnimatePresence>
            </div>
            <p className="passport-demo__hint">Choose a tab to see how one small page can sound like you.</p>
        </div>
    )
}
