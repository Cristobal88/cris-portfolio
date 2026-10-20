import * as React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface AvatarItem {
  src: string
  alt?: string
  label?: string
  bg?: string
  href?: string
}

export interface AvatarGroupProps {
  avatars: AvatarItem[]
  maxVisible?: number
  size?: number
  overlap?: number
}

const AvatarGroup = ({
  avatars,
  maxVisible = 5,
  size = 40,
  overlap = 14,
}: AvatarGroupProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const visibleAvatars = avatars.slice(0, maxVisible)
  const extraCount = avatars.length - maxVisible

  return (
    <div className="flex items-center">
      <div className="flex" style={{ paddingLeft: overlap }}>
        {visibleAvatars.map((avatar, idx) => {
          const isHovered = hoveredIdx === idx
          const wrapper = (
            <div
              key={idx}
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                border: '2px solid rgba(0,0,0,0.06)',
                background: avatar.bg ?? '#f0f0f0',
                zIndex: isHovered ? 100 : visibleAvatars.length - idx,
                marginLeft: -overlap,
                position: 'relative',
                flexShrink: 0,
                transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
                transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 8px 20px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.10)',
                cursor: avatar.href ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'visible',
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <img
                src={avatar.src}
                alt={avatar.alt ?? `Avatar ${idx + 1}`}
                width={size * 0.55}
                height={size * 0.55}
                style={{
                  display: 'block',
                  width: size * 0.55,
                  height: size * 0.55,
                  objectFit: 'contain',
                  borderRadius: 0,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
                draggable={false}
              />
              <AnimatePresence>
                {isHovered && avatar.label && (
                  <motion.div
                    key="tooltip"
                    initial={{ x: '-50%', y: 6, opacity: 0, scale: 0.8 }}
                    animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
                    exit={{ x: '-50%', y: 6, opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                    style={{
                      position: 'absolute',
                      top: -(size * 0.75),
                      left: '50%',
                      background: '#0d0d0d',
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      fontFamily: 'Barlow, sans-serif',
                      padding: '3px 8px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 200,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {avatar.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )

          return avatar.href ? (
            <a key={idx} href={avatar.href} target="_blank" rel="noopener noreferrer" style={{ display: 'contents' }}>
              {wrapper}
            </a>
          ) : (
            <React.Fragment key={idx}>{wrapper}</React.Fragment>
          )
        })}
        {extraCount > 0 && (
          <div
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.08)',
              border: '2px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: -overlap,
              zIndex: 0,
              fontSize: size * 0.3,
              fontWeight: 600,
              color: 'rgba(0,0,0,0.45)',
              fontFamily: 'Barlow, sans-serif',
              flexShrink: 0,
            }}
          >
            +{extraCount}
          </div>
        )}
      </div>
    </div>
  )
}

export { AvatarGroup }
export default AvatarGroup
