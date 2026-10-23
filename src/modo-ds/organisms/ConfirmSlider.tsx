import React, { useEffect, useRef } from 'react'
import { motion, animate, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'

const GREEN = '#008859'

// ── Confirm screen slider ────────────────────────────────────────
// MODO DS Slider spec (node 75024:198604 / 15931:26918):
//
// Enabled (resting):
//   • Base: #ececec (gray08) full track
//   • 2º cap: #d0d0d0 at 30% opacity, top 70px
//   • Thumb: #008859, bottom 70px
//
// Swipe (dragging):
//   • Base transitions to #33a07a (primary/default80)
//   • 2º cap fades out
//   • 3º tint 1: rgba(255,255,255,0.12), fixed bottom 170px
//   • 3º tint 2: rgba(255,255,255,0.12), fixed bottom 120px → 2 layers = lighter
//   • 3º anchor: #008859 fixed bottom 70px (origin marker, revealed as thumb rises)
//   • Thumb: #008859 moves upward
//
// Ellipse 228 (attract ring): 78px, 4px overflow → outer wrapper has no overflow:hidden

interface ConfirmSliderProps {
  complete: boolean
  autoPlay?: boolean
  onComplete: () => void
}

export default function ConfirmSlider({ complete, autoPlay, onComplete }: ConfirmSliderProps) {
  const y = useMotionValue(0)
  const W = 70          // track width = thumb diameter
  const TRACK_H = 268   // per DS spec
  const TRAVEL = TRACK_H - W  // 198px of travel
  const RING = W + 8    // 78px — Ellipse 228, 4px bigger on each side

  // Auto-animate slider to the top when autoPlay is true
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
  useEffect(() => {
    if (!autoPlay || complete) return
    const id = setTimeout(() => {
      animate(y, -TRAVEL, {
        type: 'spring', stiffness: 260, damping: 24,
        onComplete: () => onCompleteRef.current(),
      })
    }, 900)
    return () => clearTimeout(id)
  }, [autoPlay]) // eslint-disable-line react-hooks/exhaustive-deps

  // Base color: gray → #33a07a (primary/default80) in first 20px of drag
  const trackBg = useTransform(y, [0, -20], ['#ececec', '#33a07a'])
  // Gray cap: fades out as drag starts
  const grayCapOpacity = useTransform(y, [0, -20], [0.3, 0])
  // Swipe layers (white tints + bottom anchor): fade in as drag starts
  const swipeOpacity = useTransform(y, [0, -15], [0, 1])

  const handleDragEnd = () => {
    if (y.get() <= -(TRAVEL - 8)) {
      // Snap to top and immediately trigger — loading screen covers the slider
      animate(y, -TRAVEL, { type: 'spring', stiffness: 400, damping: 30 })
      onComplete()
    } else {
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  return (
    // Outer wrapper — no overflow:hidden so Ellipse 228 ring bleeds 4px outside
    <div style={{ position: 'relative', width: RING, height: TRACK_H + 8, flexShrink: 0 }}>

      {/* Ellipse 228 — calm pulsating attract ring at thumb resting position */}
      <AnimatePresence>
        {!complete && (
          <motion.div
            key="pulse-ring"
            animate={{ scale: [1, 1.10, 1], opacity: [0.45, 0.10, 0.45] }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', bottom: 0, left: 0,
              width: RING, height: RING, borderRadius: '50%',
              background: 'rgba(0,136,89,0.22)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Inner track — overflow:hidden clips all layers */}
      <div style={{
        position: 'absolute', top: 4, left: 4,
        width: W, height: TRACK_H,
        borderRadius: W / 2, overflow: 'hidden',
      }}>
        {/* 1. Base — gray → #33a07a on drag */}
        <motion.div style={{
          position: 'absolute', inset: 0,
          background: trackBg, borderRadius: W / 2,
        }} />

        {/* 2. Gray cap (2º) — top 70px, fades out on drag */}
        <motion.div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: W, background: '#d0d0d0',
          opacity: grayCapOpacity, borderRadius: W / 2,
        }} />

        {/* 3. White tint 1 (3º) — fixed bottom 170px, rgba(255,255,255,0.12) */}
        <motion.div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 170, background: 'rgba(255,255,255,0.12)',
          borderRadius: W / 2, opacity: swipeOpacity,
        }} />

        {/* 4. White tint 2 (3º) — fixed bottom 120px, rgba(255,255,255,0.12) */}
        {/* Stacks with tint 1 → even lighter bottom band */}
        <motion.div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 120, background: 'rgba(255,255,255,0.12)',
          borderRadius: W / 2, opacity: swipeOpacity,
        }} />

        {/* 5. Bottom anchor (3º) — #008859 fixed at bottom, revealed as thumb rises */}
        <motion.div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: W, background: GREEN,
          borderRadius: W / 2, opacity: swipeOpacity,
        }} />

        {/* 6. Thumb — draggable, disabled when complete (loading screen covers immediately) */}
        <motion.div
          drag={complete ? false : 'y'}
          dragConstraints={{ top: -TRAVEL, bottom: 0 }}
          dragElastic={0.04}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{
            position: 'absolute', bottom: 0, left: 0,
            width: W, height: W, borderRadius: '50%',
            background: GREEN,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: complete ? 'default' : 'grab',
            y, zIndex: 2, touchAction: 'none',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 18V6M6 12l6-6 6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
