'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { AdaptiveDpr, Float, PerformanceMonitor, RoundedBox } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const beats = [
    { label: 'Your writing voice', destination: 'Writing AI', color: '#C5E8A4' },
    { label: 'Your research lens', destination: 'Research AI', color: '#9EDBC5' },
    { label: 'Your build style', destination: 'Code AI', color: '#D8C6FF' },
] as const
const BEAT_SECONDS = 2.4

function Person() {
    return (
        <group position={[-1.8, -0.72, 0]}>
            {/* A warm, simple character silhouette with a reaching gesture. */}
            <mesh position={[0, 0.68, 0]} castShadow>
                <sphereGeometry args={[0.34, 32, 32]} />
                <meshStandardMaterial color="#E9B995" roughness={0.72} />
            </mesh>
            <mesh position={[-0.05, 0.91, 0]} scale={[1.02, 0.55, 1.04]}>
                <sphereGeometry args={[0.34, 28, 28]} />
                <meshStandardMaterial color="#27352C" roughness={0.82} />
            </mesh>
            <mesh position={[0.02, 0.08, 0]} castShadow>
                <capsuleGeometry args={[0.42, 0.74, 8, 20]} />
                <meshStandardMaterial color="#EAF3E8" roughness={0.62} />
            </mesh>
            <mesh position={[0.31, 0.23, 0.04]} rotation={[0, 0, -0.9]} castShadow>
                <capsuleGeometry args={[0.105, 0.55, 6, 12]} />
                <meshStandardMaterial color="#E9B995" roughness={0.72} />
            </mesh>
            <mesh position={[0.61, 0.46, 0.04]}>
                <sphereGeometry args={[0.12, 20, 20]} />
                <meshStandardMaterial color="#E9B995" roughness={0.72} />
            </mesh>
        </group>
    )
}

function ContextStack({ activeBeat }: { activeBeat: number }) {
    const group = useRef<THREE.Group>(null)
    const card = useRef<THREE.Group>(null)
    const colors = ['#C5E8A4', '#9EDBC5', '#D8C6FF']

    useFrame(({ clock }, delta) => {
        if (group.current) {
            group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, Math.sin(clock.elapsedTime * 0.55) * 0.12, 4, delta)
            group.current.position.y = -0.04 + Math.sin(clock.elapsedTime * 1.2) * 0.08
        }
        if (card.current) {
            card.current.rotation.z = THREE.MathUtils.damp(card.current.rotation.z, activeBeat * -0.055, 5, delta)
        }
    })

    return (
        <group ref={group} position={[0, 0, 0.1]}>
            {colors.map((color, index) => (
                <Float key={color} speed={1.2 + index * 0.16} floatIntensity={0.12} rotationIntensity={0}>
                    <group ref={index === activeBeat ? card : undefined} position={[-0.04 + index * 0.075, -0.03 + index * 0.08, -index * 0.12]} rotation={[0.03, 0, -0.12 + index * 0.1]}>
                        <RoundedBox args={[1.03, 1.32, 0.08]} radius={0.11} smoothness={4} castShadow>
                            <meshStandardMaterial color={index === activeBeat ? color : '#F1F4ED'} roughness={0.46} metalness={0.08} />
                        </RoundedBox>
                        <mesh position={[-0.27, 0.39, 0.052]}>
                            <circleGeometry args={[0.11, 24]} />
                            <meshBasicMaterial color="#0E5E3B" />
                        </mesh>
                        <mesh position={[-0.05, 0.38, 0.052]}>
                            <boxGeometry args={[0.32, 0.045, 0.01]} />
                            <meshBasicMaterial color="#264438" />
                        </mesh>
                        {[0.1, -0.08, -0.26, -0.44].map((y, line) => (
                            <mesh key={line} position={[-0.01, y, 0.052]}>
                                <boxGeometry args={[line === 3 ? 0.61 : 0.76, 0.028, 0.01]} />
                                <meshBasicMaterial color="#527064" transparent opacity={0.42 - line * 0.04} />
                            </mesh>
                        ))}
                    </group>
                </Float>
            ))}
        </group>
    )
}

