import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FONT } from '../tokens'

interface TooltipBubbleProps {
  text: string
  visible: boolean
  offsetY?: number
}

export default function TooltipBubble({ text, visible, offsetY = 4 }: TooltipBubbleProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="tooltip"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            bottom: `calc(100% + ${offsetY}px)`,
            left: '50%',
            x: '-50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 8,
            height: 34,
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#121212',
              fontFamily: FONT.body,
              lineHeight: '17px',
            }}>
              {text}
            </span>
          </div>
          {/* Arrow pointing down toward button */}
          <svg width="42" height="6" viewBox="0 0 42 6" fill="none" style={{ transform: 'rotate(180deg)', display: 'block' }}>
            <path fillRule="evenodd" clipRule="evenodd" d="M32 5.9991C31.1984 5.9991 30.3971 6.00303 29.5955 5.99449C28.8283 5.98618 27.9696 5.97441 27.223 5.69676C26.4165 5.39672 25.8825 4.87212 25.3453 4.25474C24.9586 3.81069 24.1989 2.86327 23.829 2.40583C23.5262 2.03078 22.9336 1.28946 22.61 0.930804C22.2026 0.479597 21.6991 1.00682e-06 20.9998 9.45678e-07C20.3004 8.84539e-07 19.7971 0.479597 19.39 0.930343C19.0664 1.28877 18.4738 2.03055 18.1708 2.40536C17.8014 2.8628 17.0416 3.81022 16.6547 4.25428C16.1165 4.87166 15.5835 5.39626 14.7773 5.6963C14.0304 5.97325 13.1715 5.98571 12.4048 5.99402C11.6029 6.00256 10.8016 5.99864 10 5.99864" fill="white"/>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
