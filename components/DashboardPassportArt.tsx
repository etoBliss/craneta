'use client'

import { motion, useReducedMotion } from 'motion/react'
import Icon from '@/components/Icon'

/** A quiet passport-cover motion that gives the workspace its own visual signature. */
export default function DashboardPassportArt() {
    const shouldReduceMotion = useReducedMotion()

    return (
        <div className="dashboard-welcome__art" aria-hidden="true">
            <span className="dashboard-welcome__orbit dashboard-welcome__orbit--one" />
            <span className="dashboard-welcome__orbit dashboard-welcome__orbit--two" />
            <motion.div
                className="dashboard-passport-art"
                initial={{ y: 0, rotate: -7 }}
                animate={shouldReduceMotion ? { y: 0, rotate: -7 } : { y: [0, -6, 0], rotate: [-7, -5, -7] }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 7, ease: 'easeInOut', repeat: Infinity }}
            >
                <div className="dashboard-passport-art__spine" />
                <div className="dashboard-passport-art__mark"><Icon name="passport" size={34} /></div>
                <span className="dashboard-passport-art__label">YOUR CONTEXT</span>
                <span className="dashboard-passport-art__line dashboard-passport-art__line--long" />
                <span className="dashboard-passport-art__line dashboard-passport-art__line--short" />
                <span className="dashboard-passport-art__stamp"><Icon name="stamp" size={18} /></span>
            </motion.div>
            <span className="dashboard-welcome__caption">PERSONAL · PORTABLE · YOURS</span>
        </div>
    )
}
