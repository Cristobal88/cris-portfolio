import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, useTransform, useReducedMotion, AnimatePresence, useAnimationControls } from 'framer-motion'
import {
  BackArrowIcon, ReceiptIcon, ComprobanteIcon, MoneyIcon,
  RewardsGemIcon, DiamondTrio,
  BankLogo, SuccessCheckmark,
  ConfirmSlider,
  COLOR,
} from '../modo-ds'

const GREEN = COLOR.green

// ── StatusBar ────────────────────────────────────────────────────
// Single persistent OS-level element. Lives at phone-shell level, never inside
// a screen. Color transitions smoothly via Framer Motion when screens change.
// All icons use currentColor so they all follow the animated color together.
function StatusBar({ onLight }: { onLight: boolean }) {
  return (
    <>
      {/* Island is always black — never changes */}
      <div className="ios-island" style={{ zIndex: 201 }} />
      {/* Icons layer — color animates white ↔ black */}
      <motion.div
        animate={{ color: onLight ? '#000000' : '#ffffff' }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: '0 0 auto',
          height: 62, zIndex: 200,
          display: 'flex', alignItems: 'center',
          padding: '14px 20px 0',
          pointerEvents: 'none', userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1, color: 'inherit' }}>9:41</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Cellular — currentColor fills */}
          <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
            <rect x="0" y="8" width="3" height="4" rx="1"/>
            <rect x="5" y="5.5" width="3" height="6.5" rx="1"/>
            <rect x="10" y="3" width="3" height="9" rx="1"/>
            <rect x="15" y="0" width="3" height="12" rx="1"/>
          </svg>
          {/* WiFi — currentColor fills */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <circle cx="8" cy="11" r="1.5"/>
            <path d="M4.6 7.9C5.7 6.7 6.8 6 8 6s2.3.7 3.4 1.9l1.2-1.2C11.1 5.1 9.6 4.3 8 4.3S4.9 5.1 3.4 6.7l1.2 1.2z"/>
            <path d="M1.5 4.8C3.2 3 5.5 1.9 8 1.9s4.8 1.1 6.5 2.9l1.2-1.2C13.7 1.6 11 .4 8 .4S2.3 1.6.3 3.6l1.2 1.2z"/>
          </svg>
          {/* Battery — currentColor border + fill + nub */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <div style={{ position: 'relative', width: 25, height: 12 }}>
              <div style={{ position: 'absolute', inset: 0, border: '1.5px solid currentColor', borderRadius: 3.5 }} />
              <div style={{ position: 'absolute', top: 2, left: 2, right: 2, bottom: 2, background: 'currentColor', borderRadius: 1.5 }} />
            </div>
            <div style={{ width: 1.5, height: 5, background: 'currentColor', opacity: 0.4, borderRadius: 1 }} />
          </div>
        </div>
      </motion.div>
    </>
  )
}
const OVERLAY  = 'rgba(18,18,18,0.2)'
const TOTAL    = 2.8   // phase 1: 0–1.4 | pause: 1.4–1.6 | phase 2: 1.6–2.8
const SHEET_H  = 492   // bottom sheet height in px


function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}
function seg(t: number, start: number, end: number): number {
  return easeOut(Math.max(0, Math.min(1, (t - start) / (end - start))))
}

