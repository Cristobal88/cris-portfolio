import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'

const GREEN      = '#008859'
const GREEN_DARK = 'rgba(18,18,18,0.2)'
const TOTAL      = 1.4
const CIRC       = 2 * Math.PI * 28

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function seg(t: number, start: number, end: number): number {
  const raw = Math.max(0, Math.min(1, (t - start) / (end - start)))
  return easeOut(raw)
}

export default function PropiDemo() {
  const rm = useReducedMotion()
  const playhead = useMotionValue(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDone, setIsDone]       = useState(false)
  const rafRef      = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef<number | undefined>(undefined)

  // Animated values
  const ckOpacity    = useTransform(playhead, t => seg(t, 0.10, 0.50))
  const ckY          = useTransform(playhead, t => 12 * (1 - seg(t, 0.10, 0.50)))
  const merOpacity   = useTransform(playhead, t => seg(t, 0.30, 0.70))
  const merY         = useTransform(playhead, t => 12 * (1 - seg(t, 0.30, 0.70)))
  const promoOpacity = useTransform(playhead, t => seg(t, 0.45, 0.85))
  const promoY       = useTransform(playhead, t => 12 * (1 - seg(t, 0.45, 0.85)))
  const cardOpacity  = useTransform(playhead, t => seg(t, 0.55, 0.95))
  const cardY        = useTransform(playhead, t => 12 * (1 - seg(t, 0.55, 0.95)))
  const btnOpacity   = useTransform(playhead, t => seg(t, 0.65, 1.05))
  const btnY         = useTransform(playhead, t => 12 * (1 - seg(t, 0.65, 1.05)))
  const circleOffset    = useTransform(playhead, t => CIRC * (1 - seg(t, 0.20, 0.90)))
  const checkmarkOffset = useTransform(playhead, t => 40  * (1 - seg(t, 0.75, 1.15)))

  const stopRAF = () => {
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
  }

  const seek = useCallback((pct: number) => {
    const clamped = Math.max(0, Math.min(1, pct))
    playhead.set(clamped * TOTAL)
    setIsDone(clamped >= 1)
  }, [playhead])

  const play   = useCallback(() => {
    if (playhead.get() >= TOTAL) { playhead.set(0); setIsDone(false) }
    setIsPlaying(true)
  }, [playhead])
  const pause  = useCallback(() => setIsPlaying(false), [])
  const replay = useCallback(() => { playhead.set(0); setIsDone(false); setIsPlaying(true) }, [playhead])

  useEffect(() => {
    if (!isPlaying) { stopRAF(); return }
    lastTimeRef.current = undefined
    const tick = (now: number) => {
      if (lastTimeRef.current === undefined) lastTimeRef.current = now
      const dt   = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now
      const next = playhead.get() + dt
      if (next >= TOTAL) { playhead.set(TOTAL); setIsPlaying(false); setIsDone(true); return }
      playhead.set(next)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return stopRAF
  }, [isPlaying, playhead])

  useEffect(() => {
    if (rm) { playhead.set(TOTAL); setIsDone(true); return }
    const id = setTimeout(() => setIsPlaying(true), 150)
    return () => clearTimeout(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: "'Red Hat Display', sans-serif",
    }}>
      {/* Phone shell */}
      <div style={{
        width: 390, height: 844,
        borderRadius: 50,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 48px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
        background: GREEN,
        flexShrink: 0,
      }}>
        {/* Status bar */}
        <div style={{ padding: '14px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px' }}>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusSignal /><StatusWifi /><StatusBattery />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 44px)' }}>

          {/* Checkmark */}
          <motion.div style={{ opacity: ckOpacity, y: ckY, display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <motion.circle
                cx="36" cy="36" r="28"
                stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none"
                strokeDasharray={CIRC}
                style={{ strokeDashoffset: circleOffset, rotate: -90, transformOrigin: '36px 36px' }}
              />
              <motion.path
                d="M22 36l10 10 18-18"
                stroke="rgba(255,255,255,0.9)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" fill="none"
                strokeDasharray="40"
                style={{ strokeDashoffset: checkmarkOffset }}
              />
            </svg>
          </motion.div>

          {/* Merchant row */}
          <motion.div style={{ opacity: merOpacity, y: merY, marginTop: 36 }}>
            {/* Avatar + text + mascot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src="/logos/tostado.png" alt="Tostado" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 400, lineHeight: '22px' }}>Pagaste a</div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px' }}>Tostado</div>
              </div>
              {/* Propi mascot */}
              <img src="/logos/propi-mascot.png" alt="" style={{ width: 62, height: 44, objectFit: 'contain', flexShrink: 0 }} />
            </div>

            {/* Divider */}
            <div style={{ height: '0.5px', background: 'rgba(245,245,245,0.7)', margin: '16px 0' }} />

            {/* Total amount */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px' }}>Total</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: '28px' }}>$</span>
                <span style={{ color: '#fff', fontSize: 32, fontWeight: 500, lineHeight: '44px' }}>15.500</span>
              </div>
            </div>
          </motion.div>

          {/* Te devolveremos banner */}
          <motion.div style={{ opacity: promoOpacity, y: promoY, marginTop: 16 }}>
            <div style={{
              background: GREEN_DARK,
              borderRadius: '20px 0px 18px 20px',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 48,
            }}>
              <img src="/logos/rewards-icon.svg" alt="" style={{ width: 32, height: 32, flexShrink: 0 }} />
              <span style={{
                flex: 1,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: '16px',
                fontFamily: "'Quicksand', sans-serif",
              }}>Te devolveremos</span>
              <div style={{
                background: '#FFC738',
                borderRadius: '15px 0px 15px 15px',
                padding: '0 12px',
                height: 32,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}>
                <span style={{
                  color: '#121212',
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: '16px',
                  fontFamily: "'Quicksand', sans-serif",
                }}>$4.500</span>
              </div>
            </div>
          </motion.div>

          <div style={{ flex: 1 }} />

          {/* Card selector */}
          <motion.div style={{ opacity: cardOpacity, y: cardY }}>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px', marginBottom: 8 }}>
              Con tu tarjeta
            </div>
            <div style={{
              border: '0.5px solid #f8f8f8',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingRight: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 24, paddingTop: 12, paddingBottom: 12 }}>
                {/* VISA circle */}
                <div style={{ width: 36, height: 36, position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    position: 'absolute',
                    top: 6, right: 5, bottom: 4, left: 5,
                    background: '#fff',
                    border: '1px solid #ececec',
                    borderRadius: 100,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img
                      src="/logos/visa-wordmark.svg"
                      alt="Visa"
                      style={{ width: '90%', transform: 'scaleX(-1) rotate(180deg)' }}
                    />
                  </div>
                </div>
                <span style={{ color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px' }}>
                  Santander Crédito · 1234
                </span>
              </div>
            </div>
          </motion.div>

          {/* Bottom buttons */}
          <motion.div style={{ opacity: btnOpacity, y: btnY, marginTop: 16, paddingBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button style={{
                flex: 1, background: GREEN_DARK, border: 'none',
                borderRadius: 20, padding: '10px 0', color: '#fff',
                fontSize: 16, fontWeight: 500, lineHeight: '22px',
                fontFamily: "'Red Hat Display', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, cursor: 'pointer',
              }}>
                <ReceiptIcon /><span style={{ marginLeft: 0 }}>Comprobante</span>
              </button>
              <button style={{
                flex: 1, background: GREEN_DARK, border: 'none',
                borderRadius: 20, padding: '10px 0', color: '#fff',
                fontSize: 16, fontWeight: 500, lineHeight: '22px',
                fontFamily: "'Red Hat Display', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, cursor: 'pointer',
              }}>
                <MoneyIcon /><span style={{ marginLeft: 0 }}>Propina</span>
              </button>
            </div>
            <button style={{
              width: '100%', background: 'transparent', border: 'none',
              padding: '9px 0', color: '#fff', fontSize: 16, fontWeight: 500,
              lineHeight: '22px', fontFamily: "'Red Hat Display', sans-serif",
              cursor: 'pointer', textAlign: 'center',
            }}>
              Ir al Inicio
            </button>
          </motion.div>
        </div>
      </div>

      <PlayerControls
        playhead={playhead}
        isPlaying={isPlaying}
        isDone={isDone}
        onPlay={play}
        onPause={pause}
        onReplay={replay}
        onSeek={seek}
      />
    </div>
  )
}

// ── Player controls ──────────────────────────────────────────────
interface PlayerControlsProps {
  playhead: ReturnType<typeof useMotionValue<number>>
  isPlaying: boolean
  isDone: boolean
  onPlay: () => void
  onPause: () => void
  onReplay: () => void
  onSeek: (pct: number) => void
}

function PlayerControls({ playhead, isPlaying, isDone, onPlay, onPause, onReplay, onSeek }: PlayerControlsProps) {
  const barRef      = useRef<HTMLDivElement>(null)
  const isDragging  = useRef(false)
  const progressPct = useTransform(playhead, t => `${(t / TOTAL) * 100}%`)

  const getSeekPct = (clientX: number) => {
    if (!barRef.current) return 0
    const rect = barRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    isDragging.current = true
    onSeek(getSeekPct(e.clientX))
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    onSeek(getSeekPct(e.clientX))
  }
  const handlePointerUp = () => { isDragging.current = false }

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28,
      display: 'flex', flexDirection: 'column', gap: 10,
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 16, padding: '12px 14px', minWidth: 220,
    }}>
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ height: 20, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ position: 'relative', width: '100%', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
          <motion.div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: progressPct, background: '#fff', borderRadius: 99 }} />
          <motion.div style={{
            position: 'absolute', top: '50%', left: progressPct,
            transform: 'translate(-50%, -50%)',
            width: 12, height: 12, background: '#fff', borderRadius: '50%',
            boxShadow: '0 0 0 2px rgba(255,255,255,0.3)', pointerEvents: 'none',
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <CtrlBtn onClick={onReplay} title="Replay"><ReplayIcon /></CtrlBtn>
        <CtrlBtn onClick={isPlaying ? onPause : onPlay} title={isPlaying ? 'Pause' : 'Play'} primary>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </CtrlBtn>
      </div>
    </div>
  )
}

function CtrlBtn({ onClick, title, primary, children }: { onClick: () => void; title: string; primary?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick} title={title}
      style={{
        width: primary ? 44 : 36, height: primary ? 44 : 36,
        borderRadius: '50%',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.2)',
        background: primary ? '#fff' : 'rgba(255,255,255,0.08)',
        color: primary ? '#111' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {children}
    </button>
  )
}

// ── Icons ────────────────────────────────────────────────────────
function PlayIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5l11 5.5-11 5.5V2.5z" /></svg>
}
function PauseIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="4" height="12" rx="1" /><rect x="10" y="2" width="4" height="12" rx="1" /></svg>
}
function ReplayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8a6 6 0 1 1 1.5 4" /><polyline points="2 13 2 9 6 9" />
    </svg>
  )
}
function ReceiptIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="0" fill="none"/>
      <path d="M11 8v20l2.5-1.5L16 28l2.5-1.5L21 28l2.5-1.5L26 28V8l-2.5 1.5L21 8l-2.5 1.5L16 8l-2.5 1.5L11 8z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="14" y1="14" x2="22" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="18" x2="22" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function MoneyIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="8" stroke="white" strokeWidth="1.5"/>
      <path d="M18 13v10M15.5 15.5h3.75a1.75 1.75 0 1 1 0 3.5H16.25a1.75 1.75 0 1 0 0 3.5H21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ── Status bar icons ─────────────────────────────────────────────
function StatusSignal() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
      {[2, 5, 8, 11, 14].map((x, i) => (
        <rect key={x} x={x} y={12 - (i + 1) * 2.2} width="2" height={(i + 1) * 2.2} rx="0.5" fill="white" opacity={i < 4 ? 1 : 0.3} />
      ))}
    </svg>
  )
}
function StatusWifi() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
      <path d="M8 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
      <path d="M3.5 6.5a6.5 6.5 0 0 1 9 0" strokeWidth="1.5" stroke="white" fill="none" strokeLinecap="round" />
      <path d="M1 4a9.5 9.5 0 0 1 14 0" strokeWidth="1.5" stroke="white" fill="none" strokeLinecap="round" />
    </svg>
  )
}
function StatusBattery() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.35" />
      <rect x="2" y="2" width="17" height="8" rx="2" fill="white" />
      <path d="M23 4v4a2 2 0 0 0 0-4z" fill="white" fillOpacity="0.4" />
    </svg>
  )
}
