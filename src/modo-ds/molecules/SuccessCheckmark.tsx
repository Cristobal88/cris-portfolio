import React, { useEffect } from 'react'
import { motion, animate, useMotionValue, useReducedMotion, useTransform, MotionValue } from 'framer-motion'

const CIRC = 2 * Math.PI * 28 // ≈ 175.93

interface SuccessCheckmarkProps {
  size?: number
  color?: string
  playhead?: MotionValue<number>
  segStart?: number
  segEnd?: number
  ckSegStart?: number
  ckSegEnd?: number
  autoPlay?: boolean
  delay?: number
}

function easeOutLocal(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}
function segLocal(t: number, start: number, end: number): number {
  return easeOutLocal(Math.max(0, Math.min(1, (t - start) / (end - start))))
}

export default function SuccessCheckmark({
  size = 48,
  color = 'rgba(255,255,255,0.9)',
  playhead,
  segStart = 0.20,
  segEnd = 0.90,
  ckSegStart = 0.75,
  ckSegEnd = 1.15,
  autoPlay = false,
  delay = 0,
}: SuccessCheckmarkProps) {
  const rm = useReducedMotion()

  // ── Mode 1: externally driven via playhead MotionValue ──
  // Always call hooks unconditionally; use fallback only when playhead is absent
  const fallbackMV = useMotionValue(0)
  const circleOffsetDerived = useTransform(
    playhead ?? fallbackMV,
    (t: number) => CIRC * (1 - segLocal(t, segStart, segEnd))
  )
  const checkmarkOffsetDerived = useTransform(
    playhead ?? fallbackMV,
    (t: number) => 40 * (1 - segLocal(t, ckSegStart, ckSegEnd))
  )

  // ── Mode 2: self-animate on mount (autoPlay) ──
  const circOff   = useMotionValue(CIRC)
  const ckOff     = useMotionValue(40)
  const wOpacity  = useMotionValue(autoPlay ? 0 : 1)
  const wY        = useMotionValue(autoPlay ? 12 : 0)

  useEffect(() => {
    if (!autoPlay) return
    if (rm) {
      wOpacity.set(1); wY.set(0); circOff.set(0); ckOff.set(0)
      return
    }
    const t = delay
    animate(wOpacity, 1, { duration: 0.3, delay: t })
    animate(wY, 0, { duration: 0.5, ease: 'easeOut', delay: t })
    animate(circOff, 0, { duration: 0.7, ease: 'easeInOut', delay: t })
    animate(ckOff, 0, { duration: 0.4, ease: 'easeInOut', delay: t + 0.55 })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (playhead) {
    // Mode 1 — driven by external playhead
    return (
      <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
        <motion.circle
          cx="36" cy="36" r="28"
          stroke={color} strokeWidth="2" fill="none"
          strokeDasharray={CIRC}
          style={{
            strokeDashoffset: circleOffsetDerived,
            rotate: -90,
            transformOrigin: '36px 36px',
          }}
        />
        <motion.path
          d="M22 36l10 10 18-18"
          stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" fill="none"
          strokeDasharray="40"
          style={{ strokeDashoffset: checkmarkOffsetDerived }}
        />
      </svg>
    )
  }

  // Mode 2 — autoPlay: self-animates with its own wrapper opacity/Y
  return (
    <motion.div style={{ opacity: wOpacity, y: wY }}>
      <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
        <motion.circle
          cx="36" cy="36" r="28"
          stroke={color} strokeWidth="2" fill="none"
          strokeDasharray={CIRC}
          style={{
            strokeDashoffset: circOff,
            rotate: -90,
            transformOrigin: '36px 36px',
          }}
        />
        <motion.path
          d="M22 36l10 10 18-18"
          stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" fill="none"
          strokeDasharray="40"
          style={{ strokeDashoffset: ckOff }}
        />
      </svg>
    </motion.div>
  )
}
