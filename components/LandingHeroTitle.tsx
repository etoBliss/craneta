'use client'

import { motion, useReducedMotion } from 'motion/react'

export default function LandingHeroTitle() {
    const shouldReduceMotion = useReducedMotion()
    const line = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: shouldReduceMotion ? 0.16 : 0.52, ease: 'easeOut' as const },
        },
    }

    return (
        <motion.h1
            id="hero-title"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.12, delayChildren: shouldReduceMotion ? 0 : 0.08 } } }}
            initial="hidden"
            animate="visible"
        >
            <motion.span variants={line}>Different AI.</motion.span>
            <motion.span variants={line}>Same <em>you.</em></motion.span>
        </motion.h1>
    )
}
