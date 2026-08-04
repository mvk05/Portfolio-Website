'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// Propeller — thin blades, spins fast
function Propeller({ speed = 1 }: { speed?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 22 * speed
  })
  return (
    <group ref={ref}>
      {/* Blade A */}
      <mesh>
        <boxGeometry args={[0.28, 0.004, 0.028]} />
        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} transparent opacity={0.8} />
      </mesh>
      {/* Blade B */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.28, 0.004, 0.028]} />
        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} transparent opacity={0.8} />
      </mesh>
      {/* Hub cap */}
      <mesh position={[0, -0.005, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.008, 10]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

function DroneModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.18
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.04
  })

  // ARM: distance from center to motor along each axis
  const ARM = 0.30
  // Arm runs diagonally — actual length = ARM * sqrt(2)
  const ARM_DIAG = ARM * Math.SQRT2

  // Body half-height: body is 0.055 tall, bottom face at y = -0.0275
  const BODY_HALF_H = 0.055 / 2

  // Motors in X-frame config
  const motors: Array<{ pos: [number, number, number]; speed: number }> = [
    { pos: [ ARM, 0,  ARM], speed:  1 },
    { pos: [-ARM, 0,  ARM], speed: -1 },
    { pos: [-ARM, 0, -ARM], speed:  1 },
    { pos: [ ARM, 0, -ARM], speed: -1 },
  ]

  // Landing gear legs — 4 corners, well inside arm positions
  const legCorners: [number, number][] = [
    [-0.09,  0.09],
    [ 0.09,  0.09],
    [-0.09, -0.09],
    [ 0.09, -0.09],
  ]
  const LEG_H = 0.09
  // Top of strut = body bottom (y = -BODY_HALF_H), so center at:
  const LEG_CY = -BODY_HALF_H - LEG_H / 2

  return (
    <group ref={groupRef}>
      {/* ── Body ── */}
      <mesh>
        <boxGeometry args={[0.22, 0.055, 0.22]} />
        <meshStandardMaterial color="#1c1a18" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Top lid */}
      <mesh position={[0, BODY_HALF_H + 0.0075, 0]}>
        <boxGeometry args={[0.17, 0.015, 0.17]} />
        <meshStandardMaterial color="#26231f" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Orange accent stripe */}
      <mesh position={[0, BODY_HALF_H + 0.003, 0]}>
        <boxGeometry args={[0.19, 0.005, 0.044]} />
        <meshStandardMaterial color="#F03A00" emissive="#F03A00" emissiveIntensity={0.6} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* FC block on top */}
      <mesh position={[0, BODY_HALF_H + 0.02, 0]}>
        <boxGeometry args={[0.07, 0.018, 0.07]} />
        <meshStandardMaterial color="#0d1117" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* LED at body bottom */}
      <mesh position={[0, -BODY_HALF_H, 0]}>
        <sphereGeometry args={[0.009, 8, 8]} />
        <meshStandardMaterial color="#F03A00" emissive="#F03A00" emissiveIntensity={2.5} />
      </mesh>

      {/* Camera gimbal */}
      <mesh position={[0, -BODY_HALF_H - 0.022, 0.078]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial color="#111" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Lens */}
      <mesh position={[0, -BODY_HALF_H - 0.022, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.014, 12]} />
        <meshStandardMaterial color="#0a0a0a" metalness={1} roughness={0} />
      </mesh>

      {/* ── Arms ── */}
      {motors.map((motor, i) => {
        const [mx, , mz] = motor.pos
        // Arm points from origin toward [mx, 0, mz]
        // A box along X, rotated by -atan2(mz, mx) around Y, aligns with that direction
        const angle = Math.atan2(mz, mx)
        return (
          <group key={i}>
            {/* Arm box: centered at arm midpoint, length = ARM_DIAG along the diagonal */}
            <mesh position={[mx / 2, 0, mz / 2]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[ARM_DIAG, 0.018, 0.026]} />
              <meshStandardMaterial color="#1c1a18" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Motor can at exact motor tip */}
            <mesh position={motor.pos}>
              <cylinderGeometry args={[0.024, 0.022, 0.030, 12]} />
              <meshStandardMaterial color="#1c1a18" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Propeller on top of motor (motor top = 0 + 0.015, add small gap) */}
            <group position={[mx, 0.020, mz]}>
              <Propeller speed={motor.speed} />
            </group>
          </group>
        )
      })}

      {/* ── Landing Gear ── */}
      {legCorners.map(([x, z], i) => (
        <group key={i}>
          {/* Vertical strut — top flush with body bottom */}
          <mesh position={[x, LEG_CY, z]}>
            <cylinderGeometry args={[0.005, 0.005, LEG_H, 6]} />
            <meshStandardMaterial color="#2a2826" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Horizontal skid at strut bottom */}
          <mesh position={[x, LEG_CY - LEG_H / 2, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.14, 6]} />
            <meshStandardMaterial color="#2a2826" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function Drone3D({ className = '' }: { className?: string }) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0.55, 1.8], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 3]} intensity={1.4} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} />
      <pointLight position={[0, 2, 2]} intensity={0.4} color="#F03A00" />
      <Float speed={1.4} rotationIntensity={0.04} floatIntensity={0.45}>
        <DroneModel />
      </Float>
    </Canvas>
  )
}
