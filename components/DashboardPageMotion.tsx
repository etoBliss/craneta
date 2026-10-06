'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export default function DashboardPageMotion({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const reduceMotion = useReducedMotion()

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -5 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
