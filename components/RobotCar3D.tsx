'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// Wheel: torus in XY plane, axle along Z, spins around Z
function Wheel({ position }: { position: [number, number, number] }) {
  const tireRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (tireRef.current) tireRef.current.rotation.z -= delta * 2.2
  })
  return (
    <group position={position}>
      {/* Tire */}
      <mesh ref={tireRef}>
        <torusGeometry args={[0.085, 0.038, 16, 32]} />
        <meshStandardMaterial color="#1a1814" roughness={0.88} metalness={0.1} />
      </mesh>
      {/* Hub disc — cylinder with axle along Z, rotate X by 90° */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.050, 0.050, 0.032, 16]} />
        <meshStandardMaterial color="#3a3835" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Spokes */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.032, Math.sin(a) * 0.032, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.066, 0.008, 0.008]} />
            <meshStandardMaterial color="#F03A00" metalness={0.6} roughness={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}

function CarBody() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3 + 0.25
  })

  // ── Layout constants ─────────────────────────────────────────────
  const CH           = 0.10               // chassis height
  const CHASSIS_TOP  =  CH / 2            //  0.05
  const CHASSIS_BOT  = -CH / 2            // -0.05

  const WHEEL_R      = 0.085              // torus radius
  // Wheel center: top of wheel flush with chassis bottom
  const WHEEL_Y      = CHASSIS_BOT - WHEEL_R + 0.05  // raised slightly

  const SHELL_H      = 0.14
  const SHELL_TOP    = CHASSIS_TOP + SHELL_H   //  0.19

  // Wheels at front/back of chassis (±0.28 in X), sides outside chassis (±0.28 in Z)
  const wheelPositions: [number, number, number][] = [
    [ 0.28, WHEEL_Y,  0.28],
    [ 0.28, WHEEL_Y, -0.28],
    [-0.28, WHEEL_Y,  0.28],
    [-0.28, WHEEL_Y, -0.28],
  ]

  return (
    <group ref={groupRef}>
      {/* Chassis plate */}
      <mesh>
        <boxGeometry args={[0.82, CH, 0.46]} />
        <meshStandardMaterial color="#1a1814" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Orange accent stripe — runs along chassis bottom edge */}
      <mesh position={[0, CHASSIS_BOT + 0.008, 0]}>
        <boxGeometry args={[0.84, 0.022, 0.48]} />
        <meshStandardMaterial color="#F03A00" emissive="#F03A00" emissiveIntensity={0.25} metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Body shell — sits on top of chassis */}
      <mesh position={[0.02, CHASSIS_TOP + SHELL_H / 2, 0]}>
        <boxGeometry args={[0.60, SHELL_H, 0.40]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Front nose wedge — bridges chassis front to shell */}
      <mesh position={[0.32, CHASSIS_TOP + 0.03, 0]}>
        <boxGeometry args={[0.14, 0.06, 0.38]} />
        <meshStandardMaterial color="#1c1a18" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* ── Electronics on top of body shell ── */}

      {/* Jetson Orin Nano slab — flush on shell top */}
      <mesh position={[0.05, SHELL_TOP + 0.018, 0]}>
        <boxGeometry args={[0.24, 0.034, 0.19]} />
        <meshStandardMaterial color="#0d1117" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* PCB green layer on Jetson */}
      <mesh position={[0.05, SHELL_TOP + 0.037, 0]}>
        <boxGeometry args={[0.21, 0.004, 0.16]} />
        <meshStandardMaterial color="#0a3d20" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Status LED */}
      <mesh position={[0.13, SHELL_TOP + 0.042, 0.055]}>
        <sphereGeometry args={[0.010, 8, 8]} />
        <meshStandardMaterial color="#F03A00" emissive="#F03A00" emissiveIntensity={3} />
      </mesh>

      {/* PCA9685 PWM board — beside Jetson at back-left */}
      <mesh position={[-0.14, SHELL_TOP + 0.012, 0.06]}>
        <boxGeometry args={[0.14, 0.022, 0.10]} />
        <meshStandardMaterial color="#0a1a3d" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* ── IMX219 Camera — at chassis front, centered on shell face ── */}
      <mesh position={[0.36, CHASSIS_TOP + 0.07, 0]}>
        <boxGeometry args={[0.055, 0.055, 0.055]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Lens barrel — rotate Z 90° so cylinder faces along +X */}
      <mesh position={[0.393, CHASSIS_TOP + 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.020, 16]} />
        <meshStandardMaterial color="#080808" metalness={1} roughness={0} />
      </mesh>
      {/* Lens ring */}
      <mesh position={[0.404, CHASSIS_TOP + 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.018, 0.004, 8, 16]} />
        <meshStandardMaterial color="#F03A00" emissive="#F03A00" emissiveIntensity={0.5} />
      </mesh>

      {/* ── Antenna — rooted at shell top, back-left corner ── */}
      {/* Base: bottom of cylinder = SHELL_TOP, center = SHELL_TOP + 0.10 */}
      <mesh position={[-0.12, SHELL_TOP + 0.10, -0.15]}>
        <cylinderGeometry args={[0.005, 0.005, 0.20, 6]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Tip LED */}
      <mesh position={[-0.12, SHELL_TOP + 0.205, -0.15]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#F03A00" emissive="#F03A00" emissiveIntensity={1.2} />
      </mesh>

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <Wheel key={i} position={pos} />
      ))}
    </group>
  )
}

export default function RobotCar3D({ className = '' }: { className?: string }) {
  return (
    <Canvas
      className={className}
      camera={{ position: [1.1, 0.75, 1.6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 2]} intensity={1.4} />
      <directionalLight position={[-2, 3, -2]} intensity={0.45} />
      <pointLight position={[0, 1, 2]} intensity={0.5} color="#F03A00" />
      <Float speed={1} rotationIntensity={0.03} floatIntensity={0.25}>
        <CarBody />
      </Float>
    </Canvas>
  )
}