function AIDestinations({ activeBeat }: { activeBeat: number }) {
    const nodes = useRef<Array<THREE.Group | null>>([])
    const yPositions = [1.12, 0, -1.12]
    const colors = ['#A9D77E', '#78C8A4', '#B7A0F2']

    useFrame(({ clock }, delta) => {
        nodes.current.forEach((node, index) => {
            if (!node) return
            const active = index === activeBeat
            const scale = active ? 1.12 + Math.sin(clock.elapsedTime * 5) * 0.035 : 0.82
            node.scale.setScalar(THREE.MathUtils.damp(node.scale.x, scale, 8, delta))
            node.rotation.z += delta * (active ? 0.42 : 0.12)
        })
    })

    return (
        <group>
            {yPositions.map((y, index) => (
                <group key={y} ref={(node) => { nodes.current[index] = node }} position={[2.0, y, 0]}>
                    <mesh rotation={[0, 0, Math.PI / 4]}>
                        <torusGeometry args={[0.34, 0.025, 8, 64]} />
                        <meshStandardMaterial color={colors[index]} emissive={colors[index]} emissiveIntensity={index === activeBeat ? 0.75 : 0.2} />
                    </mesh>
                    <mesh>
                        <sphereGeometry args={[0.15, 24, 24]} />
                        <meshStandardMaterial color={colors[index]} emissive={colors[index]} emissiveIntensity={index === activeBeat ? 0.9 : 0.28} roughness={0.24} metalness={0.16} />
                    </mesh>
                    <mesh position={[0, 0, -0.1]}>
                        <sphereGeometry args={[0.36, 20, 20]} />
                        <meshBasicMaterial color={colors[index]} transparent opacity={index === activeBeat ? 0.09 : 0.025} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

function RelayPacket({ activeBeat }: { activeBeat: number }) {
    const packet = useRef<THREE.Group>(null)
    const curves = useMemo(() => [1.12, 0, -1.12].map((y) => new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.52, 0.15, 0.36),
        new THREE.Vector3(0.12, 0.72 + y * 0.18, 0.28),
        new THREE.Vector3(0.92, 0.58 + y * 0.42, 0.22),
        new THREE.Vector3(1.62, y, 0.12),
    )), [])
    const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E9F4DC', emissive: '#9BCB7B', emissiveIntensity: 0.7, roughness: 0.28 }), [])

    useFrame(({ clock }) => {
        const packetRef = packet.current
        if (!packetRef) return
        const local = (clock.elapsedTime % BEAT_SECONDS) / BEAT_SECONDS
        const t = local < 0.68 ? local / 0.68 : 1
        curves[activeBeat].getPoint(t, packetRef.position)
        packetRef.visible = local > 0.12 && local < 0.78
        packetRef.rotation.z = -t * 0.48
    })

    return (
        <group ref={packet}>
            <RoundedBox args={[0.3, 0.38, 0.09]} radius={0.04} smoothness={3} material={material} castShadow>
                <mesh position={[-0.045, 0.06, 0.052]}>
                    <boxGeometry args={[0.15, 0.025, 0.01]} />
                    <meshBasicMaterial color="#0E5E3B" />
                </mesh>
                <mesh position={[-0.035, -0.005, 0.052]}>
                    <boxGeometry args={[0.13, 0.018, 0.01]} />
                    <meshBasicMaterial color="#5E826A" />
                </mesh>
            </RoundedBox>
            <pointLight color="#C5E8A4" intensity={1.4} distance={1.5} />
        </group>
    )
}

function StoryScene({ activeBeat, setActiveBeat, setArrived }: { activeBeat: number; setActiveBeat: (beat: number) => void; setArrived: (arrived: boolean) => void }) {
    const lastBeat = useRef(0)
    const lastArrival = useRef(false)
    const travel = useRef<THREE.Group>(null)
    const routeLines = useMemo(() => [1.12, 0, -1.12].map((y) => {
        const points = [new THREE.Vector3(-0.85, 0.05, 0), new THREE.Vector3(-0.2, 0.12 + y * 0.36, -0.02), new THREE.Vector3(0.75, y * 0.8, -0.02), new THREE.Vector3(1.68, y, 0)]
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 40, 0.01, 6, false)
    }), [])

    useFrame(({ clock, pointer }, delta) => {
        const local = (clock.elapsedTime % BEAT_SECONDS) / BEAT_SECONDS
        const next = Math.floor(clock.elapsedTime / BEAT_SECONDS) % beats.length
        if (lastBeat.current !== next) {
            lastBeat.current = next
            setActiveBeat(next)
        }
        const arrived = local >= 0.7 && local < 0.9
        if (lastArrival.current !== arrived) {
            lastArrival.current = arrived
            setArrived(arrived)
        }
        if (travel.current) {
            travel.current.rotation.y = THREE.MathUtils.damp(travel.current.rotation.y, Math.sin(clock.elapsedTime * 0.45) * 0.045 + pointer.x * 0.08, 3, delta)
            travel.current.rotation.x = THREE.MathUtils.damp(travel.current.rotation.x, -pointer.y * 0.05, 3, delta)
        }
    })

    return (
        <>
            <ambientLight intensity={1.15} />
            <directionalLight position={[-3, 5, 6]} intensity={2.2} color="#F5F4DF" />
            <pointLight position={[2.3, 0.5, 3]} intensity={2.1} color="#73D6A0" distance={8} />
            <pointLight position={[-2, -1, 2]} intensity={1.3} color="#E9B995" distance={6} />
            <group ref={travel}>
                {/* Delicate route filaments connect a person's context to each AI lane. */}
                {routeLines.map((geometry, index) => <mesh key={index} geometry={geometry} position={[0, 0, -0.22]}><meshBasicMaterial color={index === activeBeat ? beats[index].color : '#EAF6EA'} transparent opacity={index === activeBeat ? 0.65 : 0.12} /></mesh>)}
                <Person />
                <ContextStack activeBeat={activeBeat} />
                <AIDestinations activeBeat={activeBeat} />
                <RelayPacket activeBeat={activeBeat} />
            </group>
        </>
    )
}

export default function ContextRelayScene({ active, onBeat, onArrival }: { active: boolean; onBeat: (beat: number) => void; onArrival: (arrived: boolean) => void }) {
    const [dpr, setDpr] = useState(1.4)
    const [activeBeat, setActiveBeat] = useState(0)

    const changeBeat = (beat: number) => {
        setActiveBeat(beat)
        onBeat(beat)
    }

    return (
        <Canvas frameloop={active ? 'always' : 'never'} dpr={dpr} camera={{ position: [0, 0.05, 7.7], fov: 39 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
            <color attach="background" args={['#0A2A1E']} />
            <fog attach="fog" args={['#0A2A1E', 9, 15]} />
            <StoryScene activeBeat={activeBeat} setActiveBeat={changeBeat} setArrived={onArrival} />
            <PerformanceScale onDecline={() => setDpr(1)} onIncline={() => setDpr((value) => Math.min(1.7, value + 0.15))} />
        </Canvas>
    )
}

function PerformanceScale({ onDecline, onIncline }: { onDecline: () => void; onIncline: () => void }) {
    return <><PerformanceMonitor onDecline={onDecline} onIncline={onIncline} /><AdaptiveDpr pixelated /></>
}

export { beats as contextRelayBeats }
