'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence, useTransform } from 'framer-motion'
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import dynamic from 'next/dynamic'

const Drone3D     = dynamic(() => import('@/components/Drone3D'),     { ssr: false })
const Gyroscope3D = dynamic(() => import('@/components/Gyroscope3D'), { ssr: false })
const RobotCar3D  = dynamic(() => import('@/components/RobotCar3D'),  { ssr: false })

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const BG    = '#EDEAE2'
const INK   = '#0F0E0C'
const A     = '#F03A00'
const A_DIM = 'rgba(240,58,0,0.06)'
const A_MID = 'rgba(240,58,0,0.18)'
const MUTED  = 'rgba(15,14,12,0.42)'
const BORDER = 'rgba(15,14,12,0.08)'
const CARD   = 'rgba(15,14,12,0.03)'

// ─── Data ─────────────────────────────────────────────────────────────────────
type Project = {
  id: string; num: string; title: string; year: string
  type: string; tagline: string; description: string; why: string; stack: string[]
}

const projects: Project[] = [
  {
    id: 'drone', num: '01', title: 'Autonomous Farming Drone',
    year: '2026 – Present', type: 'ROBOTICS / HARDWARE', tagline: 'F450 Quad · PX4 · ROS 2',
    description: 'Built an F450 quadcopter from scratch — Pixhawk 6C Mini flight controller paired with an NVIDIA Jetson Orin Nano over MAVLink/UART. ROS 2 mission nodes handle GPS lawnmower surveys, georeferenced image capture, and autonomous replanning. A downward-facing IMX219 camera feeds a CV pipeline that maps crop stress to GPS coordinates.',
    why: 'Wanted to build something that flies itself and actually does useful work.',
    stack: ['PX4', 'ROS 2', 'MAVSDK', 'OpenCV', 'Python', 'C++', 'Jetson Orin Nano'],
  },
  {
    id: 'northstar', num: '02', title: 'Northstar',
    year: '2026', type: 'EMBEDDED / HARDWARE', tagline: 'Hiker Safety Pendant · Bare-Metal',
    description: 'Bare-metal firmware for a GPS/IMU wearable pendant on a Tuya T5 E1 MCU. Consumes a cloud-generated TripPlan over WiFi at the trailhead, then runs fully offline — trip-safety logic, onboard AMOLED display, geofencing. 3D-printed enclosure designed in Fusion 360. Submitted to HackStorm 2.0 (AIoT track).',
    why: 'Hikers die because their phone dies. Wanted to fix that with a dedicated device.',
    stack: ['C/C++', 'TuyaOpen SDK', 'Fusion 360', 'GPS/IMU', 'AMOLED', 'WiFi'],
  },
  {
    id: 'rc-car', num: '03', title: 'Autonomous RC Car',
    year: '2026', type: 'ROBOTICS', tagline: 'ROS 2 · Real-Time CV',
    description: 'Full ROS 2 Jazzy robotics stack on a Jetson Orin Nano deployed on a physical RC car. Custom node converts velocity commands into PWM signals via PCA9685 over I2C. OpenCV + cv_bridge pipeline handles real-time obstacle detection — validated in Gazebo, then shipped on hardware.',
    why: 'Simulation is easy. Getting it to work on physical hardware is the interesting part.',
    stack: ['ROS 2', 'OpenCV', 'Python', 'C++', 'Gazebo', 'PCA9685', 'Jetson'],
  },
]

const MARQUEE_ITEMS = [
  'Autonomous Systems', 'Embedded Hardware', 'ROS 2 & PX4',
  'Computer Vision', 'Bare-Metal Firmware', 'Full-Stack Dev',
  'UC Santa Cruz', 'Open to Internships',
]

// ─── Scramble ─────────────────────────────────────────────────────────────────
function useScramble(target: string, trigger: boolean) {
  const [text, setText] = useState(target)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!'
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!trigger) return
    let iteration = 0
    const total = target.length * 3
    const step = () => {
      setText(target.split('').map((letter, i) => {
        if (letter === ' ') return ' '
        if (i < Math.floor(iteration / 3)) return target[i]
        return chars[Math.floor(Math.random() * chars.length)]
      }).join(''))
      iteration++
      if (iteration <= total) rafRef.current = requestAnimationFrame(step)
      else setText(target)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [trigger, target])

  return text
}

