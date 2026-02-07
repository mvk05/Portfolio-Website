'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import { SpiralAnimation } from '@/components/SpiralAnimation'

type Project = {
  id: string
  title: string
  year: string
  type: string
  tagline: string
  description: string
  why: string
  stack: string[]
  size: 'large' | 'medium'
}

const projects: Project[] = [
  {
    id: 'ideaspace',
    title: 'IdeaSpace',
    year: '2024',
    type: 'WEB APP',
    tagline: 'Voice → Diagrams',
    description:
      'I got tired of switching between talking through ideas and drawing them. So I built a whiteboard that listens. You speak, it draws. Real-time, no friction.',
    why: 'Because the best ideas happen mid-sentence, not mid-sketch.',
    stack: ['React', 'TypeScript', 'Supabase', 'Cloudflare Workers', 'OpenAI Realtime'],
    size: 'large'
  },
  {
    id: 'radio-tracker',
    title: 'Radio Ad Tracker',
    year: '2024',
    type: 'BACKEND',
    tagline: 'Audio Intelligence',
    description:
      'Records live radio streams 24/7, transcribes everything, and flags brand mentions. Built it to answer: "How often does X actually run ads?"',
    why: 'Curiosity about advertising patterns + wanting to learn audio processing.',
    stack: ['Python', 'Whisper', 'PostgreSQL', 'FFmpeg'],
    size: 'medium'
  },
  {
    id: 'embedded',
    title: 'Embedded Labs',
    year: '2023–24',
    type: 'HARDWARE',
    tagline: 'Bare Metal C',
    description:
      'Collection of microcontroller projects. Timers, ADC, state machines, custom display drivers. No HAL libraries—just registers and datasheets.',
    why: 'Wanted to understand what happens below the abstraction layers.',
    stack: ['C', 'STM32', 'ESP32', 'ARM'],
    size: 'medium'
  }
]

const navItems = ['work', 'about', 'contact']

