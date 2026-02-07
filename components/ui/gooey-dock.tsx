'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GooeyDockItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}

interface GooeyDockProps {
  items: GooeyDockItem[]
  className?: string
}

export function GooeyDock({ items, className }: GooeyDockProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className={cn('gooey-dock', className)}>
      <svg className="gooey-filter" aria-hidden>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 20 -5"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="gooey-dock-inner">
        {items.map((item, i) => {
          const Icon = item.icon
          const isHovered = hovered === i

          return (
            <div key={item.label} className="gooey-item">
              <motion.a
                href={item.href}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                animate={{ scale: isHovered ? 1.2 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="gooey-link"
              >
                <motion.span
                  className="gooey-blob"
                  style={{ filter: 'url(#goo)' }}
                  animate={{ scale: isHovered ? 1.8 : 1, opacity: isHovered ? 1 : 0.6 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                />
                <span className="gooey-button" aria-label={item.label}>
                  <Icon className="gooey-icon" />
                </span>
              </motion.a>
              <span className={cn('gooey-tooltip', isHovered && 'is-visible')}>{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
