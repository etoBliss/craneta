'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { CSSProperties } from 'react'

const aiLanes = [
    { label: 'Writing', color: '#0E5E3B', y: 54 },
    { label: 'Research', color: '#718BC2', y: 112 },
    { label: 'Build', color: '#8D70BD', y: 170 },
]

/** A small workspace illustration showing one person choosing context per AI task. */
export default function DashboardContextFlow() {
    const reduceMotion = useReducedMotion()
    return (
        <div className="dashboard-context-flow" aria-hidden="true">
            <svg className="dashboard-context-flow__routes" viewBox="0 0 410 224" fill="none">
                {aiLanes.map((lane, index) => (
                    <g key={lane.label}>
                        <motion.path
                            d={`M 116 112 C 174 ${112 + (lane.y - 112) * .7}, 218 ${lane.y}, 286 ${lane.y}`}
                            stroke={lane.color}
                            strokeOpacity=".22"
                            strokeWidth="1.5"
                            strokeDasharray="4 7"
                            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -22] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', delay: index * 0.4 }}
                        />
                        {!reduceMotion && (
                            <motion.circle
                                r="4"
                                fill={lane.color}
                                animate={{ cx: [116, 286], cy: [112, lane.y], opacity: [0, 1, 1, 0] }}
                                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: index * .85 }}
                            />
                        )}
                    </g>
                ))}
            </svg>
            <motion.div className="dashboard-context-flow__person" animate={reduceMotion ? undefined : { y: [0, -4, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}>
                <span className="dashboard-context-flow__avatar"><span /></span>
                <strong>You</strong>
            </motion.div>
            <motion.div className="dashboard-context-flow__context" animate={reduceMotion ? undefined : { y: [0, -6, 0], rotate: [-3, -1, -3] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                <span className="dashboard-context-flow__context-dot" />
                <span className="dashboard-context-flow__context-lines"><i /><i /><i /></span>
                <b>Your context</b>
            </motion.div>
            <div className="dashboard-context-flow__lanes">
                {aiLanes.map((lane, index) => (
                    <motion.div key={lane.label} className="dashboard-context-flow__lane" style={{ '--lane-color': lane.color, '--lane-y': `${lane.y}px` } as CSSProperties} animate={reduceMotion ? undefined : { x: [0, 3, 0], opacity: [.74, 1, .74] }} transition={{ duration: 3.2, repeat: Infinity, delay: index * .35, ease: 'easeInOut' }}>
                        <span />{lane.label} AI
                    </motion.div>
                ))}
            </div>
            <span className="dashboard-context-flow__caption">One you · the right context · every conversation</span>
        </div>
    )
}
