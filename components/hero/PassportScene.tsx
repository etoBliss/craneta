'use client'

// R3F's frame loop intentionally mutates Three.js refs and typed buffers to
// render at 60fps without routing every frame through React state.
/* eslint react-hooks/immutability: off */

/**
 * PassportScene — the react-three-fiber "Living Passport".
 *
 * This module is the ONLY place that pulls in three / fiber / drei, and it is
 * loaded exclusively on the client (see LivingPassportHero, which imports it
 * via next/dynamic with `ssr: false`). Nothing here runs on the server.
 *
 * The scene, per the brief:
 *  - a stylized passport booklet floats in a dark (--ink) stage, tilted like a
 *    document on a desk, slowly rotating on its own axis;
 *  - the cover carries the Craneta crane mark, genuinely extruded (not mapped);
 *  - every few seconds a glowing emerald stamp descends and imprints on the
 *    cover — on contact a capped particle burst fires and a ripple/shockwave
 *    distortion radiates across the cover surface (custom shader), then fades;
 *  - the cursor subtly parallaxes the booklet's tilt;
 *  - scrolling past the hero flips the cover open, revealing soft-glowing text
 *    fragments, while the whole scene recedes.
 *
 * Performance: capped particle count, instanced points, clamped DPR, adaptive
 * DPR downshifting, and the frameloop pauses when the hero scrolls out of view.
 */