// ─── Custom cursor ────────────────────────────────────────────────────────────
function CustomCursor() {
  const x = useMotionValue(-100); const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 35 })
  const sy = useSpring(y, { stiffness: 500, damping: 35 })
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    const over = (e: MouseEvent) => setHovered(!!(e.target as HTMLElement).closest('a,button,[data-cursor]'))
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over) }
  }, [x, y])

  return (
    <>
      <motion.div className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2"
        style={{ x, y, backgroundColor: A }} />
      <motion.div className="fixed top-0 left-0 rounded-full pointer-events-none z-[998] -translate-x-1/2 -translate-y-1/2"
        style={{ x: sx, y: sy, borderWidth: 1, borderStyle: 'solid' }}
        animate={{ width: hovered ? 52 : 30, height: hovered ? 52 : 30, borderColor: hovered ? `${A}99` : 'rgba(15,14,12,0.25)' }}
        transition={{ duration: 0.18 }} />
    </>
  )
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function Marquee({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="overflow-hidden py-3.5" style={{
      background: inverted ? A : 'transparent',
      borderTop: `1px solid ${inverted ? 'transparent' : BORDER}`,
      borderBottom: `1px solid ${inverted ? 'transparent' : BORDER}`,
    }}>
      <motion.div className="flex gap-10 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}>
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-10"
            style={{ color: inverted ? 'rgba(255,255,255,0.9)' : MUTED }}>
            {item}
            <span style={{ color: inverted ? 'rgba(255,255,255,0.4)' : `${A}` }}>·</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── 3D model map ─────────────────────────────────────────────────────────────
const PROJECT_3D: Record<string, React.ReactNode> = {
  drone:    <Suspense fallback={null}><Drone3D className="w-full h-full" /></Suspense>,
  northstar:<Suspense fallback={null}><Gyroscope3D className="w-full h-full" /></Suspense>,
  'rc-car': <Suspense fallback={null}><RobotCar3D className="w-full h-full" /></Suspense>,
}

// ─── Project row ──────────────────────────────────────────────────────────────
function ProjectRow({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0); const rotY = useMotionValue(0)
  const srX = useSpring(rotX, { stiffness: 220, damping: 28 })
  const srY = useSpring(rotY, { stiffness: 220, damping: 28 })

  const onTilt = (e: React.MouseEvent) => {
    if (!rowRef.current) return
    const r = rowRef.current.getBoundingClientRect()
    rotX.set(-((e.clientY - r.top) / r.height - 0.5) * 4)
    rotY.set(((e.clientX - r.left) / r.width - 0.5) * 4)
  }

  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      style={{ rotateX: srX, rotateY: srY, transformPerspective: 1200 }}
      onMouseMove={onTilt}
      onMouseLeave={() => { rotX.set(0); rotY.set(0) }}
    >
      <div
        className="group cursor-pointer border-t transition-all duration-300"
        style={{
          borderColor: BORDER,
          background: (hovered || open) ? A_DIM : 'transparent',
          borderLeft: `3px solid ${(hovered || open) ? A : 'transparent'}`,
          paddingLeft: (hovered || open) ? '16px' : '0px',
        }}
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-cursor
      >
        <div className="flex items-center gap-5 py-6 md:py-7 pr-2">
          <span
            className="text-[clamp(2.8rem,6vw,4.5rem)] font-black leading-none select-none shrink-0 transition-all duration-300"
            style={{ color: (hovered || open) ? `${A}50` : 'rgba(15,14,12,0.07)' }}
          >
            {project.num}
          </span>

          <div className="flex-1 flex flex-col md:flex-row md:items-center md:gap-6 min-w-0">
            <h3 className="text-xl md:text-2xl font-bold transition-colors duration-300"
              style={{ color: (hovered || open) ? A : INK }}>
              {project.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 md:mt-0 shrink-0">
              <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: MUTED }}>{project.type}</span>
              <span style={{ color: MUTED }} className="text-[9px]">·</span>
              <span className="text-[9px] font-mono" style={{ color: MUTED }}>{project.year}</span>
            </div>
          </div>

          <span className="hidden lg:block text-sm font-mono italic shrink-0" style={{ color: MUTED }}>
            {project.tagline}
          </span>

          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.22 }}
            className="ml-auto shrink-0" style={{ color: (hovered || open) ? A : 'rgba(15,14,12,0.28)' }}>
            <ArrowUpRight className="w-5 h-5" />
          </motion.div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pb-8 pl-[calc(clamp(2.8rem,6vw,4.5rem)+1.25rem)] grid md:grid-cols-2 gap-6">
                <div>
                  <p className="leading-relaxed mb-4" style={{ color: 'rgba(15,14,12,0.65)' }}>{project.description}</p>
                  <p className="text-sm italic mb-5" style={{ color: MUTED }}>"{project.why}"</p>
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map(tech => (
                      <span key={tech} className="px-3 py-1 text-xs font-mono rounded-full cursor-default transition-all duration-150"
                        style={{ background: A_DIM, border: `1px solid ${A_MID}`, color: A }}
                        onMouseEnter={e => { e.currentTarget.style.background = A; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = A_DIM; e.currentTarget.style.color = A }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                {/* 3D model */}
                <div className="h-56 md:h-72 rounded-xl overflow-hidden"
                  style={{ background: 'rgba(15,14,12,0.03)', border: `1px solid ${BORDER}` }}>
                  {PROJECT_3D[project.id]}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Contact card ─────────────────────────────────────────────────────────────
function ContactCard({ link, index, Icon }: {
  link: { label: string; value: string; href: string }
  index: number
  Icon: React.ElementType
}) {
  const [hov, setHov] = useState(false)
  return (
    <motion.a href={link.href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-4 p-5 rounded-xl"
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.1 }}
      animate={{
        borderColor: hov ? `${A}55` : 'rgba(255,255,255,0.08)',
        backgroundColor: hov ? `${A}14` : 'rgba(255,255,255,0.04)',
        y: hov ? -3 : 0,
      }}
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <motion.div className="shrink-0" animate={{ color: hov ? A : 'rgba(255,255,255,0.35)' }} transition={{ duration: 0.15 }}>
        <Icon className="w-5 h-5" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-mono uppercase tracking-widest block" style={{ color: 'rgba(255,255,255,0.3)' }}>{link.label}</span>
        <span className="text-sm truncate block text-white/70">{link.value}</span>
      </div>
      <motion.div className="shrink-0" animate={{ color: hov ? A : 'rgba(255,255,255,0.2)', x: hov ? 2 : 0, y: hov ? -2 : 0 }} transition={{ duration: 0.15 }}>
        <ArrowUpRight className="w-4 h-4" />
      </motion.div>
    </motion.a>
  )
}

// ─── Scroll progress bar ─────────────────────────────────────────────────────
function ScrollProgress() {
  const progress = useMotionValue(0)
  const scaleX = useSpring(progress, { stiffness: 200, damping: 40 })
  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      progress.set(el.scrollTop / (el.scrollHeight - el.clientHeight))
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [progress])
  return (
    <motion.div className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[1000]"
      style={{ scaleX, background: A }} />
  )
}

// ─── Magnetic button ──────────────────────────────────────────────────────────
function MagneticBtn({ children, onClick, className, style }: {
  children: React.ReactNode; onClick?: () => void
  className?: string; style?: React.CSSProperties
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [hov, setHov] = useState(false)
  const x = useMotionValue(0); const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 18 })
  const sy = useSpring(y, { stiffness: 180, damping: 18 })
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.38)
    y.set((e.clientY - r.top - r.height / 2) * 0.38)
  }
  return (
    <motion.button ref={ref} onClick={onClick} className={className}
      style={{ ...style, x: sx, y: sy, color: hov ? A : style?.color, transition: 'color 0.15s ease' }}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); x.set(0); y.set(0) }}>
      {children}
    </motion.button>
  )
}

