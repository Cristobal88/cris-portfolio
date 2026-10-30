import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCaseStudy } from '@/hooks/useCaseStudy'
import { useThemeColor } from '@/lib/useThemeColor'
import { AppDock } from '@/components/blocks/app-dock'
import { PersonalCta } from '@/components/blocks/personal-cta'
import { PersonalFooter } from '@/components/blocks/personal-footer'
import { CaseStudyTOC } from '@/components/blocks/case-study-toc'
import { AnimatedNumber } from '@/components/ui/animated-number'

const BLUE    = '#0044d4'
const SURFACE = 'rgba(255,255,255,0.05)'
const BORDER  = 'rgba(255,255,255,0.08)'

const T1 = '#ffffff'
const T2 = 'rgba(255,255,255,0.78)'
const T3 = 'rgba(255,255,255,0.55)'
const T4 = 'rgba(255,255,255,0.40)'

const PAGE_TITLES: Record<string, string> = {
  'fintech-tipping-flow': 'Digital Tipping — Cristobal Lemoine',
  'loyalty-club-payments': 'Loyalty Platform — Cristobal Lemoine',
}

// Scales the phone to fit both its column width and the viewport height.
// Uses the more restrictive of the two constraints so the phone never overflows.
// 120px is reserved for the fixed dock/back link + breathing room at top/bottom.
const PHONE_W = 390
const PHONE_H = 844
const PHONE_CHROME_RESERVE = 200 // includes ~88px dock clearance at bottom

function ScaledPhone({ src, iframeRef }: { src: string; iframeRef?: React.RefObject<HTMLIFrameElement> }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = outerRef.current
    if (!el) return
    const measure = () => {
      const w = el.getBoundingClientRect().width
      const vh = window.innerHeight
      // On mobile: reserve more space for browser chrome + fixed dock (180px).
      // On desktop: 120px is enough.
      const reserve = window.innerWidth < 768 ? 180 : PHONE_CHROME_RESERVE
      const scaleByW = w > 0 ? w / PHONE_W : 1
      const scaleByH = (vh - reserve) / PHONE_H
      setScale(Math.min(1, scaleByW, scaleByH))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
    <div ref={outerRef} style={{ width: '100%', maxWidth: PHONE_W, overflow: 'hidden' }}>
      <div style={{
        width: Math.round(PHONE_W * scale),
        height: Math.round(PHONE_H * scale),
        margin: '0 auto',
        overflow: 'hidden',
        borderRadius: Math.round(50 * scale),
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
      }}>
        <div style={{ width: PHONE_W, height: PHONE_H, transformOrigin: 'top left', transform: `scale(${scale})` }}>
          <iframe
            ref={iframeRef}
            src={src}
            width={PHONE_W}
            height={PHONE_H}
            style={{ border: 'none', display: 'block' }}
            title="Tipping flow interactive demo"
          />
        </div>
      </div>
    </div>
    </div>
  )
}

type Annotation = { screen: string; left: string; right: string | null }
type TipFlowVisual = { title?: string | null; caption?: string | null; image?: string | null }

// ── Scroll-driven showcase (Glossar-style) ─────────────────────────────────
// Scroll is the single source of truth.
// Each step gets VH_PER_STEP of scroll travel so advancing is deliberate.
// Left words progressively bold (L→R) during first LEFT_PHASE of step progress.
// Right annotation fades in after all left words are bold.
// A vertical line on the left tracks total progress.
// On mobile: pill nav fallback.

const STEP_LABELS = ['Start', 'Enter alias', 'Pick amount', 'Send']
const VH_PER_STEP = 300
// First 65% of step travel: words bold L→R. Last 35%: right annotation fades in.
const LEFT_PHASE = 0.65