export default function PropiDemo() {
  const rm = useReducedMotion()
  const playhead = useMotionValue(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDone, setIsDone]       = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [showVerify, setShowVerify] = useState(false)
  const [showAmount, setShowAmount] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [keyboardDown, setKeyboardDown] = useState(false)
  const [amountText, setAmountText] = useState('')
  const [activeAmountKey, setActiveAmountKey] = useState<string | null>(null)
  const [sliderDone, setSliderDone] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const rafRef      = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef<number | undefined>(undefined)

  // ── Phase 1: Success ────────────────────────────────────────────
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
  // ── Phase 2: Bottom sheet ───────────────────────────────────────
  const overlayOpacity = useTransform(playhead, t => 0.75 * seg(t, 1.5, 1.85))

  // Sheet controlled imperatively so re-open can animate from SHEET_H → 0
  // without conflicting with a style motion value that's already at 0.
  const sheetControls = useAnimationControls()
  const [sheetOpen, setSheetOpen] = useState(false)
  useEffect(() => {
    return playhead.on('change', (t) => {
      const rawY = SHEET_H * (1 - easeOut(Math.max(0, Math.min(1, (t - 1.55) / (2.05 - 1.55)))))
      sheetControls.set({ y: rawY })
      if (t > 1.5) setSheetOpen(true)
    })
  }, [])

  // ── Playback ────────────────────────────────────────────────────
  const stopRAF = () => { if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current) }

  const seek = useCallback((pct: number) => {
    const c = Math.max(0, Math.min(1, pct))
    playhead.set(c * TOTAL)
    setIsDone(c >= 1)
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

  // ── Typing animation on input screen ─────────────────────────────
  useEffect(() => {
    if (!showInput) return
    const ALIAS = 'Cris.propina'
    // key map: lowercase letter key to highlight, null = no key (e.g. ".")
    const keyFor = (ch: string) => ch === '.' ? null : ch.toLowerCase()
    let i = 0
    const startId = setTimeout(() => {
      const tick = () => {
        if (i >= ALIAS.length) {
          // typing done — wait for user to tap Continuar
          return
        }
        const ch = ALIAS[i]
        setTypedText(ALIAS.slice(0, i + 1))
        const k = keyFor(ch)
        if (k) {
          setActiveKey(k)
          setTimeout(() => setActiveKey(null), 150)
        }
        i++
        setTimeout(tick, 130)
      }
      tick()
    }, 1200) // wait for screen to settle before typing starts
    return () => clearTimeout(startId)
  }, [showInput])

  const handleDejarPropina = () => {
    setShowLoading(true)
    setTimeout(() => {
      setShowInput(true)              // CBU starts sliding in from right
      setTimeout(() => {
        setShowLoading(false)         // loading fades out 150ms later, CBU already underway
      }, 150)
    }, 2000)
  }

  // Back from CBU/input screen → dismiss it, reset typed text + keyboard
  const handleBackFromInput = () => {
    setShowInput(false)
    setShowVerify(false)
    setKeyboardDown(false)
    setTypedText('')
    setActiveKey(null)
  }

  // Back from verify screen → return to input screen, keyboard slides back up
  const handleBackFromVerify = () => {
    setShowVerify(false)
    setKeyboardDown(false)
  }

  // Back from amount screen → return to verify screen
  const handleBackFromAmount = () => {
    setShowAmount(false)
    setAmountText('')
  }

  // Back from confirm screen → return to amount screen
  const handleBackFromConfirm = () => {
    setShowConfirm(false)
    setSliderDone(false)
    setShowSuccess(false)
  }

  // "Ir al inicio" on success screen → reset everything
  const handleGoHome = () => {
    setShowSuccess(false)
    setShowConfirm(false)
    setShowAmount(false)
    setShowVerify(false)
    setShowInput(false)
    setSliderDone(false)
    setAmountText('')
    setTypedText('')
    setKeyboardDown(false)
    setShowLoading(false)
  }

  // Amount keypad handler
  const handleAmountKey = (key: string) => {
    setActiveAmountKey(key)
    setTimeout(() => setActiveAmountKey(null), 120)
    if (key === '←') {
      setAmountText(prev => prev.slice(0, -1))
    } else if (key === ',') {
      setAmountText(prev => (prev.includes(',') ? prev : prev + ','))
    } else {
      setAmountText(prev => prev + key)
    }
  }

  // ── Galicia notification — 1 s after blue success, auto-dismiss after 3 s ──
  useEffect(() => {
    if (!showSuccess) { setShowNotif(false); return }
    const showId  = setTimeout(() => setShowNotif(true),  1000)
    const hideId  = setTimeout(() => setShowNotif(false), 4000)
    return () => { clearTimeout(showId); clearTimeout(hideId) }
  }, [showSuccess])

  const dismissSheet = () => {
    setDismissed(true)
    setShowTooltip(true)
    sheetControls.start({ y: SHEET_H, transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } })
  }

  const openSheet = () => {
    setDismissed(false)
    setShowTooltip(false)
    sheetControls.start({ y: 0, transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] } })
  }

  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('embed')

  // Emit current step to parent page so the annotation list can sync
  useEffect(() => {
    if (!isEmbed) return
    let step: number
    if (showSuccess) step = 3
    else if (showAmount || showConfirm) step = 2
    else if (showInput || showVerify) step = 1
    else if (sheetOpen && !dismissed) step = 0
    else return
    window.parent.postMessage({ type: 'propi-step', step }, '*')
  }, [showInput, showVerify, showAmount, showConfirm, showSuccess, sheetOpen, dismissed, isEmbed])

  // Jump to a specific step when the parent list row is clicked
  const jumpToStep = useCallback((step: number) => {
    stopRAF()
    setIsPlaying(false)
    playhead.set(TOTAL)
    setIsDone(true)
    setDismissed(false)
    setShowLoading(false)
    setShowInput(false)
    setShowVerify(false)
    setShowAmount(false)
    setShowConfirm(false)
    setShowSuccess(false)
    setShowNotif(false)
    setSliderDone(false)
    setKeyboardDown(false)
    setAmountText('')
    sheetControls.set({ y: 0 })

    if (step === 1) {
      setTypedText('')
      setActiveKey(null)
      setShowInput(true)
    } else if (step === 2) {
      setTypedText('Cris.propina')
      setAmountText('')
      setShowAmount(true)
    } else if (step === 3) {
      setTypedText('Cris.propina')
      setAmountText('1500')
      setSliderDone(true)
      setShowSuccess(true)
    }
    // step 0: sheet open, no sub-screen
  }, [playhead, sheetControls])

  useEffect(() => {
    if (!isEmbed) return
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'propi-jump' && typeof e.data.step === 'number') {
        jumpToStep(e.data.step)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [jumpToStep, isEmbed])

  return (
    <div style={{
      minHeight: isEmbed ? 'unset' : '100vh',
      background: isEmbed ? 'transparent' : '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isEmbed ? '0' : '40px 16px',
      fontFamily: "'Red Hat Display', sans-serif",
    }}>
      {/* ── Phone shell ── */}
      <div style={{
        width: 390, height: 844,
        borderRadius: 50,
        overflow: 'hidden',
        position: 'relative',
        // transform: translateZ(0) forces a GPU compositing layer — eliminates the
        // subpixel antialiasing white fringe that appears at border-radius edges
        // when child elements fill the container with a solid background colour.
        transform: 'translateZ(0)',
        boxShadow: '0 48px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
        background: GREEN,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Single persistent status bar — lives above all screens */}
        <StatusBar onLight={(showInput || showVerify || showAmount || showConfirm) && !showSuccess} />

        {/* ── iOS 26 notification banner — Galicia transfer confirmation ── */}
        {/* Custom-styled to work inside overflow:hidden phone shell.
            Kit's .ios-notification-banner uses position:fixed and would escape. */}
        <AnimatePresence>
          {showNotif && (
            <motion.div
              key="galicia-notif"
              initial={{ y: -80, scale: 0.96, opacity: 0 }}
              animate={{ y: 52, scale: 1, opacity: 1 }}
              exit={{ y: -80, scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 40 }}
              style={{ position: 'absolute', top: 0, left: 14, right: 14, zIndex: 600, pointerEvents: 'none' }}
            >
              {/* Frosted glass card */}
              <div style={{
                background: 'rgba(238,238,240,0.88)',
                backdropFilter: 'blur(40px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
                borderRadius: 20,
                padding: '10px 14px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 11,
                boxShadow: '0 6px 28px rgba(0,0,0,0.18), inset 0 0.5px 0 rgba(255,255,255,0.75)',
              }}>
                <BankLogo bank="galicia" appIcon size={40} />
                {/* Text block */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* App name + primary message + timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1, gap: 6 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.85)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '18px', letterSpacing: -0.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.9)' }}>Banco Galicia</span>
                      {' '}Transferiste ${amountText || '0'}
                    </p>
                    <span style={{ fontSize: 12, color: 'rgba(60,60,67,0.55)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', flexShrink: 0, lineHeight: 1 }}>
                      ahora
                    </span>
                  </div>
                  {/* Secondary detail */}
                  <p style={{ margin: '1px 0 0', fontSize: 12.5, fontWeight: 400, color: 'rgba(60,60,67,0.72)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '17px', letterSpacing: -0.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    A Cris.propina con tu cuenta Galicia CA・1234
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Safe area spacer — --ios-safe-top = 62px */}
        <div style={{ height: 62, flexShrink: 0 }} />

        {/* ── Phase 1: Success content ── */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

          {/* Checkmark */}
          <motion.div style={{ opacity: ckOpacity, y: ckY, display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <SuccessCheckmark
              playhead={playhead}
              segStart={0.20} segEnd={0.90}
              ckSegStart={0.75} ckSegEnd={1.15}
            />
          </motion.div>

          {/* Merchant row */}
          <motion.div style={{ opacity: merOpacity, y: merY, marginTop: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src="/logos/tostado.png" alt="Tostado" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 400, lineHeight: '22px' }}>Pagaste a</div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px' }}>Tostado</div>
              </div>
              <DiamondTrio />
            </div>
            <div style={{ height: '0.5px', background: 'rgba(245,245,245,0.7)', margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px' }}>Total</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: '28px' }}>$</span>
                <span style={{ color: '#fff', fontSize: 32, fontWeight: 500, lineHeight: '44px' }}>15.500</span>
              </div>
            </div>
          </motion.div>

          {/* Te devolveremos */}
          <motion.div style={{ opacity: promoOpacity, y: promoY, marginTop: 16 }}>
            <div style={{
              background: OVERLAY, borderRadius: '20px 0px 18px 20px',
              padding: 8, display: 'flex', alignItems: 'center', gap: 8, height: 48,
            }}>
              <RewardsGemIcon size={32} />
              <span style={{ flex: 1, color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: '16px', fontFamily: "'Quicksand', sans-serif" }}>
                Te devolveremos
              </span>
              <div style={{ background: '#FFC738', borderRadius: '15px 0px 15px 15px', padding: '0 12px', height: 32, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ color: '#121212', fontSize: 14, fontWeight: 700, lineHeight: '16px', fontFamily: "'Quicksand', sans-serif" }}>$4.500</span>
              </div>
            </div>
          </motion.div>

          {/* Card selector — vertically centered in the empty space */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <motion.div style={{ opacity: cardOpacity, y: cardY, width: '100%' }}>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px', marginBottom: 8 }}>Con tu tarjeta</div>
              <div style={{ border: '0.5px solid #f8f8f8', borderRadius: 20, display: 'flex', alignItems: 'center', paddingLeft: 24, paddingRight: 10, gap: 8, height: 60 }}>
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="/logos/visa-logo.svg" alt="Visa" style={{ width: 26, height: 26 }} />
                </div>
                <span style={{ color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px' }}>Santander Crédito · 1234</span>
              </div>
            </motion.div>
          </div>

          {/* Buttons */}
          <motion.div style={{ opacity: btnOpacity, y: btnY, marginTop: 16, paddingBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button style={{ flex: 1, background: OVERLAY, border: 'none', borderRadius: 20, padding: '10px 0', color: '#fff', fontSize: 16, fontWeight: 500, fontFamily: "'Red Hat Display', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ReceiptIcon /><span>Comprobante</span>
              </button>
              <div style={{ flex: 1, position: 'relative' }}>
                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      key="propina-tooltip"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: '50%', x: '-50%', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', zIndex: 10 }}
                    >
                      <div style={{ background: '#fff', borderRadius: 8, height: 34, padding: '0 12px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '17px' }}>Dejala con transferencia</span>
                      </div>
                      {/* Arrow pointing down toward button */}
                      <svg width="42" height="6" viewBox="0 0 42 6" fill="none" style={{ transform: 'rotate(180deg)', display: 'block' }}>
                        <path fillRule="evenodd" clipRule="evenodd" d="M32 5.9991C31.1984 5.9991 30.3971 6.00303 29.5955 5.99449C28.8283 5.98618 27.9696 5.97441 27.223 5.69676C26.4165 5.39672 25.8825 4.87212 25.3453 4.25474C24.9586 3.81069 24.1989 2.86327 23.829 2.40583C23.5262 2.03078 22.9336 1.28946 22.61 0.930804C22.2026 0.479597 21.6991 1.00682e-06 20.9998 9.45678e-07C20.3004 8.84539e-07 19.7971 0.479597 19.39 0.930343C19.0664 1.28877 18.4738 2.03055 18.1708 2.40536C17.8014 2.8628 17.0416 3.81022 16.6547 4.25428C16.1165 4.87166 15.5835 5.39626 14.7773 5.6963C14.0304 5.97325 13.1715 5.98571 12.4048 5.99402C11.6029 6.00256 10.8016 5.99864 10 5.99864" fill="white"/>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={openSheet} style={{ width: '100%', background: OVERLAY, border: 'none', borderRadius: 20, padding: '10px 0', color: '#fff', fontSize: 16, fontWeight: 500, fontFamily: "'Red Hat Display', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <MoneyIcon /><span>Propina</span>
                </button>
              </div>
            </div>
            <button style={{ width: '100%', background: 'transparent', border: 'none', padding: '9px 0', color: '#fff', fontSize: 16, fontWeight: 500, fontFamily: "'Red Hat Display', sans-serif", cursor: 'pointer' }}>
              Ir al Inicio
            </button>
          </motion.div>
        </div>

        {/* Home indicator */}
        <div style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 134, height: 5, background: 'rgba(255,255,255,0.5)', borderRadius: 100 }} />
        </div>

        {/* ── Phase 2: Overlay — tap outside to dismiss sheet ── */}
        <motion.div
          onClick={() => { if (isDone && !dismissed) dismissSheet() }}
          style={{
            position: 'absolute', inset: 0,
            background: '#121212',
            opacity: overlayOpacity,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            pointerEvents: isDone && !dismissed ? 'auto' : 'none',
            cursor: 'default',
          }}
          animate={dismissed ? { opacity: 0 } : isDone ? { opacity: 0.75 } : {}}
          transition={{ duration: 0.35, ease: dismissed ? 'easeIn' : 'easeOut' }}
        />

        {/* ── Phase 2: Bottom sheet ── */}
        <motion.div
          initial={{ y: SHEET_H }}
          animate={sheetControls}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#fff',
            borderRadius: '22px 22px 0 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Drag handle */}
          <div style={{ height: 20, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ width: 63, height: 5, background: 'rgba(0,0,0,0.12)', borderRadius: 80 }} />
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', width: '100%' }}>

            {/* Illustration + text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', width: '100%' }}>
              <img
                src="/logos/propina-illustration.png"
                alt=""
                style={{ width: 241, height: 178, objectFit: 'contain' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center', width: '100%', color: '#121212' }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, lineHeight: '28px', whiteSpace: 'nowrap' }}>
                  ¿Te gustó cómo te atendieron?
                </p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 400, lineHeight: '22px', width: 350 }}>
                  Pedile un alias a quien te atendió<br />y agradecele con una propina.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', paddingBottom: 24, width: '100%' }}>
                <button onClick={handleDejarPropina} style={{
                  width: 350, height: 56,
                  background: GREEN, border: 'none', borderRadius: 20,
                  color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px',
                  fontFamily: "'Red Hat Display', sans-serif", cursor: 'pointer',
                }}>
                  Dejar propina
                </button>
                <button onClick={dismissSheet} style={{
                  width: 328, height: 40,
                  background: 'transparent', border: 'none',
                  color: '#121212', fontSize: 16, fontWeight: 500, lineHeight: '22px',
                  fontFamily: "'Red Hat Display', sans-serif", cursor: 'pointer',
                }}>
                  Volver
                </button>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── Input screen ── */}
        <AnimatePresence>
          {showInput && (
            <motion.div
              key="input"
              initial={{ x: 390 }}
              animate={{ x: 0 }}
              exit={{ x: 390 }}
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: 'absolute', inset: 0,
                background: '#fff',
                borderRadius: 50,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              {/* Safe area spacer — status bar is at phone shell level */}
              <div style={{ height: 62, flexShrink: 0 }} />

              {/* Top app bar */}
              <div style={{ height: 52, display: 'flex', alignItems: 'center', paddingLeft: 12, paddingRight: 12, flexShrink: 0 }}>
                <button onClick={handleBackFromInput} style={{ width: 48, height: 48, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BackArrowIcon />
                </button>
                <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '22px' }}>
                  Transferir a un CBU, CVU o Alias
                </span>
                <div style={{ width: 48, flexShrink: 0 }} />
              </div>

              {/* Input field */}
              <div style={{ margin: '0 31px', paddingTop: 4, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', paddingBottom: 6, borderBottom: '0.5px solid #ececec' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#121212', lineHeight: '22px', fontFamily: "'Red Hat Display', sans-serif" }}>
                      Escribí un CBU, CVU o alias
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {typedText ? (
                        <>
                          <span style={{ fontSize: 18, fontWeight: 400, color: '#121212', lineHeight: '24px', fontFamily: "'Red Hat Display', sans-serif" }}>{typedText}</span>
                          <div className="input-caret" style={{ width: 2, height: 20, background: GREEN, borderRadius: 2, flexShrink: 0, marginLeft: 1 }} />
                        </>
                      ) : (
                        <>
                          <div className="input-caret" style={{ width: 2, height: 20, background: GREEN, borderRadius: 2, flexShrink: 0 }} />
                          <p style={{ margin: 0, marginLeft: 3, fontSize: 18, fontWeight: 400, color: '#929292', lineHeight: '24px', fontFamily: "'Red Hat Display', sans-serif" }}>
                            10001234567890000000
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <button style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 27 27" fill="none" overflow="visible">
                      <path fillRule="evenodd" clipRule="evenodd" fill="#008859" d="M9.05586 22.1892H6.18726C4.94615 22.1855 3.94096 21.1803 3.93726 19.9392V6.75013C3.94096 5.50903 4.94615 4.50384 6.18726 4.50013H7.91976C8.72162 3.10811 10.2058 2.25024 11.8123 2.25024C13.4187 2.25024 14.9029 3.10811 15.7048 4.50013H17.4373C18.6784 4.50384 19.6836 5.50903 19.6873 6.75013V8.5H17.9998V6.7484C17.9998 6.43774 17.748 6.1859 17.4373 6.1859H16.2786C16.3014 6.37253 16.3127 6.56039 16.3123 6.7484C16.3123 7.36972 15.8087 7.8734 15.1873 7.8734H8.43733C7.81601 7.8734 7.31233 7.36972 7.31233 6.7484C7.31201 6.56039 7.32328 6.37253 7.34608 6.1859H6.18733C5.87667 6.1859 5.62483 6.43774 5.62483 6.7484V19.9375C5.62483 20.2482 5.87667 20.5 6.18733 20.5H9.05586V22.1892ZM12.8148 4.12724C11.917 3.78542 10.9068 3.92553 10.1359 4.49878C9.57709 4.90605 9.19165 5.50831 9.05586 6.18628H14.5684C14.3739 5.24549 13.7126 4.46905 12.8148 4.12724Z"/>
                      <path fillRule="evenodd" clipRule="evenodd" fill="#008859" d="M22.2496 12.5C22.2496 11.2574 21.2423 10.25 19.9996 10.25L16.6572 10.2502L16 10.2493H13.25C12.6526 10.2472 12.0791 10.4836 11.6567 10.906C11.2343 11.3284 10.9979 11.9019 11 12.4993L11 22.5007C11 23.7433 12.0074 24.7507 13.25 24.7507L20.0001 24.7504C21.2412 24.7467 22.2464 23.7416 22.2501 22.5004L22.2496 12.5ZM20.5623 22.5009C20.5574 22.8095 20.3084 23.0586 19.9998 23.0634L13.2497 23.0636C12.939 23.0636 12.6872 22.8117 12.6872 22.5011V12.4997C12.6872 12.1891 12.939 11.9372 13.2497 11.9372L19.9998 11.937C20.3104 11.937 20.5623 12.1888 20.5623 12.4995V22.5009Z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Continuar button — disabled */}
              <div style={{ margin: '0 31px 16px', flexShrink: 0 }}>
                <button
                  onClick={() => {
                    if (typedText.length > 0) {
                      setKeyboardDown(true)
                      setTimeout(() => setShowVerify(true), 300)
                    }
                  }}
                  style={{
                    width: '100%', height: 56,
                    background: typedText.length > 0 ? GREEN : 'rgba(18,18,18,0.05)',
                    border: 'none', borderRadius: 20,
                    fontSize: 16, fontWeight: 500,
                    color: typedText.length > 0 ? '#ffffff' : '#717171',
                    fontFamily: "'Red Hat Display', sans-serif",
                    cursor: typedText.length > 0 ? 'pointer' : 'default',
                    transition: 'background 0.25s ease, color 0.25s ease',
                  }}>
                  Continuar
                </button>
              </div>

              {/* Keyboard — slides down out of view before navigating to verify */}
              <motion.div
                animate={{ y: keyboardDown ? 320 : 0 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 1, 1] }}
                style={{ flexShrink: 0 }}
              >
              <div className="ios-keyboard">
                {/* Empty suggest bar — no buttons, keeps the natural top gap */}
                <div className="ios-keyboard__suggest" aria-hidden="true" />
                <div className="ios-keyboard__keys">
                  <div className="ios-keyboard__row">
                    {['q','w','e','r','t','y','u','i','o','p'].map(k => (
                      <button key={k} className="ios-key" style={activeKey === k ? { backgroundColor: '#D1D3D9' } : undefined}>{k}</button>
                    ))}
                  </div>
                  <div className="ios-keyboard__row">
                    {['a','s','d','f','g','h','j','k','l'].map(k => (
                      <button key={k} className="ios-key" style={activeKey === k ? { backgroundColor: '#D1D3D9' } : undefined}>{k}</button>
                    ))}
                  </div>
                  <div className="ios-keyboard__row">
                    <button className="ios-key" data-fn="" data-flex="" data-active="" aria-label="Shift"><i className="ios-icon ios-icon--shift-fill" /></button>
                    {['z','x','c','v','b','n','m'].map(k => (
                      <button key={k} className="ios-key" style={activeKey === k ? { backgroundColor: '#D1D3D9' } : undefined}>{k}</button>
                    ))}
                    <button className="ios-key" data-fn="" data-flex="" aria-label="Delete"><i className="ios-icon ios-icon--backspace" /></button>
                  </div>
                  <div className="ios-keyboard__row">
                    <button className="ios-key" data-fn="" data-wide="">123</button>
                    <button className="ios-key" data-space="">espacio</button>
                    <button className="ios-key" data-fn="" data-wide="" data-tone="tint">ir</button>
                  </div>
                </div>
                <div className="ios-keyboard__bottom">
                  <button aria-label="Emoji"><i className="ios-icon ios-icon--smile" /></button>
                  <button aria-label="Dictate"><i className="ios-icon ios-icon--mic" style={{ '--w': '14px', '--h': '20px' } as React.CSSProperties} /></button>
                </div>
              </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Verify screen ── */}
        <AnimatePresence>
          {showVerify && (
            <motion.div
              key="verify"
              initial={{ x: 390 }}
              animate={{ x: 0 }}
              exit={{ x: 390 }}
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: 'absolute', inset: 0,
                background: '#fff',
                borderRadius: 50,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Safe area spacer */}
              <div style={{ height: 62, flexShrink: 0 }} />

              {/* Top app bar */}
              <div style={{ height: 52, display: 'flex', alignItems: 'center', paddingLeft: 12, paddingRight: 12, flexShrink: 0 }}>
                <button onClick={handleBackFromVerify} style={{ width: 48, height: 48, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BackArrowIcon />
                </button>
                <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '22px' }}>
                  Verificá los datos
                </span>
                <div style={{ width: 48, flexShrink: 0 }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', overflow: 'hidden' }}>

                {/* Radio button section */}
                <div style={{
                  height: 48, flexShrink: 0,
                  border: '2px solid #008859', borderRadius: 20,
                  display: 'flex', alignItems: 'center',
                  paddingLeft: 20, paddingRight: 8,
                  marginTop: 12,
                }}>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 400, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '20px' }}>
                    Agendar CBU / CVU / Alias
                  </span>
                  <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="#008859"/>
                      <path d="M7.24834 11.7998C7.50536 11.7998 7.70574 11.7084 7.84514 11.5175L11.9225 5.76041C12.0271 5.61728 12.0663 5.49005 12.0663 5.3668C12.0663 5.0527 11.8136 4.82607 11.4608 4.82607C11.2168 4.82607 11.0687 4.90559 10.9206 5.12029L7.23092 10.456L5.34034 8.26922C5.19658 8.1062 5.04847 8.03464 4.83502 8.03464C4.47781 8.03464 4.2208 8.26524 4.2208 8.58331C4.2208 8.72247 4.27307 8.85368 4.3994 8.99283L6.6559 11.5295C6.82144 11.7163 7.0044 11.7998 7.24834 11.7998Z" fill="white"/>
                    </svg>
                  </div>
                </div>

                {/* List rows */}
                <div style={{ marginTop: 8, flexShrink: 0 }}>
                  {([
                    { label: 'Nombre',    value: 'Cristobal Lemoine',            icon: <IconProfileCircle /> },
                    { label: 'Banco',     value: 'Santa Fe\u30FB CA 6421',     icon: <IconBankCircle /> },
                    { label: 'Alias',     value: typedText || 'Cris.propina',  icon: <IconFaceCircle /> },
                    { label: 'CBU',       value: '1430001713032233600018',      icon: <IconPadlockCircle /> },
                    { label: 'CUIL/CUIL', value: '274003129834',               icon: <IconClipboardCircle /> },
                  ] as Array<{ label: string; value: string; icon: React.ReactNode }>).map(({ label, value, icon }) => (
                    <div key={label} style={{
                      height: 72,
                      borderBottom: '0.5px solid #ececec',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <div style={{ padding: '12px 8px', flexShrink: 0 }}>{icon}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: '#717171', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '19px' }}>{label}</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '20px' }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ flex: 1 }} />

                {/* Continuar button */}
                <div style={{ paddingBottom: 32, flexShrink: 0 }}>
                  <button onClick={() => setShowAmount(true)} style={{
                    width: '100%', height: 56,
                    background: GREEN, border: 'none', borderRadius: 20,
                    fontSize: 16, fontWeight: 500, color: '#fff',
                    fontFamily: "'Red Hat Display', sans-serif",
                    cursor: 'pointer',
                  }}>
                    Continuar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Amount screen ── */}
        <AnimatePresence>
          {showAmount && (
            <motion.div
              key="amount"
              initial={{ x: 390 }}
              animate={{ x: 0 }}
              exit={{ x: 390 }}
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: 'absolute', inset: 0,
                background: '#fff',
                borderRadius: 50,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Safe area spacer */}
              <div style={{ height: 62, flexShrink: 0 }} />

              {/* Top app bar */}
              <div style={{ height: 52, display: 'flex', alignItems: 'center', paddingLeft: 12, paddingRight: 12, flexShrink: 0 }}>
                {/* Back */}
                <button onClick={handleBackFromAmount} style={{ width: 48, height: 48, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BackArrowIcon />
                </button>
                {/* Account dropdown - center */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {/* Galicia logo */}
                    <BankLogo bank="galicia" size={26} />
                    <span style={{ fontSize: 16, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '22px' }}>
                      Galicia CA · 1234
                    </span>
                    {/* Chevron down */}
                    <svg width="16" height="16" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
                      <path fillRule="evenodd" clipRule="evenodd" fill="#121212" d="M12.2929 15.2929C12.6834 14.9024 13.3166 14.9024 13.7071 15.2929L18 19.5858L22.2929 15.2929C22.6834 14.9024 23.3166 14.9024 23.7071 15.2929C24.0976 15.6834 24.0976 16.3166 23.7071 16.7071L18.7071 21.7071C18.3166 22.0976 17.6834 22.0976 17.2929 21.7071L12.2929 16.7071C11.9024 16.3166 11.9024 15.6834 12.2929 15.2929Z"/>
                    </svg>
                  </div>
                  {/* Balance */}
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#717171', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '20px' }}>
                    $&nbsp;93.500,50
                  </span>
                </div>
                {/* Swap icon */}
                <button style={{ width: 48, height: 48, background: 'rgba(18,18,18,0.02)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                    <path d="M25.2652 11.1441H26.1786C26.6389 11.1441 27.012 10.7709 27.012 10.3107C27.012 9.85042 26.6389 9.47731 26.1786 9.47731H23.134C22.6737 9.47731 22.3006 9.85042 22.3006 10.3107V13.3553C22.3006 13.8155 22.6737 14.1886 23.134 14.1886C23.5943 14.1886 23.9674 13.8155 23.9674 13.3553V12.2019C26.3066 14.5987 26.9807 18.1644 25.678 21.2498C24.3752 24.3352 21.3496 26.3387 18.0004 26.3337V28.0004C21.9927 28.0044 25.604 25.631 27.1841 21.9647C28.7642 18.2985 28.0096 14.0435 25.2652 11.1441Z" fill="#121212"/>
                    <path d="M12.3255 24.0841C9.81668 21.7544 8.99109 18.1256 10.2451 14.9398C11.499 11.7539 14.5765 9.66143 18.0002 9.66675V8C13.983 8.00021 10.3558 10.4042 8.7906 14.104C7.22536 17.8037 8.02589 22.0809 10.8232 24.9642H10.1121C9.65181 24.9642 9.27869 25.3373 9.27869 25.7975C9.27869 26.2578 9.65181 26.6309 10.1121 26.6309H13.1589C13.6191 26.6309 13.9923 26.2578 13.9923 25.7975V22.7529C13.9923 22.2927 13.6191 21.9196 13.1589 21.9196C12.6986 21.9196 12.3255 22.2927 12.3255 22.7529V24.0841Z" fill="#121212"/>
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', padding: '0 20px' }}>

                {/* Recipient pill */}
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, background: '#f8f8f8', borderRadius: 100, padding: '6px 12px 6px 6px', flexShrink: 0 }}>
                  {/* CL avatar */}
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5edf9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#0049c4', fontFamily: "'Red Hat Display', sans-serif", lineHeight: 1 }}>CL</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '19px', whiteSpace: 'nowrap' }}>Cristobal Lemoine</span>
                </div>

                <div style={{ flex: 1 }} />

                {/* Amount display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0 }}>
                  {!amountText ? (
                    <>
                      <span style={{ color: '#d0d0d0', fontSize: 22, fontWeight: 700, lineHeight: '28px', fontFamily: "'Red Hat Display', sans-serif" }}>$</span>
                      <div className="input-caret" style={{ width: 2, height: 32, background: '#d0d0d0', borderRadius: 1, margin: '0 2px', alignSelf: 'center' }} />
                      <span style={{ color: '#d0d0d0', fontSize: 40, fontWeight: 500, lineHeight: '56px', fontFamily: "'Red Hat Display', sans-serif" }}>0</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#121212', fontSize: 22, fontWeight: 700, lineHeight: '28px', fontFamily: "'Red Hat Display', sans-serif" }}>$</span>
                      <span style={{ color: '#121212', fontSize: 40, fontWeight: 500, lineHeight: '56px', fontFamily: "'Red Hat Display', sans-serif" }}>{amountText}</span>
                      <div className="input-caret" style={{ width: 2, height: 32, background: GREEN, borderRadius: 1, margin: '0 1px', alignSelf: 'center' }} />
                    </>
                  )}
                </div>

                {/* Motivo chip — vertically centered in the space between amount and Mensaje */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #ececec', borderRadius: 100, padding: '6px 12px', flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '20px' }}>Motivo&nbsp;</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0049c4', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '20px' }}>Propina</span>
                    <svg width="14" height="14" viewBox="0 0 36 36" fill="none" style={{ marginLeft: 2 }}>
                      <path fillRule="evenodd" clipRule="evenodd" fill="#121212" d="M12.2929 15.2929C12.6834 14.9024 13.3166 14.9024 13.7071 15.2929L18 19.5858L22.2929 15.2929C22.6834 14.9024 23.3166 14.9024 23.7071 15.2929C24.0976 15.6834 24.0976 16.3166 23.7071 16.7071L18.7071 21.7071C18.3166 22.0976 17.6834 22.0976 17.2929 21.7071L12.2929 16.7071C11.9024 16.3166 11.9024 15.6834 12.2929 15.2929Z"/>
                    </svg>
                  </div>
                </div>

                {/* Mensaje input */}
                <div style={{ position: 'relative', width: '100%', marginTop: 0, flexShrink: 0 }}>
                  {/* Floating label */}
                  <div style={{ position: 'absolute', top: -12, left: 8, background: '#fff', padding: '0 8px', display: 'flex', gap: 4, zIndex: 1 }}>
                    <span style={{ fontSize: 16, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '22px', whiteSpace: 'nowrap' }}>Mensaje</span>
                    <span style={{ fontSize: 16, fontWeight: 500, color: '#717171', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '22px' }}>(0/45)</span>
                  </div>
                  <div style={{ border: '0.5px solid #d0d0d0', borderRadius: 20, display: 'flex', alignItems: 'center', paddingLeft: 20, paddingRight: 6, paddingTop: 6, paddingBottom: 6, gap: 12 }}>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 400, color: '#717171', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '20px' }}>Propi</span>
                    {/* GIF button */}
                    <div style={{ width: 48, height: 48, background: '#dcf8e9', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: GREEN, fontFamily: "'Red Hat Display', sans-serif", letterSpacing: 0.5 }}>GIF</span>
                    </div>
                  </div>
                </div>

                {/* Continuar button */}
                <div style={{ width: '100%', marginTop: 16, marginBottom: 12, flexShrink: 0 }}>
                  <button onClick={() => amountText && setShowConfirm(true)} style={{
                    width: '100%', height: 56,
                    background: amountText ? GREEN : '#f8f8f8',
                    border: 'none', borderRadius: 20,
                    fontSize: 16, fontWeight: 500,
                    color: amountText ? '#fff' : '#929292',
                    fontFamily: "'Red Hat Display', sans-serif",
                    cursor: amountText ? 'pointer' : 'default',
                    transition: 'background 0.25s ease, color 0.25s ease',
                  }}>
                    Continuar
                  </button>
                </div>
              </div>

              {/* ── Custom numeric keypad ── */}
              <div style={{ background: '#fff', padding: '8px 16px 9px', flexShrink: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {/* Row 1 */}
                  {['1','2','3'].map(k => (
                    <button key={k} onClick={() => handleAmountKey(k)} style={{ height: 46, background: activeAmountKey === k ? '#d1d3d9' : '#f8f8f8', border: 'none', borderRadius: 5, fontSize: 20, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", cursor: 'pointer', transition: 'background 0.1s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k}</button>
                  ))}
                  {/* Row 2 */}
                  {['4','5','6'].map(k => (
                    <button key={k} onClick={() => handleAmountKey(k)} style={{ height: 47, background: activeAmountKey === k ? '#d1d3d9' : '#f8f8f8', border: 'none', borderRadius: 5, fontSize: 20, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", cursor: 'pointer', transition: 'background 0.1s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k}</button>
                  ))}
                  {/* Row 3 */}
                  {['7','8','9'].map(k => (
                    <button key={k} onClick={() => handleAmountKey(k)} style={{ height: 47, background: activeAmountKey === k ? '#d1d3d9' : '#f8f8f8', border: 'none', borderRadius: 5, fontSize: 20, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", cursor: 'pointer', transition: 'background 0.1s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k}</button>
                  ))}
                  {/* Row 4 */}
                  <button onClick={() => handleAmountKey(',')} style={{ height: 46, background: activeAmountKey === ',' ? '#d1d3d9' : '#f8f8f8', border: 'none', borderRadius: 5, fontSize: 22, fontWeight: 700, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", cursor: 'pointer', transition: 'background 0.1s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: -0.5 }}>,</button>
                  <button onClick={() => handleAmountKey('0')} style={{ height: 46, background: activeAmountKey === '0' ? '#d1d3d9' : '#f8f8f8', border: 'none', borderRadius: 5, fontSize: 20, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", cursor: 'pointer', transition: 'background 0.1s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>0</button>
                  <button onClick={() => handleAmountKey('←')} style={{ height: 46, background: activeAmountKey === '←' ? '#d1d3d9' : '#f8f8f8', border: 'none', borderRadius: 5, cursor: 'pointer', transition: 'background 0.1s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
                      <path d="M9.5 1H22C23.66 1 25 2.34 25 4V16C25 17.66 23.66 19 22 19H9.5C8.5 19 7.5 18.5 7 17.5L1.5 10L7 2.5C7.5 1.5 8.5 1 9.5 1Z" stroke="#121212" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M11.5 7L18.5 13M18.5 7L11.5 13" stroke="#121212" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Home indicator */}
              <div style={{ height: 34, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 134, height: 5, background: '#000', borderRadius: 100 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Confirm screen ── */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              key="confirm"
              initial={{ x: 390 }}
              animate={{ x: 0 }}
              exit={{ x: 390 }}
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: '#fff', borderRadius: 50,
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Safe area spacer */}
              <div style={{ height: 62, flexShrink: 0 }} />

              {/* Top app bar */}
              <div style={{ height: 52, display: 'flex', alignItems: 'center', paddingLeft: 12, paddingRight: 12, flexShrink: 0 }}>
                <button onClick={handleBackFromConfirm} style={{ width: 48, height: 48, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BackArrowIcon />
                </button>
                <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '22px' }}>
                  Confirmar envío
                </span>
                <div style={{ width: 48, flexShrink: 0 }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '0 20px' }}>

                {/* Amount — $ 22px/700 + number 40px/500 */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 14, marginBottom: 16 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, lineHeight: '28px', color: '#121212', fontFamily: "'Red Hat Display', sans-serif" }}>$</span>
                  <span style={{ fontSize: 40, fontWeight: 500, lineHeight: '56px', color: '#121212', fontFamily: "'Red Hat Display', sans-serif" }}>{amountText || '0'}</span>
                </div>

                {/* Enviando a */}
                <span style={{ fontSize: 15, fontWeight: 400, lineHeight: '22px', color: '#0049C4', fontFamily: "'Red Hat Display', sans-serif", marginBottom: 4 }}>Enviando a</span>

                {/* Recipient pill — same avatar as amount screen */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 100, padding: '4px 8px 4px 4px', height: 31 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5edf9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#0049c4', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '17px' }}>CL</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '22px', whiteSpace: 'nowrap' }}>Cristobal Lemoine</span>
                </div>

                {/* Spacer before bank section */}
                <div style={{ flex: '0 0 48px' }} />

                {/* A su cuenta */}
                <span style={{ fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#0049C4', fontFamily: "'Red Hat Display', sans-serif", marginBottom: 6 }}>A su cuenta</span>

                {/* Bank row — BankLogo santafe (real logo, confirm screen only) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <BankLogo bank="santafe" />
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '22px' }}>Santa Fé · CA 6421</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#717171', fontFamily: "'Red Hat Display', sans-serif", marginBottom: 28 }}>
                  CBU 1430001713032233600018
                </span>

                {/* Drag slider */}
                <ConfirmSlider
                  complete={sliderDone}
                  onComplete={() => {
                    setSliderDone(true)
                    setShowLoading(true)                   // loading fades in immediately (0.2s)
                    setTimeout(() => {
                      setShowSuccess(true)                 // success slides in behind loader
                      setTimeout(() => setShowLoading(false), 150)  // loader fades out
                    }, 2000)
                  }}
                />

                {/* De tu cuenta */}
                <span style={{ fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#0049C4', fontFamily: "'Red Hat Display', sans-serif", marginTop: 24, marginBottom: 6 }}>De tu cuenta</span>

                {/* Payment method — Galicia CA, matches the amount screen */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <BankLogo bank="galicia" />
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#121212', fontFamily: "'Red Hat Display', sans-serif", lineHeight: '22px' }}>Galicia CA・1234</span>
                </div>
              </div>

              {/* Home indicator */}
              <div style={{ height: 34, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 134, height: 5, background: '#000', borderRadius: 100 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Propina sent success screen ── */}
        {/* Blue #1a46c1 full-screen result. Slides in behind the loading screen
            (zIndex:2 < loading zIndex:10), then loading fades out revealing it. */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              key="success"
              initial={{ x: 390 }}
              animate={{ x: 0 }}
              exit={{ x: 390 }}
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: 'absolute', inset: 0,
                background: '#1a46c1',
                borderRadius: 50, overflow: 'hidden',
                zIndex: 2,
              }}
            >
              {/* ── Checkmark — animated draw-on, same as main success screen ── */}
              <div style={{ position: 'absolute', top: 79, left: '50%', transform: 'translateX(-50%)' }}>
                <SuccessCheckmark autoPlay delay={0} />
              </div>

              {/* ── Transaction info — centered in upper half ── */}
              {/* top ≈ 155px: calc(50% - 175.75px) - translateY(-50%) of 181.5px */}
              <div style={{ position: 'absolute', left: 20, right: 20, top: 175 }}>
                {/* Avatar row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e5edf9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#0049c4', fontFamily: "'Red Hat Display', sans-serif", lineHeight: 1 }}>CL</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 400, color: '#fff', lineHeight: '22px', fontFamily: "'Red Hat Display', sans-serif" }}>Enviaste propina a</p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#fff', lineHeight: '22px', fontFamily: "'Red Hat Display', sans-serif" }}>Cristobal Lemoine</p>
                  </div>
                </div>
                {/* Divider + amount */}
                <div style={{ borderTop: '0.5px solid rgba(245,245,245,0.7)', paddingTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#fff', lineHeight: '22px', fontFamily: "'Red Hat Display', sans-serif" }}>Monto total</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: '28px', fontFamily: "'Red Hat Display', sans-serif" }}>$</span>
                    <span style={{ fontSize: 32, fontWeight: 500, color: '#fff', lineHeight: '44px', fontFamily: "'Red Hat Display', sans-serif" }}>{amountText || '0'}</span>
                  </div>
                </div>
              </div>

              {/* ── Account details — top: 464px per Figma ── */}
              <div style={{ position: 'absolute', top: 464, left: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: '22px', fontFamily: "'Red Hat Display', sans-serif" }}>A su cuenta</p>
                {/* Santa Fé row */}
                <div style={{ border: '0.5px solid rgba(245,245,245,0.7)', borderRadius: 20, display: 'flex', alignItems: 'center', height: 60 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 24 }}>
                    <BankLogo bank="santafe" size={26} />
                    <div>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#fff', lineHeight: '22px', fontFamily: "'Red Hat Display', sans-serif" }}>Santa Fé・CA 6421</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: '19px', fontFamily: "'Red Hat Display', sans-serif" }}>CBU 1430001713032233600018</p>
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: '22px', fontFamily: "'Red Hat Display', sans-serif" }}>De tu cuenta</p>
                {/* Galicia row */}
                <div style={{ border: '0.5px solid rgba(245,245,245,0.7)', borderRadius: 20, display: 'flex', alignItems: 'center', height: 60 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 24 }}>
                    <BankLogo bank="galicia" size={26} />
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#fff', lineHeight: '22px', fontFamily: "'Red Hat Display', sans-serif" }}>Galicia CA・1234</p>
                  </div>
                </div>
              </div>

              {/* ── Bottom buttons ── */}
              <div style={{ position: 'absolute', bottom: 34, left: 20, right: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <button style={{
                  width: '100%', height: 56,
                  background: 'rgba(18,18,18,0.2)', border: 'none', borderRadius: 20,
                  color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px',
                  fontFamily: "'Red Hat Display', sans-serif", cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <ComprobanteIcon />
                  Compartir comprobante
                </button>
                <button onClick={handleGoHome} style={{
                  width: '100%', height: 40,
                  background: 'transparent', border: 'none',
                  color: '#fff', fontSize: 16, fontWeight: 500, lineHeight: '22px',
                  fontFamily: "'Red Hat Display', sans-serif", cursor: 'pointer',
                }}>
                  Ir al inicio
                </button>
              </div>

              {/* Home indicator */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 134, height: 5, background: '#000', borderRadius: 100 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading screen ── */}
        <AnimatePresence>
          {showLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', inset: 0,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 50,
                zIndex: 10,
              }}
            >
              <motion.img
                src="/logos/modo-loader.svg"
                alt=""
                style={{ width: 70, height: 70 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, ease: 'linear', repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}

// ── Verify screen icon circles (Figma node 172:32647) ────────────
// These are screen-specific icons kept local to propi-demo.
// Circle bg: #DCF5E7 · Icon fill: #026C2A · Size: 36x36

function IconProfileCircle() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="18" fill="#DCF5E7"/>
      <g transform="translate(10.85,10.85)">
        <path fill="#026C2A" d="M7.14977 1.58179e-06C5.82539 -0.000879512 4.52683 0.366348 3.39906 1.06069C2.27129 1.75503 1.35869 2.74915 0.763149 3.93207C0.167608 5.115 -0.0874366 6.44016 0.0264873 7.75963C0.140411 9.0791 0.618821 10.3409 1.40831 11.4043C1.65671 11.7468 1.93941 12.063 2.25201 12.3481C3.57471 13.6014 5.32757 14.3 7.14977 14.3C8.97197 14.3 10.7248 13.6014 12.0475 12.3481C12.3601 12.063 12.6428 11.7468 12.8912 11.4043C13.6807 10.3409 14.1591 9.0791 14.2731 7.75963C14.387 6.44016 14.1319 5.115 13.5364 3.93207C12.9409 2.74915 12.0283 1.75503 10.9005 1.06069C9.77271 0.366348 8.47415 -0.000879512 7.14977 1.58179e-06ZM11.3089 11.5702C10.1826 12.6369 8.6894 13.2302 7.13805 13.2272C5.5867 13.2243 4.09577 12.6254 2.97344 11.5544C2.87191 11.4622 2.77682 11.3621 2.68244 11.2606C3.10484 10.4717 3.64706 9.75318 4.28976 9.13057C4.64262 9.50647 5.06612 9.80912 5.53604 10.0212C6.00596 10.2333 6.51308 10.3507 7.0284 10.3666C7.54371 10.3825 8.05712 10.2967 8.53925 10.1141C9.02137 9.93145 9.46277 9.65555 9.83818 9.30217C9.89889 9.2486 9.9562 9.19129 10.0098 9.13057C10.6547 9.75124 11.1972 10.4701 11.6171 11.2606C11.5191 11.3685 11.4198 11.4693 11.3089 11.5702ZM4.28976 6.43502C4.28976 5.6765 4.59108 4.94904 5.12744 4.41269C5.66379 3.87633 6.39125 3.57501 7.14977 3.57501C7.90829 3.57501 8.63575 3.87633 9.1721 4.41269C9.70846 4.94904 10.0098 5.6765 10.0098 6.43502C10.0173 6.833 9.93161 7.22723 9.75953 7.58617C9.62311 7.922 9.41581 8.22442 9.15178 8.47277C8.61636 8.99528 7.89789 9.28776 7.14977 9.28776C6.40165 9.28776 5.68318 8.99528 5.14777 8.47277C4.88825 8.22059 4.68163 7.91917 4.54001 7.58617C4.37459 7.22498 4.28923 6.83229 4.28976 6.43502V6.43502ZM12.3178 10.3068C11.8572 9.53577 11.2896 8.83403 10.6318 8.22252C10.9293 7.6738 11.0842 7.05917 11.0823 6.43502C11.0823 5.39205 10.668 4.3918 9.93048 3.65431C9.19299 2.91682 8.19274 2.50251 7.14977 2.50251C6.1068 2.50251 5.10655 2.91682 4.36907 3.65431C3.63158 4.3918 3.21726 5.39205 3.21726 6.43502C3.21887 7.05874 3.37355 7.67253 3.66771 8.22252C3.00998 8.83492 2.44256 9.53764 1.98245 10.3096C1.38979 9.36215 1.07447 8.26757 1.07225 7.15002C1.07225 5.53816 1.71256 3.99232 2.85232 2.85257C3.99207 1.71281 5.53791 1.0725 7.14977 1.0725C8.76163 1.0725 10.3075 1.71281 11.4472 2.85257C12.587 3.99232 13.2273 5.53816 13.2273 7.15002C13.2247 8.26652 12.9096 9.36001 12.3178 10.3068V10.3068Z"/>
      </g>
    </svg>
  )
}

function IconBankCircle() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="18" fill="#DCF5E7"/>
      <g transform="translate(12.65,10.85) scale(0.65)">
        <path fillRule="evenodd" clipRule="evenodd" fill="#026C2A" d="M1.65 0V1.09982H16.5L13.2 6.59892L16.5 12.098H1.65V21.9964H0V0H1.65ZM13.5859 10.4473L11.7852 7.44703L11.2759 6.59797L11.7852 5.74891L13.5859 2.7486H1.64976V10.4473H13.5859Z"/>
      </g>
    </svg>
  )
}

function IconFaceCircle() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="18" fill="#DCF5E7"/>
      <g transform="translate(10.85,10.85)">
        <path fillRule="evenodd" clipRule="evenodd" fill="#026C2A" d="M0 7.15C0 3.20116 3.20116 0 7.15 0C9.0463 0 10.8649 0.753301 12.2058 2.09419C13.5467 3.43507 14.3 5.2537 14.3 7.15C14.3 11.0988 11.0988 14.3 7.15 14.3C3.20116 14.3 0 11.0988 0 7.15ZM1.07253 7.15003C1.07253 10.5065 3.79352 13.2275 7.15003 13.2275C8.76188 13.2275 10.3077 12.5872 11.4475 11.4475C12.5872 10.3077 13.2275 8.76188 13.2275 7.15003C13.2275 3.79352 10.5065 1.07253 7.15003 1.07253C3.79352 1.07253 1.07253 3.79352 1.07253 7.15003Z"/>
        <path fill="#026C2A" d="M7.14997 9.64751C6.52532 9.64843 5.92046 9.45572 5.41556 9.10266C5.1725 8.93268 4.83453 8.92714 4.62441 9.13647C4.41415 9.34594 4.412 9.68957 4.64744 9.87029C5.36155 10.4184 6.24056 10.7202 7.15068 10.7202C8.06148 10.7202 8.94112 10.418 9.65552 9.86907C9.89011 9.68881 9.88829 9.34637 9.67909 9.13717C9.46948 8.92756 9.13159 8.93275 8.88866 9.10261C8.38257 9.45648 7.7761 9.64926 7.14997 9.64751Z"/>
        <rect fill="#026C2A" x="5.18379" y="4.29004" width="1.0725" height="2.145" rx="0.53625"/>
        <rect fill="#026C2A" x="8.04375" y="4.29004" width="1.0725" height="2.145" rx="0.53625"/>
      </g>
    </svg>
  )
}

function IconPadlockCircle() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="18" fill="#DCF5E7"/>
      <g transform="translate(12.04,10.96)">
        <path fillRule="evenodd" clipRule="evenodd" fill="#026C2A" d="M10.8881 4.88692C10.1935 4.69498 9.48808 4.54449 8.77561 4.43625V2.81667C8.77561 1.81037 8.23875 0.880511 7.36727 0.377362C6.49579 -0.125787 5.42208 -0.125787 4.5506 0.377362C3.67913 0.880511 3.14227 1.81037 3.14227 2.81667V4.43625C2.4298 4.54449 1.72439 4.69498 1.02977 4.88692C0.661725 4.99173 0.351656 5.24083 0.169991 5.57764C-0.0116742 5.91445 -0.0495154 6.31038 0.0650624 6.6755L1.36777 10.7315C2.0069 12.7278 3.86281 14.0823 5.95894 14.0823C8.05507 14.0823 9.91097 12.7278 10.5501 10.7315L11.8528 6.6755C11.9674 6.31038 11.9296 5.91445 11.7479 5.57764C11.5662 5.24083 11.2562 4.99173 10.8881 4.88692ZM4.19852 2.81677C4.19852 1.84452 4.98669 1.05636 5.95894 1.05636C6.93119 1.05636 7.71936 1.84452 7.71936 2.81677V4.30256C7.1349 4.24623 6.5434 4.21806 5.95894 4.21806C5.37448 4.21806 4.78298 4.24623 4.19852 4.30256V2.81677ZM9.55017 10.4078L10.8458 6.35178C10.8728 6.26008 10.8627 6.16147 10.8177 6.07716C10.7719 5.99554 10.6961 5.93493 10.6064 5.90816C10.0043 5.73942 9.39304 5.60541 8.77558 5.50678C8.43054 5.44341 8.07142 5.40116 7.71933 5.36595C6.5489 5.24387 5.36894 5.24387 4.1985 5.36595C3.84642 5.40116 3.48729 5.44341 3.14225 5.50678C2.52479 5.6054 1.91351 5.73941 1.31142 5.90816C1.22173 5.93493 1.14598 5.99554 1.10017 6.07716C1.05516 6.16147 1.04505 6.26008 1.072 6.35178L2.36767 10.4078C2.86836 11.9685 4.31981 13.0272 5.95892 13.0272C7.59803 13.0272 9.04948 11.9685 9.55017 10.4078Z"/>
        <path fill="#026C2A" d="M5.95894 8.09811C5.57004 8.09811 5.25478 8.41337 5.25478 8.80227C5.25478 9.19118 5.57004 9.50644 5.95894 9.50644C6.34784 9.50644 6.66311 9.19118 6.66311 8.80227C6.66311 8.41337 6.34784 8.09811 5.95894 8.09811Z"/>
      </g>
    </svg>
  )
}

function IconClipboardCircle() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="18" fill="#DCF5E7"/>
      <g transform="translate(12.77,10.53)">
        <rect fill="#008859" x="3.73768" y="6.35151" width="2.99001" height="1.12126" rx="0.560628"/>
        <rect fill="#008859" x="3.73768" y="9.71723" width="2.99001" height="1.12126" rx="0.560628"/>
        <path fillRule="evenodd" clipRule="evenodd" fill="#008859" d="M8.97005 1.49493H7.81889C7.28609 0.570006 6.29994 0 5.23253 0C4.16512 0 3.17896 0.570006 2.64616 1.49493H1.49501C0.67036 1.4974 0.00246288 2.16529 0 2.98994V13.455C0.00246288 14.2796 0.67036 14.9475 1.49501 14.95H8.97005C9.79469 14.9475 10.4626 14.2796 10.4651 13.455V2.98994C10.4626 2.16529 9.79469 1.4974 8.97005 1.49493ZM4.11884 1.494C4.63107 1.1131 5.30229 1.02001 5.89885 1.24713C6.49541 1.47424 6.93477 1.99015 7.06401 2.61525H3.40124C3.49146 2.16478 3.74757 1.76461 4.11884 1.494ZM8.96988 13.8275C9.1763 13.8275 9.34364 13.6602 9.34364 13.4538V2.98872C9.34364 2.7823 9.1763 2.61497 8.96988 2.61497H8.19996C8.21511 2.73897 8.22259 2.86379 8.22238 2.98872C8.22238 3.40155 7.88771 3.73622 7.47488 3.73622H2.98985C2.57702 3.73622 2.24235 3.40155 2.24235 2.98872C2.24214 2.86379 2.24963 2.73897 2.26477 2.61497H1.49485C1.28843 2.61497 1.12109 2.7823 1.12109 2.98872V13.4538C1.12109 13.6602 1.28843 13.8275 1.49485 13.8275H8.96988Z"/>
      </g>
    </svg>
  )
}
