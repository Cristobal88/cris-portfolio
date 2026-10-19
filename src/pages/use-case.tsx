import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCaseStudy } from '@/hooks/useCaseStudy'
import { useThemeColor } from '@/lib/useThemeColor'
import { AppDock } from '@/components/blocks/app-dock'
import { PersonalCta } from '@/components/blocks/personal-cta'
import { PersonalFooter } from '@/components/blocks/personal-footer'
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
const PHONE_CHROME_RESERVE = 120

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

function TipFlowSection({ visual, annotations }: { visual: TipFlowVisual; annotations: Annotation[] }) {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'propi-step' && typeof e.data.step === 'number') {
        setActiveStep(e.data.step)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const jumpToStep = (step: number) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'propi-jump', step }, '*')
  }

  return (
    <div className="tip-flow-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
      {/* Left: title always visible; rows desktop-only */}
      <div>
        <h3 style={{ fontSize: 'clamp(20px, 2vw, 30px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, marginBottom: 12, lineHeight: 1.25 }}>
          Try the feature
        </h3>
        {/* Mobile-only hint — hidden on desktop via CSS */}
        <p className="tip-mobile-hint" style={{ fontSize: '1rem', lineHeight: 1.75, color: T2, margin: '0 0 16px' }}>
          This is a fully interactive demo. Tap through the flow below.
        </p>
        {/* Mobile-only step pills — hidden on desktop via CSS */}
        <div className="tip-step-pills">
          {(['Start', 'Add alias', 'Add amount', 'Send'] as const).map((label, step) => {
            const isActive = activeStep === step
            return (
              <button
                key={step}
                onClick={() => jumpToStep(step)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: 100,
                  border: `1px solid ${isActive ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)'}`,
                  background: isActive ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? T1 : T3,
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'Barlow, sans-serif',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        {/* Annotation rows — desktop only */}
        <div className="tip-annotations" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {annotations.map((ann, ai) => {
            const isActive  = activeStep === ai
            const isHovered = hoveredRow === ai
            const showDividerBelow = false // gap between rows replaces dividers
            return (
              <div
                key={ai}
                onClick={() => jumpToStep(ai)}
                onMouseEnter={() => setHoveredRow(ai)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  padding: '14px 10px',
                  borderRadius: 14,
                  ...(isActive
                    ? {
                        border: '1px solid rgba(255,255,255,0.10)',
                        background: 'rgba(255,255,255,0.07)',
                      }
                    : {
                        border: 'none',
                        borderBottom: showDividerBelow ? `1px solid ${BORDER}` : 'none',
                        background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                      }
                  ),
                  transition: 'background 0.18s ease',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: isActive ? T1 : T2, margin: 0, lineHeight: 1.4, transition: 'color 0.18s ease' }}>{ann.screen}</p>
                  <ArrowRight size={12} color={isActive ? T2 : T4} style={{ transition: 'color 0.18s ease', flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: '0.8125rem', color: isActive ? T2 : T3, margin: 0, lineHeight: 1.6, transition: 'color 0.18s ease' }}>{ann.left}</p>
                {ann.right && isActive && (
                  <p style={{ fontSize: '0.75rem', color: T3, margin: '6px 0 0', lineHeight: 1.5, paddingLeft: 10, borderLeft: `2px solid ${BORDER}` }}>{ann.right}</p>
                )}
              </div>
            )
          })}
        </div>
        {/* end tip-annotations */}
      </div>
      {/* Right: phone demo */}
      <ScaledPhone src="/demo/propi?embed" iframeRef={iframeRef} />
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

  return (
    <div style={{ background: '#050505', color: T1, fontFamily: 'Barlow, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <div className="gradient-blur" />
      <div className="gradient-blur-bottom" />
      <AppDock variant="dark" />

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

          {/* Scope pill */}
          <div style={{ marginBottom: 28 }}>
            <span style={{ display: 'inline-block', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.027em', color: T4, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 9999, padding: '5px 14px' }}>
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
      <section className="cs-section" style={{ background: '#080808', borderTop: `1px solid rgba(255,255,255,0.05)` }}>
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
      <section className="cs-section" style={{ background: '#080808', borderTop: `1px solid rgba(255,255,255,0.05)` }}>
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
                      screen: 'Tap to start',
                      left: 'Select a step to jump to it in the demo. Or tap through the flow on the right to see each decision in sequence.',
                      right: null,
                    },
                    {
                      screen: 'Enter the alias',
                      left: 'The format every Argentine already uses for transfers. Familiar means trusted.',
                      right: null,
                    },
                    {
                      screen: 'Pick an amount',
                      left: 'Tap the amount without awkward negotiation.',
                      right: null,
                    },
                    {
                      screen: 'Sent the tip',
                      left: 'Instant bank confirmation for peace of mind.',
                      right: null,
                    },
                  ]
                  return (
                    <TipFlowSection key={i} visual={visual} annotations={annotations} />
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
      <section className="cs-section" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-0.03em', textWrap: 'balance', color: T1, marginBottom: 48 }}>
            {project.decisionTitle ?? 'The decision'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {project.keyDecisions.map((decision, i) => (
              <div key={i} className="decision-grid decision-row" style={{ padding: '48px 0', borderTop: `1px solid ${BORDER}`, alignItems: 'start' }}>
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <AnimatedNumber value={`0${i + 1}`} style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.09em', color: T4 }} />
                  </div>
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: T3, margin: 0 }}>{decision.challenge}</p>
                </div>
                <p style={{ fontSize: 'clamp(16px, 1.5vw, 19px)', lineHeight: 1.75, color: T2, margin: 0 }}>{decision.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="cs-section" style={{ background: '#080808', borderTop: `1px solid rgba(255,255,255,0.05)` }}>
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