// Renders text as progressively-bolding words (Glossar-style).
// progress 0 = all normal weight, progress 1 = all bold.
function WordByWord({ text, progress }: { text: string; progress: number }) {
  const words = text.split(' ')
  const n = words.length
  return (
    <>
      {words.map((word, i) => {
        // Word i snaps to bold once progress crosses its threshold
        const isBold = progress >= (i + 1) / n
        return (
          <React.Fragment key={i}>
            <span style={{ fontWeight: isBold ? 700 : 300 }}>{word}</span>
            {i < n - 1 ? ' ' : ''}
          </React.Fragment>
        )
      })}
    </>
  )
}

function TipFlowSection({ annotations }: { visual?: TipFlowVisual; annotations: Annotation[] }) {
  const containerRef   = useRef<HTMLDivElement>(null)
  const iframeRef      = useRef<HTMLIFrameElement>(null)
  const [rawProgress, setRawProgress] = useState(0) // 0–1 across entire section
  const [mobileStep,  setMobileStep]  = useState(0)
  const [isMobile,    setIsMobile]    = useState(false)
  const [isTablet,    setIsTablet]    = useState(false)
  const [demoStep,    setDemoStep]    = useState(0) // tracks iframe screen
  const [tapStep,     setTapStep]     = useState<number | null>(null) // set when user taps inside demo

  const steps = annotations.length

  useEffect(() => {
    const w = window.innerWidth
    setIsMobile(w < 768)
    setIsTablet(w >= 768 && w < 1024)
  }, [])

  // Scroll → rawProgress (desktop)
  useEffect(() => {
    if (isMobile) return
    const onScroll = () => {
      const el = containerRef.current
      if (!el) return
      const { top, height } = el.getBoundingClientRect()
      const vh = window.innerHeight
      const travel = height - vh
      if (travel <= 0) return
      setRawProgress(Math.max(0, Math.min(1, -top / travel)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isMobile])

  // Derive step index from rawProgress
  const scrollStep = Math.min(steps - 1, Math.floor(rawProgress * steps))
  // Progress within current step (0–1)
  const stepProgress = (rawProgress * steps) - scrollStep

  // Push to iframe on step change (desktop).
  // If tap is driving: don't interrupt — only hand scroll back when it catches up (scrollStep >= tapStep).
  useEffect(() => {
    if (isMobile) return
    if (tapStep === null) {
      // Scroll is driving — keep iframe in sync
      iframeRef.current?.contentWindow?.postMessage({ type: 'propi-jump', step: scrollStep }, '*')
    } else if (scrollStep >= tapStep) {
      // Scroll caught up to or passed the tapped step — hand control back to scroll
      setTapStep(null)
      iframeRef.current?.contentWindow?.postMessage({ type: 'propi-jump', step: scrollStep }, '*')
    }
    // scrollStep < tapStep: user tapped ahead, don't interrupt
  }, [scrollStep, tapStep, isMobile])

  // Scroll-controlled signals for last step transitions (desktop only)
  const sliderFiredRef   = useRef(false)
  const completeFiredRef = useRef(false)
  const prevRawProgressRef = useRef(0)
  useEffect(() => {
    sliderFiredRef.current  = false
    completeFiredRef.current = false
  }, [scrollStep])

  // Reset demo when user scrolls backward after success so they can replay it
  useEffect(() => {
    if (isMobile) return
    const wentBack = rawProgress < prevRawProgressRef.current
    if (wentBack && demoStep === 3 && scrollStep === steps - 1) {
      sliderFiredRef.current  = false
      completeFiredRef.current = false
      iframeRef.current?.contentWindow?.postMessage({ type: 'propi-jump', step: steps - 1 }, '*')
    }
    prevRawProgressRef.current = rawProgress
  }, [rawProgress, demoStep, scrollStep, steps, isMobile])
  useEffect(() => {
    if (isMobile || scrollStep !== steps - 1) return
    if (!sliderFiredRef.current && stepProgress >= 0.20) {
      sliderFiredRef.current = true
      iframeRef.current?.contentWindow?.postMessage({ type: 'propi-slider-go' }, '*')
    }
    if (!completeFiredRef.current && stepProgress >= 0.65) {
      completeFiredRef.current = true
      iframeRef.current?.contentWindow?.postMessage({ type: 'propi-complete' }, '*')
    }
  }, [stepProgress, scrollStep, steps, isMobile])

  // Mobile: pills push to iframe
  useEffect(() => {
    if (!isMobile) return
    iframeRef.current?.contentWindow?.postMessage({ type: 'propi-jump', step: mobileStep }, '*')
  }, [mobileStep, isMobile])

  // Always track the iframe's current screen so annotations stay in sync.
  // On desktop/tablet: also set tapStep so annotations follow manual taps.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'propi-step' && typeof e.data.step === 'number') {
        setDemoStep(e.data.step)
        // Do NOT sync mobileStep from propi-step — it would send propi-jump back
        // and reset the demo mid-flow (e.g. success → amount loop).
        if (!isMobile) setTapStep(e.data.step)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [isMobile])

  // ── Mobile ─────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ padding: '64px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h3 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 500, letterSpacing: '-0.03em', color: T1, margin: '0 0 10px', lineHeight: 1.25 }}>
          Try it yourself
        </h3>
        <p style={{ fontSize: '1rem', lineHeight: 1.75, color: T2, margin: '0 0 28px' }}>
          Tap through the flow below.
        </p>
        <ScaledPhone src="/demo/propi?embed" iframeRef={iframeRef} />
      </div>
    )
  }

  // tapStep overrides scrollStep when the user taps inside the demo directly.
  // Falls back to scrollStep when null (scroll is driving).
  const activeStep = tapStep ?? scrollStep

  // When the demo reaches success (demoStep 3 = showSuccess), override the last step's copy
  const SUCCESS_ANN: Annotation = {
    screen: 'Sent',
    left: 'Done. The tip is on its way, just like any other transfer.',
    right: null,
  }
  const ann = (activeStep === steps - 1 && demoStep === 3)
    ? SUCCESS_ANN
    : annotations[activeStep] ?? annotations[0]
  const totalVh = 100 + (steps - 1) * VH_PER_STEP
  // When tap-driven: show annotation fully immediately (user already arrived there)
  const leftProgress  = tapStep !== null ? 1 : Math.min(1, stepProgress / LEFT_PHASE)
  const rightOpacity  = tapStep !== null ? 1 : Math.max(0, Math.min(1, (stepProgress - LEFT_PHASE) / (1 - LEFT_PHASE)))
  // Vertical line fill: total progress across all steps
  const lineFill = `${rawProgress * 100}%`

  // ── Tablet layout (768–1199px): centered header + phone / right annotation ──
  if (isTablet) {
    return (
      <div ref={containerRef} style={{ height: `${totalVh}vh`, position: 'relative' }}>
        <div style={{
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '0 clamp(32px, 5vw, 80px)', boxSizing: 'border-box', gap: 36,
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 500, letterSpacing: '-0.03em', color: T1, margin: '0 0 10px', lineHeight: 1.25 }}>
              Try it yourself
            </h3>
            <p style={{ fontSize: 'clamp(14px, 1.8vw, 17px)', lineHeight: 1.6, color: T3, margin: 0 }}>
              Scroll to step through the flow, or drag the elements directly.
            </p>
          </div>

          {/* Left annotation + phone — equal halves */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'clamp(24px, 4vw, 64px)', width: '100%', justifyContent: 'center' }}>
            <div style={{ flex: 1, maxWidth: 360, display: 'flex', alignItems: 'center', gap: 24 }}>
              {/* Vertical progress line */}
              <div style={{ position: 'relative', width: 2, height: 80, flexShrink: 0, background: 'rgba(255,255,255,0.10)', borderRadius: 1 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: lineFill, background: T1, borderRadius: 1 }} />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`left-tablet-${activeStep}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontSize: 'clamp(16px, 2vw, 22px)', lineHeight: 1.55, color: T1, margin: 0 }}
                >
                  <WordByWord text={ann.left} progress={leftProgress} />
                </motion.p>
              </AnimatePresence>
            </div>
            <div style={{ flexShrink: 0 }}>
              <ScaledPhone src="/demo/propi?embed" iframeRef={iframeRef} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Desktop layout (1200px+): left annotation + phone + right annotation ───
  return (
    <div ref={containerRef} style={{ height: `${totalVh}vh`, position: 'relative' }}>
      {/* Sticky inner — flex row, centered above the dock */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0 clamp(48px, 6vw, 120px)',
        gap: 'clamp(32px, 5vw, 80px)',
        boxSizing: 'border-box',
      }}>

        {/* Left annotation */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'flex-end' }}>
          <div style={{ maxWidth: 380, width: '100%', display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Vertical progress line */}
          <div style={{ position: 'relative', width: 2, height: 80, flexShrink: 0, background: 'rgba(255,255,255,0.10)', borderRadius: 1 }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%',
              height: lineFill,
              background: T1,
              borderRadius: 1,
            }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={`left-${activeStep}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(18px, 1.8vw, 24px)',
                lineHeight: 1.55,
                color: T1,
                margin: 0,
              }}
            >
              <WordByWord text={ann.left} progress={leftProgress} />
            </motion.p>
          </AnimatePresence>
          </div>
        </div>

        {/* Center: phone — fixed width, centered by flex */}
        <div style={{ flexShrink: 0 }}>
          <ScaledPhone src="/demo/propi?embed" iframeRef={iframeRef} />
        </div>

        {/* Right annotation */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: 380, width: '100%' }}>
          <AnimatePresence mode="wait">
            {ann.right && (
              <motion.p
                key={`right-${activeStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: rightOpacity, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(18px, 1.8vw, 24px)',
                  lineHeight: 1.55,
                  color: T3,
                  margin: 0,
                }}
              >
                {ann.right}
              </motion.p>
            )}
          </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function CaseStudy() {
  useThemeColor('#050505')
  const { slug } = useParams<{ slug: string }>()
  const { data: project, nextProject, loading, notFound } = useCaseStudy(slug)

  useEffect(() => {
    if (!slug) return
    document.title = PAGE_TITLES[slug] ?? 'Cristobal Lemoine — Staff Product Designer'
  }, [slug])

  if (loading) {
    const rm = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return (
      <div style={{ background: '#050505', color: T1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow, sans-serif' }}>
        {rm ? (
          /* Reduced motion: three dots pulsing with opacity */
          <div role="status" aria-label="Loading" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: BLUE,
                animation: `dot-pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
            <style>{`@keyframes dot-pulse { 0%,70%,100%{opacity:.2} 35%{opacity:1} }`}</style>
          </div>
        ) : (
          /* Normal: refined spinning arc with trailing fade */
          <div role="status" aria-label="Loading">
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `2px solid ${BORDER}`,
              borderTopColor: BLUE,
              borderRightColor: `rgba(0, 68, 212, 0.35)`,
              animation: 'spin 0.75s cubic-bezier(0.5, 0, 0.5, 1) infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div style={{ background: '#050505', color: T1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow, sans-serif', gap: 16 }}>
        <p style={{ color: T3, fontSize: '0.875rem' }}>Project not found.</p>
        <a href="/" style={{ color: BLUE, fontSize: '0.875rem', textDecoration: 'none' }}>← Back to home</a>
      </div>
    )
  }

  const altVisuals  = project.workVisuals.slice(0, 2)
  const wideVisuals = project.workVisuals.slice(2)

  const hasLiveDemo = slug === 'fintech-tipping-flow'

  const tocItems = [
    { id: 'cs-problem',  label: 'The problem' },
    { id: 'cs-work',     label: 'Process'     },
    ...(hasLiveDemo ? [{ id: 'cs-live-demo', label: 'Live demo', scrollBlock: 'center' as ScrollLogicalPosition }] : []),
    { id: 'cs-results',  label: 'Results'     },
  ]

  return (
    <div style={{ background: '#050505', color: T1, fontFamily: 'Barlow, sans-serif', minHeight: '100vh', overflowX: 'clip' }}>
      <div className="gradient-blur gradient-blur--dark" />
      <div className="gradient-blur-bottom" />
      <AppDock variant="dark" />
      <CaseStudyTOC items={tocItems} />

      {/* ── Back link — fixed, desktop only, aligned with dock ── */}
      <div
        className="cs-back-fixed"
        style={{
          position: 'fixed', top: 28, left: 0, right: 0,
          display: 'none',
          pointerEvents: 'none', zIndex: 100,
        }}
      >
        <div style={{ maxWidth: 1152, margin: '0 auto', width: '100%', padding: '0 clamp(16px, 4vw, 32px)', pointerEvents: 'none' }}>
          <a
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: T3, textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 500,
              transition: 'color 0.2s ease', pointerEvents: 'auto',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = T1)}
            onMouseLeave={e => (e.currentTarget.style.color = T3)}
          >
            <ArrowLeft size={12} strokeWidth={2.5} />
            Back
          </a>
        </div>
      </div>

      <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
      {/* ── Hero ── */}
      <section className="cs-hero" style={{ paddingBottom: 0 }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', paddingTop: 0 }}>

          {/* Back link — mobile only (scrolls with content) */}
          <a href="/"
            className="cs-back-mobile"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T3, textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 20, transition: 'color 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = T1)}
            onMouseLeave={e => (e.currentTarget.style.color = T3)}
          >
            <ArrowLeft size={12} strokeWidth={2.5} />
            Back
          </a>

          {/* Scope tags */}
          <div style={{ marginBottom: 28 }}>
            <span style={{ display: 'inline-block', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.027em', color: T4 }}>
              {project.scopePill}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(40px, 4.5vw, 72px)', lineHeight: 1.08, letterSpacing: '-0.025em', textWrap: 'balance', color: T1, maxWidth: 900, margin: '0 0 48px' }}>
            {project.outcomeHeadline}
          </h1>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', justifyContent: 'start', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, paddingTop: 28, paddingBottom: 28 }}>
            {project.stats.map((stat, i) => (
              <div key={i} style={{ paddingRight: i < 2 ? 48 : 0, paddingLeft: i > 0 ? 48 : 0, borderRight: i < 2 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ marginBottom: 6 }}>
                  <AnimatedNumber value={stat.value} style={{ fontFamily: 'Barlow, sans-serif', fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 700, letterSpacing: '-0.06em', fontVariantNumeric: 'tabular-nums', color: T1, lineHeight: 1 }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: T4, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image */}
        <div style={{ padding: '64px 12px 0', position: 'relative' }}>
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: `1px solid ${BORDER}`, boxShadow: '0 48px 120px rgba(0,0,0,0.6)', aspectRatio: '21/9' }}>
            <img src={project.heroImage} alt={project.label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 12, right: 12,
            height: '55%',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(5,5,5,0.7) 55%, #050505 80%)',
            pointerEvents: 'none',
            borderRadius: '0 0 20px 20px',
          }} />
        </div>
      </section>

      {/* ── Context ── (temporarily hidden) */}
      {false && project.context && (
        <section className="cs-section--sm" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64, alignItems: 'start' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, lineHeight: 1.1, margin: 0 }}>
                  {project.contextTitle ?? 'The context'}
                </h2>
              </div>
              <div>
                {project.context.split('\n\n').map((para, i, arr) => (
                  <p key={i} style={{ fontSize: '1.0625rem', lineHeight: 1.8, textWrap: 'pretty', color: T2, marginBottom: i < arr.length - 1 ? 18 : 0 }}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── The Problem ── */}
      <section id="cs-problem" className="cs-section" style={{ background: '#080808', borderTop: `1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px' }}>
          {project.problemHeadline ? (
            <>
              <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', marginBottom: 64 }}>
                <h2 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(30px, 3.2vw, 52px)', lineHeight: 1.12, letterSpacing: '-0.02em', textWrap: 'balance', color: T1, marginBottom: 28 }}>
                  {project.problemHeadline}
                </h2>
                {project.problemExpanded.split('\n\n').map((para, i, arr) => (
                  <p key={i} style={{ fontSize: '1rem', lineHeight: 1.75, textWrap: 'pretty', color: T3, marginBottom: i < arr.length - 1 ? 12 : 0 }}>{para}</p>
                ))}
              </div>
              {project.problemInsights && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48 }}>
                  {project.problemInsights.map((insight, i) => (
                    <div key={i}>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: T1, marginBottom: 12, letterSpacing: '-0.013em' }}>
                        {i + 1}. {insight.title}
                      </p>
                      <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: T3, margin: 0 }}>{insight.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64 }}>
              <div>
                <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, marginBottom: 20, lineHeight: 1.2 }}>
                  What was broken
                </h2>
                {project.problemExpanded.split('\n\n').map((para, i, arr) => (
                  <p key={i} style={{ fontSize: '1rem', lineHeight: 1.75, textWrap: 'pretty', color: T2, marginBottom: i < arr.length - 1 ? 16 : 0 }}>{para}</p>
                ))}
              </div>
              <div>
                <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, marginBottom: 20, lineHeight: 1.2 }}>
                  Our role
                </h2>
                <p style={{ fontSize: '1rem', lineHeight: 1.75, textWrap: 'pretty', color: T2, marginBottom: 32 }}>{project.ourRole}</p>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.027em', color: T4, marginBottom: 14 }}>Deliverables</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {project.deliverables.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9375rem', lineHeight: 1.6, color: T2 }}>
                      <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: BLUE, flexShrink: 0, marginTop: 7 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── The Work ── */}
      <section id="cs-work" className="cs-section" style={{ background: '#080808', borderTop: `1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, margin: 0 }}>
              {project.designTitle ?? 'The design'}
            </h2>
            <span style={{ fontSize: '0.75rem', color: T4, fontWeight: 500 }}>Some visuals and values have been altered to comply with NDA. The outcomes and decisions shown are real.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
            {altVisuals.map((visual, i) => {
              const imageLeft = i % 2 === 0
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48, alignItems: 'center' }}>
                  <div style={{ order: imageLeft ? 0 : 1 }}>
                    <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${BORDER}`, background: SURFACE, aspectRatio: '4/3' }}>
                      <img src={visual.image} alt={visual.title ?? visual.caption ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  </div>
                  <div style={{ order: imageLeft ? 1 : 0 }}>
                    {visual.title && (
                      <h3 style={{ fontSize: 'clamp(20px, 2vw, 30px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, marginBottom: 16, lineHeight: 1.25 }}>
                        {visual.title}
                      </h3>
                    )}
                    <p style={{ fontSize: '1rem', lineHeight: 1.75, textWrap: 'pretty', color: T2, margin: 0 }}>{visual.caption}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {wideVisuals.length > 0 && (
            <div style={{ marginTop: 120, display: 'flex', flexDirection: 'column', gap: 96 }}>
              {wideVisuals.map((visual, i) => {
                // Interactive demo: replace "The tip flow" image with annotated demo layout
                if (visual.title === 'The tip flow') {
                  const annotations = [
                    {
                      screen: 'Tap Dejar Propina',
                      left: 'Imagine you just paid for lunch and want to tip the person who served you. This is what shows up, without you asking for it.',
                      right: 'Only shows at restaurants. Every other merchant, nothing.',
                    },
                    {
                      screen: 'Enter the alias',
                      left: 'You type the alias the server gives you and tap Continue. Same field people already use to send money.',
                      right: 'The demo types it for you. In real life you ask the person.',
                    },
                    {
                      screen: 'Pick an amount',
                      left: 'Type the amount you want to give. It goes straight to their pocket.',
                      right: 'The demo fills in an amount. In real life you type whatever you want.',
                    },
                    {
                      screen: 'Confirm and send',
                      left: 'One last look before it goes. Everything visible before the money moves.',
                      right: 'Yes, you can do the swipe up by dragging or keep scrolling',
                    },
                  ]
                  return (
                    // Full-bleed breakout from maxWidth: 1152 container
                    <div key={i} id="cs-live-demo" style={{
                      position: 'relative',
                      left: '50%',
                      marginLeft: '-50vw',
                      marginRight: '-50vw',
                      right: '50%',
                      width: '100vw',
                    }}>
                      <TipFlowSection annotations={annotations} />
                    </div>
                  )
                }

                return (
                  <div key={i}>
                    <div style={{ maxWidth: 680, marginBottom: 32 }}>
                      {visual.title && (
                        <h3 style={{ fontSize: 'clamp(20px, 2vw, 30px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, marginBottom: 14, lineHeight: 1.25 }}>
                          {visual.title}
                        </h3>
                      )}
                      <p style={{ fontSize: '1rem', lineHeight: 1.75, textWrap: 'pretty', color: T2, margin: 0 }}>{visual.caption}</p>
                    </div>
                    <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${BORDER}`, background: SURFACE, aspectRatio: '21/9' }}>
                      <img src={visual.image} alt={visual.title ?? visual.caption ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Key Decisions ── */}
      <section id="cs-decisions" className="cs-section" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, marginBottom: 48 }}>
            {project.decisionTitle ?? 'The decision'}
          </h2>
          <div style={{ borderTop: `1px solid ${BORDER}` }}>
            {project.keyDecisions.map((decision, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1.2fr', gap: '0 48px', padding: '36px 0', borderBottom: `1px solid ${BORDER}`, alignItems: 'start' }}>
                {/* Number */}
                <span style={{ fontSize: '1rem', fontWeight: 400, color: T4, paddingTop: 3 }}>{i + 1}</span>
                {/* Title */}
                <p style={{ fontSize: 'clamp(17px, 1.6vw, 20px)', fontWeight: 700, lineHeight: 1.35, color: T1, margin: 0 }}>{decision.challenge}</p>
                {/* Description */}
                <p style={{ fontSize: 'clamp(13px, 1.1vw, 15px)', lineHeight: 1.7, color: T3, margin: 0 }}>{decision.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section id="cs-results" className="cs-section" style={{ background: '#080808', borderTop: `1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, marginBottom: 48 }}>
            {project.proofTitle ?? 'The proof'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 48, marginBottom: 48 }}>
            {project.results.map((result, i) => (
              <div key={i}>
                <div style={{ marginBottom: 10 }}>
                  <AnimatedNumber value={result.value} style={{ fontFamily: 'Barlow, sans-serif', fontSize: 'clamp(34px, 3.5vw, 52px)', fontWeight: 700, letterSpacing: '-0.06em', fontVariantNumeric: 'tabular-nums', color: T1, lineHeight: 1 }} />
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: T3, marginBottom: 10 }}>{result.label}</div>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: T4, margin: 0 }}>{result.context}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, textWrap: 'pretty', color: T2, maxWidth: 680 }}>{project.resultsParagraph}</p>
        </div>
      </section>

      {/* ── Up Next ── */}
      {nextProject && (
        <section className="cs-section--sm" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.027em', color: T4, marginBottom: 20 }}>Up next</p>
            <p style={{ fontSize: 'clamp(20px, 2vw, 30px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, marginBottom: 20, lineHeight: 1.3, maxWidth: 640 }}>
              {nextProject.problem}
            </p>
            <a
              href={`/work/${nextProject.slug}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: T3, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = T1)}
              onMouseLeave={e => (e.currentTarget.style.color = T3)}
            >
              View case study <ArrowRight size={14} strokeWidth={2} />
            </a>
          </div>
        </section>
      )}

      <PersonalCta />
      </main>
      <PersonalFooter />
    </div>
  )
}

