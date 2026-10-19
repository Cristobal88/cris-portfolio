import React, { useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const TOTAL = 2.8

interface PlayerControlsProps {
  playhead: ReturnType<typeof useMotionValue<number>>
  isPlaying: boolean
  isDone: boolean
  onPlay: () => void
  onPause: () => void
  onReplay: () => void
  onSeek: (pct: number) => void
}

export default function PlayerControls({ playhead, isPlaying, isDone, onPlay, onPause, onReplay, onSeek }: PlayerControlsProps) {
  const barRef      = useRef<HTMLDivElement>(null)
  const isDragging  = useRef(false)
  const progressPct = useTransform(playhead, t => `${(t / TOTAL) * 100}%`)

  const getSeekPct = (clientX: number) => {
    if (!barRef.current) return 0
    const rect = barRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId); isDragging.current = true; onSeek(getSeekPct(e.clientX))
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => { if (isDragging.current) onSeek(getSeekPct(e.clientX)) }
  const handlePointerUp   = () => { isDragging.current = false }

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '12px 14px', minWidth: 220 }}>
      <div ref={barRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
        style={{ height: 20, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ position: 'relative', width: '100%', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
          <motion.div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: progressPct, background: '#fff', borderRadius: 99 }} />
          <motion.div style={{ position: 'absolute', top: '50%', left: progressPct, transform: 'translate(-50%, -50%)', width: 12, height: 12, background: '#fff', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
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
    <button onClick={onClick} title={title} style={{ width: primary ? 44 : 36, height: primary ? 44 : 36, borderRadius: '50%', border: primary ? 'none' : '1px solid rgba(255,255,255,0.2)', background: primary ? '#fff' : 'rgba(255,255,255,0.08)', color: primary ? '#111' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
      {children}
    </button>
  )
}

function PlayIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5l11 5.5-11 5.5V2.5z"/></svg> }
function PauseIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="4" height="12" rx="1"/><rect x="10" y="2" width="4" height="12" rx="1"/></svg> }
function ReplayIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8a6 6 0 1 1 1.5 4"/><polyline points="2 13 2 9 6 9"/></svg>
}