import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import { useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'

// ── Brand palette, in three-space ───────────────────────────────────────────
const INK = '#0A2A1E' // stage background — matches --ink
const LEATHER = '#14583A' // brighter cover so the emboss and page details read clearly
const LEATHER_EDGE = '#0A3021' // booklet spine / edges
const EMERALD = '#0E5E3B' // --primary
const GLOW = '#2BD07E' // emissive emerald for the stamp, ripple wavefront and text

// Booklet dimensions (world units).
const BOOK_W = 3.15
const BOOK_H = 4.3
const BOOK_D = 0.42
const COVER_W = BOOK_W - 0.16
const COVER_H = BOOK_H - 0.16
const COVER_Z = BOOK_D / 2 + 0.012 // cover surface sits just proud of the body

// Stamp cycle timing (seconds).
const PERIOD = 3.6
const T_CONTACT = 0.9 // descend finishes / impact fires
const T_LIFT = 1.35 // press hold ends, lift begins
const T_UP = 2.2 // fully lifted
const STAMP_REST_Z = 2.5 // resting height above the cover (local +z, which the tilt turns into "above")
const STAMP_CONTACT_Z = 0.32
const IMPACT = new THREE.Vector2(-0.85, -1.25) // lands on the embossed ring near the lower-left cover corner

const PARTICLE_COUNT = 120
const PARTICLE_LIFE = 0.85 // seconds a burst mote lives

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeIn = (t: number) => t * t

// ── Extruded crane mark ─────────────────────────────────────────────────────
// The crane silhouette in public/craneta-icon-green.svg is all straight
// segments, so we rebuild it as a THREE.Shape (SVG y-down → three y-up) and
// extrude it. Two closed shapes: the origami body and the head triangle.
function craneGeometry(): THREE.ExtrudeGeometry {
    const body = new THREE.Shape()
    const pts: [number, number][] = [
        [0, 22], [14, 8], [28, 14], [24, 22], [30, 22], [22, 30], [14, 26], [6, 32],
    ]
    body.moveTo(pts[0][0], -pts[0][1])
    for (let i = 1; i < pts.length; i++) body.lineTo(pts[i][0], -pts[i][1])
    body.closePath()

    const head = new THREE.Shape()
    head.moveTo(14, -8)
    head.lineTo(18, 0)
    head.lineTo(22, -6)
    head.closePath()

    const geo = new THREE.ExtrudeGeometry([body, head], {
        depth: 4,
        bevelEnabled: true,
        bevelThickness: 0.8,
        bevelSize: 0.6,
        bevelSegments: 2,
    })
    geo.center()
    geo.computeVertexNormals()
    return geo
}

// ── Ripple shader for the cover surface ─────────────────────────────────────
const RIPPLE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uImpactTime;
  uniform vec2  uImpactPos;
  varying vec2  vUv;
  varying float vRipple;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float ripple = 0.0;
    float dt = uTime - uImpactTime;
    if (uImpactTime >= 0.0 && dt >= 0.0 && dt < 1.5) {
      float dist = distance(pos.xy, uImpactPos);
      float wave = sin(dist * 9.0 - dt * 15.0);
      float decay = exp(-dist * 1.3) * exp(-dt * 3.0);
      float front = smoothstep(0.35, 0.0, abs(dist - dt * 2.7)); // expanding shockwave ring
      ripple = wave * decay * 0.11 + front * exp(-dt * 2.2) * 0.09;
      pos.z += ripple;
    }
    vRipple = ripple;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const RIPPLE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uGlow;
  varying vec2 vUv;
  varying float vRipple;

  void main() {
    vec2 c = vUv - 0.5;
    float vig = smoothstep(0.85, 0.15, length(c));
    vec3 base = mix(uColor * 0.65, uColor, vig);
    float glow = clamp(abs(vRipple) * 6.5, 0.0, 1.0);
    vec3 col = base + uGlow * glow;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }
`

function makeRippleMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uImpactTime: { value: -10 },
            uImpactPos: { value: IMPACT.clone() },
            uColor: { value: new THREE.Color(LEATHER) },
            uGlow: { value: new THREE.Color(GLOW) },
        },
        vertexShader: RIPPLE_VERT,
        fragmentShader: RIPPLE_FRAG,
    })
}

// Soft round sprite so additive points read as glowing motes, not squares.
function makeParticleTexture(): THREE.CanvasTexture {
    const s = 64
    const cvs = document.createElement('canvas')
    cvs.width = cvs.height = s
    const ctx = cvs.getContext('2d')!
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.4, 'rgba(120,240,180,0.8)')
    g.addColorStop(1, 'rgba(43,208,126,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    const tex = new THREE.CanvasTexture(cvs)
    tex.needsUpdate = true
    return tex
}

// ── Booklet ─────────────────────────────────────────────────────────────────
// The cover is hinged at its left edge so it can flip open on scroll. The
// ripple shader lives on the cover; the crane mark and stamp-ring emboss sit
// proud of it. Behind the cover, soft-glowing "text" bars are revealed as it
// opens.
function Booklet({ open }: { open: RefObject<number> }) {
    const rippleMat = useMemo(() => makeRippleMaterial(), [])
    const crane = useMemo(() => craneGeometry(), [])
    const hinge = useRef<THREE.Group>(null!)
    const textGroup = useRef<THREE.Group>(null!)

    const textBars = useMemo(
        () => [
            { y: 1.3, w: 2.3, o: 0.9 },
            { y: 0.95, w: 1.7, o: 0.55 },
            { y: 0.4, w: 2.1, o: 0.8 },
            { y: 0.05, w: 1.3, o: 0.45 },
            { y: -0.5, w: 2.0, o: 0.7 },
            { y: -0.85, w: 1.5, o: 0.5 },
            { y: -1.4, w: 1.9, o: 0.65 },
        ],
        []
    )
    const textMat = useMemo(
        () =>
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(GLOW),
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            }),
        []
    )

    useFrame((state) => {
        rippleMat.uniforms.uTime.value = state.clock.elapsedTime
        const o = open.current
        // Hinge opens up to ~130° as the hero scrolls away.
        if (hinge.current) hinge.current.rotation.y = -o * 2.3
        // Text fragments glow in as the cover lifts off them.
        textMat.opacity = clamp01((o - 0.08) * 1.6)
    })

    return (
        <group>
            {/* Booklet body / pages */}
            <RoundedBox args={[BOOK_W, BOOK_H, BOOK_D]} radius={0.12} smoothness={4} castShadow>
                <meshStandardMaterial color={LEATHER_EDGE} roughness={0.85} metalness={0.05} />
            </RoundedBox>
            {/* Cream page block just inside the covers */}
            <mesh position={[0.04, 0, 0]}>
                <boxGeometry args={[BOOK_W - 0.1, BOOK_H - 0.18, BOOK_D - 0.06]} />
                <meshStandardMaterial color="#F1F7F3" roughness={0.9} />
            </mesh>

            {/* Soft-glowing text fragments on the first inner page (revealed on open) */}
            <group ref={textGroup} position={[0, 0, COVER_Z - 0.02]}>
                {textBars.map((b, i) => (
                    <mesh key={i} position={[-0.15 + b.w / 2 - COVER_W / 2 + 0.35, b.y, 0]} material={textMat}>
                        <planeGeometry args={[b.w, 0.12]} />
                    </mesh>
                ))}
            </group>

            {/* Hinged cover — pivots at the left edge */}
            <group ref={hinge} position={[-COVER_W / 2, 0, COVER_Z]}>
                {/* Cover surface (ripples on impact) */}
                <mesh position={[COVER_W / 2, 0, 0]}>
                    <planeGeometry args={[COVER_W, COVER_H, 48, 64]} />
                    <primitive object={rippleMat} attach="material" />
                </mesh>

                {/* Extruded crane mark, proud of the cover */}
                <mesh geometry={crane} position={[COVER_W / 2 + 0.15, 0.55, 0.06]} scale={0.036} rotation={[0, 0, 0]}>
                    <meshStandardMaterial color="#DDF4E5" emissive="#4DAB75" emissiveIntensity={0.22} roughness={0.4} metalness={0.2} />
                </mesh>

                {/* Embossed dashed stamp ring, lower-left — echoes the mark */}
                <group position={[COVER_W / 2 - 0.85, -1.25, 0.03]}>
                    <mesh>
                        <torusGeometry args={[0.42, 0.03, 12, 48]} />
                        <meshStandardMaterial color={EMERALD} emissive={EMERALD} emissiveIntensity={0.25} roughness={0.5} />
                    </mesh>
                    <mesh>
                        <circleGeometry args={[0.12, 24]} />
                        <meshStandardMaterial color={EMERALD} emissive={EMERALD} emissiveIntensity={0.3} roughness={0.5} />
                    </mesh>
                </group>

                {/* Two content lines above the ring */}
                <mesh position={[COVER_W / 2 - 0.55, -0.35, 0.03]}>
                    <planeGeometry args={[1.5, 0.08]} />
                    <meshBasicMaterial color={EMERALD} transparent opacity={0.5} />
                </mesh>
                <mesh position={[COVER_W / 2 - 0.75, -0.6, 0.03]}>
                    <planeGeometry args={[1.1, 0.08]} />
                    <meshBasicMaterial color={EMERALD} transparent opacity={0.3} />
                </mesh>
            </group>

            <StampAndBurst rippleMat={rippleMat} open={open} />
        </group>
    )
}

// ── Descending stamp + particle burst ───────────────────────────────────────
function StampAndBurst({ rippleMat, open }: { rippleMat: THREE.ShaderMaterial; open: RefObject<number> }) {
    const stamp = useRef<THREE.Group>(null!)
    const seal = useRef<THREE.Mesh>(null!)
    const points = useRef<THREE.Points>(null!)
    const firedCycle = useRef(-1)

    const particleTex = useMemo(() => makeParticleTexture(), [])
    // Per-particle velocity + age buffers (JS side).
    const vel = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), [])
    const age = useMemo(() => new Float32Array(PARTICLE_COUNT).fill(99), [])
    const geo = useMemo(() => {
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3))
        return g
    }, [])
    const pointsMat = useMemo(
        () =>
            new THREE.PointsMaterial({
                size: 0.16,
                map: particleTex,
                color: new THREE.Color(GLOW),
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true,
            }),
        [particleTex]
    )

    function fireBurst() {
        const pos = geo.getAttribute('position') as THREE.BufferAttribute
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            pos.setXYZ(i, IMPACT.x, IMPACT.y, COVER_Z + 0.05)
            // Mostly in the cover plane, splashing outward, with a little lift toward camera (+z).
            const a = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.5
            const speed = 1.4 + Math.random() * 2.2
            vel[i * 3] = Math.cos(a) * speed
            vel[i * 3 + 1] = Math.sin(a) * speed
            vel[i * 3 + 2] = 1.5 + Math.random() * 2.5
            age[i] = 0
        }
        pos.needsUpdate = true
    }

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime
        const cycle = Math.floor(t / PERIOD)
        const local = t - cycle * PERIOD
        const scrolledAway = open.current > 0.12 // stop stamping once the cover starts opening

        // Stamp motion along local z (the group tilt turns this into "from above").
        let z = STAMP_REST_Z
        let sealOpacity = 0
        if (!scrolledAway) {
            if (local < T_CONTACT) {
                z = THREE.MathUtils.lerp(STAMP_REST_Z, STAMP_CONTACT_Z, easeIn(local / T_CONTACT))
                sealOpacity = clamp01(local / 0.3)
            } else if (local < T_LIFT) {
                z = STAMP_CONTACT_Z
                sealOpacity = 1
            } else if (local < T_UP) {
                z = THREE.MathUtils.lerp(STAMP_CONTACT_Z, STAMP_REST_Z, easeOut((local - T_LIFT) / (T_UP - T_LIFT)))
                sealOpacity = 1 - clamp01((local - T_LIFT) / (T_UP - T_LIFT))
            }
            // Impact — fire exactly once per cycle when the seal reaches the cover.
            if (local >= T_CONTACT && firedCycle.current !== cycle) {
                firedCycle.current = cycle
                rippleMat.uniforms.uImpactTime.value = t
                fireBurst()
            }
        }

        if (stamp.current) {
            stamp.current.position.set(IMPACT.x, IMPACT.y, z)
            stamp.current.visible = sealOpacity > 0.01
        }
        if (seal.current) {
            const m = seal.current.material as THREE.MeshStandardMaterial
            m.emissiveIntensity = 0.6 + Math.sin(t * 6) * 0.15
        }

        // Integrate the burst. Every mote in a burst shares a birth time, so
        // age[0] doubles as the burst clock for a global fade, and a fully-aged
        // burst hides the whole <points> object (PointsMaterial has no
        // per-point alpha, so we can't fade motes individually).
        const pos = geo.getAttribute('position') as THREE.BufferAttribute
        let anyAlive = false
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            if (age[i] >= PARTICLE_LIFE) continue
            anyAlive = true
            age[i] += delta
            vel[i * 3 + 2] -= delta * 4.5 // gravity eases the toward-camera lift back down
            pos.setXYZ(
                i,
                pos.getX(i) + vel[i * 3] * delta,
                pos.getY(i) + vel[i * 3 + 1] * delta,
                pos.getZ(i) + vel[i * 3 + 2] * delta
            )
        }
        if (anyAlive) pos.needsUpdate = true
        if (points.current) {
            points.current.visible = anyAlive
            pointsMat.opacity = clamp01(1 - age[0] / PARTICLE_LIFE) * 0.95
        }
    })

    return (
        <group>
            {/* The stamp: a handle + a glowing emerald seal ring */}
            <group ref={stamp} position={[IMPACT.x, IMPACT.y, STAMP_REST_Z]}>
                <mesh position={[0, 0, 0.45]}>
                    <cylinderGeometry args={[0.16, 0.22, 0.7, 24]} />
                    <meshStandardMaterial color="#E0D0A6" metalness={0.48} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0, 0.08]}>
                    <cylinderGeometry args={[0.34, 0.34, 0.12, 32]} />
                    <meshStandardMaterial color="#C7A75E" metalness={0.62} roughness={0.28} />
                </mesh>
                <mesh ref={seal} position={[0, 0, 0.0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.28, 0.05, 16, 40]} />
                    <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={0.7} roughness={0.3} />
                </mesh>
            </group>

            <points ref={points} geometry={geo} material={pointsMat} />
        </group>
    )
}

// ── Root scene: tilt, auto-rotate, parallax, scroll recede ───────────────────
function Scene({ scroll, pointer }: { scroll: RefObject<number>; pointer: RefObject<{ x: number; y: number }> }) {
    const root = useRef<THREE.Group>(null!)
    const spin = useRef(0)

    useFrame((_, delta) => {
        const g = root.current
        if (!g) return
        spin.current += delta * 0.18 // slow rotation on its own axis
        const o = scroll.current
        const p = pointer.current

        // Base tilt so the cover faces up-toward the camera (stamp reads as "from above").
        const targetRX = -0.5 + p.y * 0.14
        const targetRY = Math.sin(spin.current) * 0.35 + p.x * 0.3
        g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetRX, 0.08)
        g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRY, 0.08)

        // Recede as the hero scrolls away.
        g.position.z = THREE.MathUtils.lerp(g.position.z, -o * 3.2, 0.1)
        g.position.y = THREE.MathUtils.lerp(g.position.y, o * 0.6, 0.1)
        const s = 1 - o * 0.22
        g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, 0.1))
    })

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 6]} intensity={1.4} castShadow />
            <directionalLight position={[-4, 2, 2]} intensity={0.4} color={GLOW} />
            <pointLight position={[0, 1.5, 3]} intensity={0.5} color={GLOW} distance={8} />
            <group ref={root}>
                <Booklet open={scroll} />
            </group>
        </>
    )
}

// ── Public component ─────────────────────────────────────────────────────────
export interface PassportSceneProps {
    /** 0..1 hero-scroll progress, mutated by the wrapper (no re-render). */
    scrollProgress: RefObject<number>
    /** Normalized pointer, mutated by the wrapper. */
    pointer: RefObject<{ x: number; y: number }>
    /** Toggled false by an IntersectionObserver to pause the frameloop. */
    active: boolean
}

export default function PassportScene({ scrollProgress, pointer, active }: PassportSceneProps) {
    const [dpr, setDpr] = useState(1.5)

    return (
        <Canvas
            frameloop={active ? 'always' : 'never'}
            dpr={dpr}
            camera={{ position: [0, 0.2, 7], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            style={{ background: 'transparent' }}
        >
            <fog attach="fog" args={[INK, 8, 16]} />
            <PerformanceMonitor
                onDecline={() => setDpr(1)}
                onIncline={() => setDpr((d) => Math.min(1.75, d + 0.25))}
            />
            <AdaptiveDpr pixelated />
            <Scene scroll={scrollProgress} pointer={pointer} />
        </Canvas>
    )
}
