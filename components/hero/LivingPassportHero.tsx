'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

const story = [
    { title: 'Your writing voice', destination: 'Writing AI', color: '#C5E8A4' },
    { title: 'Your research lens', destination: 'Research AI', color: '#9EDBC5' },
    { title: 'Your build style', destination: 'Code AI', color: '#D8C6FF' },
] as const

const ContextRelayScene = dynamic(() => import('./ContextRelayScene'), { ssr: false })

function hasWebGL() {
    try {
        const canvas = document.createElement('canvas')
        return !!window.WebGLRenderingContext && !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch {
        return false
    }
}

function StoryFallback() {
    return (
        <svg className="context-relay-fallback" viewBox="0 0 520 430" role="img" aria-label="A person selects a context card and carries it to the right AI conversation">
            <defs>
                <linearGradient id="relayPerson" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#F3C9A5" /><stop offset="1" stopColor="#D9956E" /></linearGradient>
                <linearGradient id="relayPage" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#F5F6ED" /><stop offset="1" stopColor="#DCEBD4" /></linearGradient>
                <filter id="relayShadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#00190F" floodOpacity=".3" /></filter>
            </defs>
            <ellipse cx="256" cy="362" rx="196" ry="22" fill="#021B11" opacity=".55" />
            <path d="M101 255 C190 136 316 112 411 202" fill="none" stroke="#C5E8A4" strokeOpacity=".32" strokeWidth="2" strokeDasharray="4 8" />
            <circle cx="410" cy="202" r="42" fill="#A6D88B" opacity=".1" /><circle cx="410" cy="202" r="27" fill="none" stroke="#B9E69D" strokeWidth="2" />
            <circle cx="410" cy="202" r="9" fill="#D6F2B8" />
            <g filter="url(#relayShadow)" transform="translate(60 110)">
                <path d="M18 208c5-51 31-82 75-82s70 31 75 82v18H18z" fill="#E9F2E6" />
                <circle cx="93" cy="88" r="39" fill="url(#relayPerson)" />
                <path d="M56 83c1-33 23-53 52-50 24 3 38 18 39 43-23-16-56-21-91 7z" fill="#28342C" />
                <path d="M143 143l42-36" stroke="#E9B995" strokeWidth="20" strokeLinecap="round" />
                <circle cx="191" cy="102" r="11" fill="#E9B995" />
            </g>
            <g filter="url(#relayShadow)" transform="translate(224 114) rotate(-7 70 95)">
                <rect width="146" height="190" rx="18" fill="url(#relayPage)" />
                <circle cx="31" cy="35" r="9" fill="#0E5E3B" /><path d="M52 35h55" stroke="#365A47" strokeWidth="5" strokeLinecap="round" />
                <path d="M25 76h95M25 94h78M25 112h88" stroke="#8CA996" strokeWidth="4" strokeLinecap="round" opacity=".7" />
                <rect x="25" y="143" width="67" height="22" rx="11" fill="#D4E7CC" /><text x="58" y="158" textAnchor="middle" fontSize="10" fontWeight="700" fill="#24543A">VOICE</text>
            </g>
            <g fontFamily="Arial,sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">
                <rect x="363" y="258" width="94" height="30" rx="15" fill="#FFFFFF" opacity=".96" /><circle cx="379" cy="273" r="4" fill="#8D79CB" /><text x="416" y="277" fill="#254235">RESEARCH</text>
                <rect x="355" y="306" width="82" height="30" rx="15" fill="#FFFFFF" opacity=".96" /><circle cx="371" cy="321" r="4" fill="#0E5E3B" /><text x="404" y="325" fill="#254235">WRITING</text>
            </g>
        </svg>
    )
}

export function ContextRelayHero() {
    const shouldReduceMotion = useReducedMotion()
    const [mode, setMode] = useState<'pending' | '3d' | 'fallback'>('pending')
    const [activeBeat, setActiveBeat] = useState(0)
    const [arrived, setArrived] = useState(false)
    const [active, setActive] = useState(true)
    const stageRef = useRef<HTMLDivElement>(null)
    const beat = story[activeBeat] ?? story[0]
    const changeBeat = useCallback((index: number) => setActiveBeat(index), [])

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const lowPower = (navigator.hardwareConcurrency ?? 8) <= 2
            setMode(shouldReduceMotion || lowPower || !hasWebGL() ? 'fallback' : '3d')
        })
        return () => cancelAnimationFrame(frame)
    }, [shouldReduceMotion])

    useEffect(() => {
        if (mode !== '3d' || !stageRef.current) return
        const observer = new IntersectionObserver(([entry]) => setActive(entry?.isIntersecting ?? true), { threshold: 0.01 })
        observer.observe(stageRef.current)
        return () => observer.disconnect()
    }, [mode])

    return (
        <div
            ref={stageRef}
            className="context-relay-stage relative w-full mx-auto overflow-hidden rounded-[28px]"
            role="img"
            aria-label={`A person routes ${beat.title.toLowerCase()} to ${beat.destination}${arrived ? '; context received' : ''}`}
        >
            {mode === '3d' ? <ContextRelayScene active={active} onBeat={changeBeat} onArrival={setArrived} /> : <StoryFallback />}
            <div className="context-relay-stage__kicker"><span className="context-relay-stage__pulse" />A better start, in seconds</div>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={beat.title}
                    className="context-relay-stage__caption"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
                    aria-hidden="true"
                >
                    {arrived ? <><span>{beat.destination}</span><i aria-hidden="true">✓</i><strong style={{ color: beat.color }}>Context received</strong></> : <><span>{beat.title}</span><i aria-hidden="true">→</i><strong style={{ color: beat.color }}>{beat.destination}</strong></>}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
