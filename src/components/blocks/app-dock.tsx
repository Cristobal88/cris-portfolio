import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CtaButton } from '@/components/ui/cta-button'
import { useCaseStudies } from '@/hooks/useCaseStudies'
import { chime } from '@/lib/chime'
import type { Project } from '@/types/content'

// ── Spring ────────────────────────────────────────────────────────────────────
const SPRING = { type: 'spring' as const, stiffness: 280, damping: 24 }
const INSTANT = { duration: 0 }

// ── Thumbnail geometry ────────────────────────────────────────────────────────
const TW     = 80   // thumbnail width
const TH     = 60   // thumbnail height  (4 : 3)
const TG     = 6    // gap between thumbnails when spread
const BTN_H  = 36   // button height → dock = BTN_H + 2 × 6px padding = 48 px

// Thumbnails are centred on BTN_H; negative value means they bleed out of the dock
const BASE_TOP = (BTN_H - TH) / 2   // (36 - 60) / 2 = −12 px  →  bleed 12 px above & below

// ── Rotation angles ───────────────────────────────────────────────────────────
const REST_ROT  = [-8,  7] as const
const HOVER_ROT = [-4,  4] as const

function arcY(i: number, total: number): number {
  if (total <= 1) return 0
  const mid = (total - 1) / 2
  const t   = (i - mid) / mid      // −1 … 0 … +1
  return t * t * 5                  // subtle parabola: 0 at centre, ~5 px at edges
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface DockProject { project: Project; imgSrc: string }
interface AppDockProps { variant?: 'light' | 'dark' }

// ── Colour helpers ────────────────────────────────────────────────────────────
function textColor(isDark: boolean, hov: boolean) {
  return isDark
    ? (hov ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)')
    : (hov ? '#0d0d0d'                : 'rgba(0,0,0,0.55)')
}
function btnBg(isDark: boolean, hov: boolean) {
  return isDark
    ? (hov ? 'rgba(255,255,255,0.10)' : 'transparent')
    : (hov ? 'rgba(0,0,0,0.06)'       : 'transparent')
}

// ── Touch / mobile detection — disables work-hover interaction ────────────────
function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (max-width: 640px)')
    setIsTouch(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsTouch(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return isTouch
}

// ── Plain text nav button (used for Home, and Work on touch) ──────────────────
function DockTextButton({
  href,
  label,
  variant,
}: {
  href:    string
  label:   string
  variant: 'light' | 'dark'
}) {
  const [hov, setHov] = useState(false)
  const isDark = variant === 'dark'

  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 12px', height: BTN_H, borderRadius: 8,
        textDecoration: 'none',
        fontSize: '0.8125rem', fontWeight: 500,
        color:      textColor(isDark, hov),
        background: btnBg(isDark, hov),
        transition: 'background 0.18s ease, color 0.18s ease',
      }}
    >
      {label}
    </a>
  )
}