// ─── Dot grid background ──────────────────────────────────────────────────────
function DotGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(15,14,12,0.1)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [time, setTime] = useState('')
  const [activeSection, setActiveSection] = useState('')
  const firstName = useScramble('MADHU', true)
  const lastName = useScramble('VIJAYA KUMAR', true)

  // Hero parallax
  const heroMX = useMotionValue(0.5); const heroMY = useMotionValue(0.5)
  const heroX  = useSpring(useTransform(heroMX, [0, 1], [-14, 14]), { stiffness: 55, damping: 18 })
  const heroY  = useSpring(useTransform(heroMY, [0, 1], [-7,   7]), { stiffness: 55, damping: 18 })
  const heroX2 = useSpring(useTransform(heroMX, [0, 1], [-6,   6]), { stiffness: 40, damping: 18 })
  const heroY2 = useSpring(useTransform(heroMY, [0, 1], [-3,   3]), { stiffness: 40, damping: 18 })

  // Active section tracker
  useEffect(() => {
    const ids = ['work', 'about', 'contact']
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) }),
      { rootMargin: '-40% 0px -40% 0px' }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    let timeout: ReturnType<typeof setTimeout> | null = null
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
    const schedule = () => {
      const ms = 60000 - (new Date().getSeconds() * 1000 + new Date().getMilliseconds())
      timeout = setTimeout(() => { update(); interval = setInterval(update, 60000) }, ms)
    }
    update(); schedule()
    return () => { if (timeout) clearTimeout(timeout); if (interval) clearInterval(interval) }
  }, [])

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen selection:bg-[#F03A0022]" style={{ background: BG, color: INK, cursor: 'none' }}>
      <ScrollProgress />
      <CustomCursor />

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: `${BG}E8`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-sm font-mono tracking-wider font-bold" style={{ color: INK }}>MVK</span>
          <div className="flex items-center gap-8">
            {['work', 'about', 'contact'].map(item => (
              <motion.button key={item} onClick={() => scrollTo(item)}
                className="relative text-sm font-mono tracking-wider uppercase px-3 py-1.5 rounded-lg"
                style={{ color: activeSection === item ? A : MUTED }}
                whileHover={{ color: A, backgroundColor: 'rgba(240,58,0,0.08)', scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}>
                {item}
                <motion.span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full block"
                  style={{ background: A }}
                  animate={{ width: activeSection === item ? 16 : 0, height: 2 }}
                  transition={{ duration: 0.25 }} />
              </motion.button>
            ))}
            <span className="text-sm font-mono" style={{ color: MUTED }}>{time}</span>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col justify-between pt-28 overflow-hidden"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          heroMX.set((e.clientX - r.left) / r.width)
          heroMY.set((e.clientY - r.top) / r.height)
        }}>
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"><DotGrid /></div>

        {/* 3D Drone — right side of hero */}
        <div className="absolute right-[8%] top-12 w-[42%] h-[90%] pointer-events-none hidden lg:block" style={{ zIndex: 1 }}>
          <Suspense fallback={null}>
            <Drone3D className="w-full h-full" />
          </Suspense>
        </div>

        {/* Status */}
        <div className="relative px-6 max-w-7xl mx-auto w-full" style={{ zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-[blinkDot_1.4s_infinite]" style={{ background: A }} />
            <span className="text-xs font-mono" style={{ color: MUTED }}>Available for internships — Summer 2027</span>
          </motion.div>
        </div>

        {/* Name block */}
        <div className="relative px-6 max-w-7xl mx-auto w-full mt-8" style={{ zIndex: 2 }}>
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden xl:block">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] -rotate-90 block whitespace-nowrap origin-center"
              style={{ color: MUTED }}>2026 — Portfolio</span>
          </div>

          <motion.div className="overflow-hidden w-full lg:w-[58%]" style={{ x: heroX, y: heroY }}>
            <motion.div initial={{ y: 130 }} animate={{ y: 0 }} transition={{ delay: 0.05, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>
              <h1 className="text-[clamp(4rem,11vw,10rem)] font-black leading-[0.82] tracking-tight uppercase" style={{ color: INK }}>
                {firstName}
              </h1>
            </motion.div>
          </motion.div>

          <motion.div className="overflow-hidden mt-1 w-full lg:w-[58%]" style={{ x: heroX2, y: heroY2 }}>
            <motion.div initial={{ y: 130 }} animate={{ y: 0 }} transition={{ delay: 0.12, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>
              <h1 className="text-[clamp(4rem,11vw,10rem)] font-black leading-[0.82] tracking-tight uppercase"
                style={{ WebkitTextStroke: `2px ${A}`, color: 'transparent' }}>
                {lastName}
              </h1>
            </motion.div>
          </motion.div>

          {/* Descriptor row */}
          <motion.div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
            <div className="flex items-start gap-4">
              <div className="w-px h-14 mt-1 shrink-0" style={{ background: A }} />
              <p className="text-base max-w-xs leading-relaxed" style={{ color: MUTED }}>
                Computer Engineering student at UC Santa Cruz. Robotics, autonomous systems, embedded
                hardware — I build things that work in the real world.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'rgba(15,14,12,0.2)' }}>Based in</span>
              <span className="text-sm font-mono" style={{ color: MUTED }}>Bay Area, CA</span>
              <span className="text-[10px] font-mono" style={{ color: 'rgba(15,14,12,0.2)' }}>37.33° N, 121.88° W</span>
            </div>
          </motion.div>
        </div>

        {/* Orange marquee strip */}
        <motion.div className="mt-16 relative" style={{ zIndex: 2 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          <Marquee inverted />
        </motion.div>
      </section>

      {/* ── Work ── */}
      <section id="work" className="px-6 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div className="mb-2" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: A }}>Selected Work</span>
                <div className="flex items-baseline gap-6 mt-1">
                  <h2 className="text-5xl md:text-7xl font-black uppercase" style={{ color: INK }}>Projects</h2>
                  <span className="text-[10px] font-mono mb-2" style={{ color: 'rgba(15,14,12,0.25)' }}>
                    {String(projects.length).padStart(2, '0')} items
                  </span>
                </div>
              </div>
              {/* Decorative bracket */}
              <div className="hidden md:block w-16 h-16 relative opacity-20" style={{ border: `1px solid ${INK}`, borderLeft: 'none', borderBottom: 'none' }} />
            </div>
            {/* Bold rule */}
            <div className="mt-6 h-px" style={{ background: `linear-gradient(to right, ${A}, transparent)` }} />
          </motion.div>

          <div>
            {projects.map((p, i) => <ProjectRow key={p.id} project={p} index={i} />)}
            <div className="border-t" style={{ borderColor: BORDER }} />
          </div>
        </div>
      </section>

      {/* ── Orange divider band ── */}
      <div style={{ background: A }} className="px-6 py-5 flex items-center justify-between overflow-hidden">
        <span className="text-white font-black uppercase text-sm tracking-widest">Robotics · Embedded · Full-Stack</span>
        <span className="text-white/50 text-xs font-mono">CE @ UCSC</span>
      </div>

      {/* ── About ── */}
      <section id="about" className="px-6 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-12">

            {/* Left */}
            <motion.div className="col-span-12 lg:col-span-5"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: A }}>About</span>
                <div className="flex-1 h-px" style={{ background: BORDER }} />
              </div>
              <h2 className="text-5xl md:text-6xl font-black uppercase leading-none mb-10" style={{ color: INK }}>
                The short
                <br />
                <span style={{ WebkitTextStroke: `2px ${A}`, color: 'transparent' }}>version.</span>
              </h2>

              <div className="space-y-5 text-[15px] leading-relaxed" style={{ color: MUTED }}>
                <p>Third-year CE student at UCSC. I specialize in robotics, autonomous systems, and embedded hardware-software integration.</p>
                <p>I like working close to the metal — bare-metal firmware, real-time sensor pipelines, MAVLink — as much as building full-stack apps.</p>
                <p>Not interested in building things just to build them. Every project starts with a question I actually want answered.</p>
              </div>

              <div className="mt-10 flex gap-3">
                {[
                  { icon: Github, label: 'GitHub', href: 'https://github.com/mvk05' },
                  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/madhu-vijaya-kumar/' },
                ].map(({ icon: Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{ background: CARD, border: `1px solid ${BORDER}`, color: MUTED }}
                    onMouseEnter={e => { e.currentTarget.style.background = A_DIM; e.currentTarget.style.borderColor = A_MID; e.currentTarget.style.color = A }}
                    onMouseLeave={e => { e.currentTarget.style.background = CARD as string; e.currentTarget.style.borderColor = BORDER as string; e.currentTarget.style.color = MUTED as string }}>
                    <Icon className="w-4 h-4" />{label}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Right */}
            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'School', value: 'UC Santa Cruz', sub: 'Computer Engineering' },
                  { label: 'Focus', value: 'Robotics', sub: '+ Embedded Systems' },
                  { label: 'Status', value: 'Open to', sub: 'Internships & Collabs' },
                  { label: 'Location', value: 'Bay Area', sub: 'California' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} className="p-5 rounded-xl transition-all group"
                    style={{ background: CARD, border: `1px solid ${BORDER}` }}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = A_MID; e.currentTarget.style.background = A_DIM }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER as string; e.currentTarget.style.background = CARD as string }}>
                    <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: MUTED }}>{stat.label}</span>
                    <p className="text-xl font-bold mt-2" style={{ color: INK }}>{stat.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>{stat.sub}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div className="mt-3 p-5 rounded-xl"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.4 }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: MUTED }}>Toolbox</span>
                  <div className="w-16 h-px" style={{ background: A }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['ROS 2', 'PX4', 'C/C++', 'Python', 'OpenCV', 'TypeScript', 'React', 'MAVSDK', 'Gazebo', 'Supabase', 'Git', 'Fusion 360'].map(skill => (
                    <span key={skill} className="px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-default"
                      style={{ background: 'rgba(15,14,12,0.05)', color: 'rgba(15,14,12,0.6)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = A_DIM; e.currentTarget.style.color = A }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,14,12,0.05)'; e.currentTarget.style.color = 'rgba(15,14,12,0.6)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="relative overflow-hidden px-6 py-24 md:py-32" style={{ background: INK }}>
        {/* Dot grid on dark */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots2" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(255,255,255,0.3)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots2)" />
        </svg>

        {/* Decorative circle */}
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ border: `1px solid ${A}30`, background: `radial-gradient(circle, ${A}12 0%, transparent 70%)` }} />

        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: A }}>Contact</span>
            <h2 className="text-[clamp(4rem,12vw,10rem)] font-black uppercase leading-none mt-2 mb-16 text-white">
              Let&apos;s <span style={{ WebkitTextStroke: `2px ${A}`, color: 'transparent' }}>talk.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: Mail, label: 'Email', value: 'madhu.vijayakumar01@gmail.com', href: 'mailto:madhu.vijayakumar01@gmail.com' },
                { icon: Github, label: 'GitHub', value: 'github.com/mvk05', href: 'https://github.com/mvk05' },
                { icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/madhu-vijaya-kumar', href: 'https://www.linkedin.com/in/madhu-vijaya-kumar/' },
              ].map((link, i) => {
                const Icon = link.icon
                return (
                  <ContactCard key={link.label} link={link} index={i} Icon={Icon} />
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8" style={{ background: INK, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-white/30">© 2026 MVK</span>
            <span className="text-white/10">·</span>
            <span className="text-xs font-mono text-white/30">Built from scratch</span>
          </div>
          <span className="text-xs font-mono text-white/15">Last updated Aug 2026</span>
        </div>
      </footer>
    </div>
  )
}
