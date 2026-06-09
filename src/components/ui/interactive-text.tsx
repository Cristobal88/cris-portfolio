import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface InteractiveWordProps {
  children: string
  icon?: LucideIcon
  color?: string
  preview?: string
}

const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

export function InteractiveWord({ children, icon: Icon, color = '#0044d4', preview }: InteractiveWordProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <span style={{ display: 'inline', position: 'relative' }}>
      <span
        className="iw"
        style={{ '--iw-color': color } as React.CSSProperties}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {Icon && <Icon size={15} strokeWidth={1.8} className="iw-icon" />}
        {children}
      </span>

      {canHover && preview && (
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 10px)',
                left: '50%',
                translateX: '-50%',
                width: 220,
                borderRadius: 14,
                overflow: 'hidden',
                background: '#ffffff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
                pointerEvents: 'none',
                zIndex: 50,
              }}
            >
              <img
                src={preview}
                alt=""
                style={{ display: 'block', width: '100%', height: 140, objectFit: 'cover' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </span>
  )
}