// ── Work button with spreading project thumbnails (desktop only) ──────────────
function WorkDockButton({
  dockProjects,
  variant,
}: {
  dockProjects: DockProject[]
  variant:      'light' | 'dark'
}) {
  const isTouch = useIsTouch()
  const reducedMotion = useReducedMotion()
  const [hov, setHov]     = useState(false)
  const isDark = variant === 'dark'
  const total  = dockProjects.length

  // On touch devices: plain link, no thumbnail interaction
  if (isTouch) {
    return <DockTextButton href="/#work" label="Projects" variant={variant} />
  }

  const spreadW = total > 0 ? total * TW + (total - 1) * TG : 0
  const spring = reducedMotion ? INSTANT : SPRING

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => { setHov(true); chime.workHover() }}
      onMouseLeave={() => setHov(false)}
    >
      {/* "Work" text label */}
      <div
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 12px', height: BTN_H, borderRadius: 8,
          fontSize: '0.8125rem', fontWeight: 500,
          color:      textColor(isDark, hov),
          background: btnBg(isDark, hov),
          transition: 'background 0.18s ease, color 0.18s ease',
          userSelect: 'none',
          cursor: 'default',
        }}
      >
        Projects
      </div>

      {/* Thumbnail strip — height matches BTN_H so dock stays 48 px;
          thumbnails bleed via overflow: visible                          */}
      <motion.div
        style={{
          position: 'relative',
          height: BTN_H,
          overflow: 'visible',
          flexShrink: 0,
        }}
        initial={{ width: 0 }}
        animate={{ width: hov && total > 0 ? spreadW + 4 : 0 }}
        transition={spring}
      >
        {dockProjects.map(({ project, imgSrc }, i) => (
          <motion.a
            key={project.slug}
            href={`/work/${project.slug}`}
            style={{
              position: 'absolute',
              top: BASE_TOP,
              left: 0,
              width: TW,
              height: TH,
              borderRadius: 7,
              overflow: 'hidden',
              textDecoration: 'none',
              border: isDark
                ? '1.5px solid rgba(255,255,255,0.18)'
                : '1.5px solid rgba(255,255,255,0.90)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.35)',
              zIndex: hov ? i + 1 : total - i,
            }}
            className="dock-thumb"
            initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.72, x: 0, y: 0, rotate: reducedMotion ? 0 : (REST_ROT[i] ?? 0) }}
            animate={{
              x:       hov ? i * (TW + TG) : (reducedMotion ? 0 : i * 6),
              y:       hov ? (reducedMotion ? 0 : arcY(i, total)) : 0,
              rotate:  reducedMotion ? 0 : (hov ? HOVER_ROT[i] ?? 0 : REST_ROT[i] ?? 0),
              opacity: hov ? 1 : 0,
              scale:   hov ? 1 : (reducedMotion ? 1 : 0.72),
            }}
            transition={{ ...spring, delay: hov && !reducedMotion ? i * 0.04 : 0 }}
            onClick={e => { e.stopPropagation(); chime.thumbClick() }}
          >
            <img
              src={imgSrc}
              alt={project.label}
              width={TW}
              height={TH}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              draggable={false}
            />
          </motion.a>
        ))}
      </motion.div>
    </div>
  )
}

// ── AppDock ───────────────────────────────────────────────────────────────────
export function AppDock({ variant = 'light' }: AppDockProps) {
  const isDark = variant === 'dark'
  const { data: projects } = useCaseStudies()

  const currentSlug =
    typeof window !== 'undefined'
      ? (window.location.pathname.match(/^\/work\/([^/]+)/)?.[1] ?? null)
      : null

  const dockProjects: DockProject[] = (projects ?? [])
    .filter(p => !p.locked)
    .map((p, i) => ({
      project: p,
      imgSrc:  p.cardImage ?? `/card-${i + 1}.webp`,
    }))
    .filter(({ project }) => project.slug !== currentSlug)

  return (
    <nav className="app-dock">
      <div
        className="app-dock-inner"
        style={{
          display: 'flex', alignItems: 'center', gap: 2,
          background: isDark ? 'rgba(20,20,20,0.80)' : 'rgba(255,255,255,0.72)',
          borderRadius: 14, padding: 6,
          // No overflow: hidden — thumbnails bleed above/below the dock
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.50), 0 1px 4px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.80)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.10)'
            : '1px solid rgba(255,255,255,0.55)',
          backdropFilter: 'blur(32px) saturate(160%)',
          WebkitBackdropFilter: 'blur(32px) saturate(160%)',
        }}
      >
        <DockTextButton href="/" label="Home" variant={variant} />
        <WorkDockButton dockProjects={dockProjects} variant={variant} />
        <DockTextButton href="/resume" label="Resume" variant={variant} />

        <div className="dock-cta" style={{ marginLeft: 8 }}>
          <CtaButton
            href="https://calendar.app.google/q37dZacRGpmM2wgy7"
            variant="primary"
            style={{ fontSize: '0.75rem', borderRadius: 8 }}
            onClick={() => chime.bookCall()}
          >
            Let's talk
          </CtaButton>
        </div>
      </div>
    </nav>
  )
}
