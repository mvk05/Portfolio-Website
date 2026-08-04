'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Torus, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function GyroRings() {
  const outerRef = useRef<THREE.Group>(null)
  const midRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (outerRef.current) outerRef.current.rotation.y += delta * 0.4
    if (midRef.current) midRef.current.rotation.x += delta * 0.6
    if (innerRef.current) innerRef.current.rotation.z += delta * 0.9
    if (coreRef.current) {
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  const orangeMat = { color: '#F03A00', metalness: 0.7, roughness: 0.2, emissive: '#F03A00', emissiveIntensity: 0.15 } as const
  const darkMat = { color: '#1a1814', metalness: 0.8, roughness: 0.15 } as const
  const accentMat = { color: '#EDEAE2', metalness: 0.5, roughness: 0.3 } as const

  return (
    <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.4}>
      {/* Outer ring */}
      <group ref={outerRef}>
        <Torus args={[0.82, 0.04, 16, 80]}>
          <meshStandardMaterial {...orangeMat} />
        </Torus>
        {/* Axis pegs */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.82, Math.sin(a) * 0.82, 0]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial {...orangeMat} emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>

      {/* Middle ring (tilted 90° on X) */}
      <group ref={midRef} rotation={[Math.PI / 2, 0, 0]}>
        <Torus args={[0.58, 0.032, 16, 80]}>
          <meshStandardMaterial {...accentMat} />
        </Torus>
      </group>

      {/* Inner ring (tilted 90° on Z) */}
      <group ref={innerRef} rotation={[0, 0, Math.PI / 2]}>
        <Torus args={[0.36, 0.028, 16, 80]}>
          <meshStandardMaterial {...darkMat} color="#555" metalness={0.9} roughness={0.1} />
        </Torus>
      </group>

      {/* Core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#0F0E0C" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Core accent dot */}
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#F03A00" emissive="#F03A00" emissiveIntensity={1.5} />
      </mesh>

      {/* Axis lines (X Y Z) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 1.7, 8]} />
        <meshStandardMaterial color="#F03A00" opacity={0.4} transparent />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.008, 0.008, 1.7, 8]} />
        <meshStandardMaterial color="#EDEAE2" opacity={0.3} transparent />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 1.7, 8]} />
        <meshStandardMaterial color="#EDEAE2" opacity={0.2} transparent />
      </mesh>
    </Float>
  )
}

export default function Gyroscope3D({ className = '' }: { className?: string }) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0.3, 2.8], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 3, 2]} intensity={1.3} />
      <directionalLight position={[-2, 1, -2]} intensity={0.4} />
      <pointLight position={[0, 0, 2]} intensity={0.5} color="#F03A00" />
      <GyroRings />
    </Canvas>
  )
}