export default function Home() {
  const [time, setTime] = useState('')
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [welcomeActive, setWelcomeActive] = useState(true)
  const [welcomeLeaving, setWelcomeLeaving] = useState(false)
  const [startVisible, setStartVisible] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    let timeout: ReturnType<typeof setTimeout> | null = null

    const update = () => {
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      )
    }

    const schedule = () => {
      const now = new Date()
      const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds())
      timeout = setTimeout(() => {
        update()
        interval = setInterval(update, 60000)
      }, msUntilNextMinute)
    }

    update()
    schedule()

    return () => {
      if (timeout) clearTimeout(timeout)
      if (interval) clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!welcomeActive) return
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [welcomeActive])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const reveal = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  }

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white selection:bg-blue-500/30">
      {welcomeActive && (
        <div
          className={`fixed inset-0 z-[60] bg-black transition-opacity duration-700 ${
            welcomeLeaving ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ pointerEvents: 'auto' }}
          onTransitionEnd={(event) => {
            if (event.propertyName !== 'opacity' || !welcomeLeaving) return
            setWelcomeActive(false)
            setWelcomeLeaving(false)
            setStartVisible(false)
          }}
        >
          <div className="absolute inset-0">
            <SpiralAnimation />
          </div>
          <div
            className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-[1500ms] ease-out ${
              startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              type="button"
              onClick={() => setWelcomeLeaving(true)}
              className="cursor-pointer text-white text-2xl tracking-[0.2em] uppercase font-extralight transition-all duration-700 hover:tracking-[0.3em] animate-pulse"
            >
              Enter
            </button>
          </div>
        </div>
      )}

      <div className={welcomeActive ? 'pointer-events-none select-none' : ''}>
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-sm font-mono tracking-wider">MVK</span>
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item)}
                className="text-sm font-mono tracking-wider uppercase hover:text-blue-400 transition-colors"
              >
                {item}
              </button>
            ))}
            <span className="text-sm font-mono text-white/40">{time}</span>
          </div>
        </div>
      </nav>

      <section className="min-h-screen flex flex-col justify-end px-6 pb-24 pt-32">
        <motion.div
          className="max-w-7xl mx-auto w-full"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16 flex items-center gap-4"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-[blinkDot_1.4s_infinite]" />
            <span className="text-sm font-mono text-white/50">
              Currently building <span className="text-blue-400">IdeaSpace</span> — shipping soon
            </span>
          </motion.div>

          <div className="grid grid-cols-12 gap-4">
            <motion.div
              className="col-span-12 lg:col-span-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-[clamp(3rem,12vw,9rem)] font-bold leading-[0.85] tracking-tight">
                Madhu
                <br />
                <span className="text-white/20">Vijaya Kumar</span>
              </h1>
            </motion.div>

            <motion.div
              className="col-span-12 lg:col-span-4 lg:col-start-9 flex flex-col justify-end -mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <img
                src="/IMG_1009.jpg"
                alt="Madhu Vijaya Kumar"
                className="mb-6 w-[68.75%] max-w-md mx-auto rounded-2xl object-cover object-[50%_75%] aspect-[9/16] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
              />
              <p className="text-lg text-white/60 leading-relaxed max-w-md mx-auto">
                Computer Engineering student at UC Santa Cruz. I build things across the stack—web
                apps, embedded systems, whatever solves the problem.
              </p>
            </motion.div>
          </div>

          <motion.div
            className="mt-24 h-px bg-gradient-to-r from-blue-500 via-blue-500/50 to-transparent"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
          />

          <motion.div
            className="mt-8 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
              Full-stack + Embedded
            </span>
            <span className="text-xs font-mono text-white/30">37.3387° N, 121.8853° W</span>
          </motion.div>
        </motion.div>
      </section>

      <section id="work" className="px-6 py-32">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                Selected Work
              </span>
              <h2 className="text-5xl md:text-6xl font-bold mt-2">Projects</h2>
            </div>
            <span className="text-xs font-mono text-white/30">03 items</span>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                className={`
                  relative group cursor-pointer overflow-hidden
                  ${project.size === 'large' ? 'col-span-12 lg:col-span-8 row-span-2' : 'col-span-12 lg:col-span-4'}
                  ${i === 2 ? 'lg:col-start-9 lg:row-start-1' : ''}
                `}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div
                  className={`
                  h-full min-h-[300px] ${project.size === 'large' ? 'lg:min-h-[500px]' : ''}
                  bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8
                  hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-500
                  flex flex-col justify-between
                `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                        {project.type}
                      </span>
                      <span className="text-[10px] font-mono text-white/30 ml-4">
                        {project.year}
                      </span>
                    </div>
                    <motion.div
                      animate={{
                        x: hoveredProject === project.id ? 0 : 10,
                        opacity: hoveredProject === project.id ? 1 : 0
                      }}
                    >
                      <ArrowUpRight className="w-5 h-5 text-blue-400" />
                    </motion.div>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-white/40 font-mono mb-4">{project.tagline}</p>

                    <p className="text-white/60 leading-relaxed mb-4 max-w-lg">
                      {project.description}
                    </p>

                    {project.size === 'large' && (
                      <p className="text-sm text-white/40 italic mb-6">"{project.why}"</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {project.stack.slice(0, project.size === 'large' ? 5 : 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-xs font-mono bg-white/[0.05] rounded-full text-white/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-4 right-4 w-px h-12 bg-gradient-to-b from-blue-500/50 to-transparent" />
                    <div className="absolute top-4 right-4 w-12 h-px bg-gradient-to-l from-blue-500/50 to-transparent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="about" className="px-6 py-32">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-5">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">About</span>
              <h2 className="text-5xl md:text-6xl font-bold mt-2 mb-8">
                The short<br />version.
              </h2>

              <div className="h-px bg-white/10 my-8" />

              <div className="space-y-6 text-white/60 leading-relaxed">
                <p>
                  Third-year CE student at UCSC. I spend most of my time building software—sometimes
                  for class, mostly for fun.
                </p>
                <p>
                  I like working close to the metal (embedded, firmware) as much as building web
                  apps. The problems are different but the thinking is similar.
                </p>
                <p>
                  Not interested in building things just to build them. Every project starts with a
                  question I actually want answered.
                </p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'School', value: 'UC Santa Cruz', sub: 'Computer Engineering' },
                  { label: 'Focus', value: 'Full-Stack', sub: '+ Embedded Systems' },
                  { label: 'Status', value: 'Open to', sub: 'Internships, Collabs' },
                  { label: 'Location', value: 'Bay Area', sub: 'California' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                      {stat.label}
                    </span>
                    <p className="text-xl font-semibold mt-2">{stat.value}</p>
                    <p className="text-sm text-white/40">{stat.sub}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  Toolbox
                </span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    'TypeScript',
                    'Python',
                    'C',
                    'React',
                    'Node.js',
                    'Supabase',
                    'STM32',
                    'Docker',
                    'Git'
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 text-sm bg-white/[0.05] rounded-lg text-white/70 hover:bg-blue-500/20 hover:text-blue-400 transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="contact" className="px-6 py-32">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">Contact</span>
              <h2 className="text-5xl md:text-7xl font-bold mt-2">
                Let's<br />
                <span className="text-white/20">Connect.</span>
              </h2>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col justify-end">
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Email', value: 'madhu.vijayakumar01@gmail.com', href: 'mailto:madhu.vijayakumar01@gmail.com' },
                  { icon: Github, label: 'GitHub', value: 'github.com/mvk05', href: 'https://github.com/mvk05' },
                  {
                    icon: Linkedin,
                    label: 'LinkedIn',
                    value: 'linkedin.com/in/madhu-vijaya-kumar',
                    href: 'https://www.linkedin.com/in/madhu-vijaya-kumar/'
                  }
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:border-blue-500/30 hover:bg-white/[0.04] transition-all"
                  >
                    <link.icon className="w-5 h-5 text-white/40 group-hover:text-blue-400 transition-colors" />
                    <div className="flex-1">
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">
                        {link.label}
                      </span>
                      <span className="text-white/70 group-hover:text-white transition-colors">
                        {link.value}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="px-6 py-12 border-t border-white/[0.05]">
        <motion.div
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-white/30">© 2024 MVK</span>
            <span className="text-white/10">·</span>
            <span className="text-sm font-mono text-white/30">Built from scratch</span>
          </div>
          <span className="text-sm font-mono text-white/20">Last updated Feb 2024</span>
        </motion.div>
      </footer>
      </div>
    </div>
  )
}
