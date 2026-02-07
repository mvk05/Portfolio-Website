'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? '')

  useEffect(() => {
    if (!activeTab && items[0]?.name) {
      setActiveTab(items[0].name)
    }
  }, [activeTab, items])

  return (
    <div className={cn('nav-bar', className)}>
      <div className="nav-bar-inner">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn('nav-bar-link', isActive && 'nav-bar-link-active')}
            >
              <span className="nav-bar-link-text">{item.name}</span>
              <span className="nav-bar-link-icon">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="nav-lamp"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }}
                >
                  <div className="nav-lamp-glow">
                    <div className="nav-lamp-glow-lg" />
                    <div className="nav-lamp-glow-md" />
                    <div className="nav-lamp-glow-sm" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
