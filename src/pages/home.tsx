import { useEffect, useRef, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence, useReducedMotion, useDragControls } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { AppDock } from '@/components/blocks/app-dock'
import { useCaseStudies } from '@/hooks/useCaseStudies'
import { chime } from '@/lib/chime'
import { useThemeColor } from '@/lib/useThemeColor'
import { GlassFolder } from '@/components/ui/glass-folder'
import { AvatarGroup } from '@/components/ui/avatar-group'
import type { Project } from '@/types/content'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.875rem', fontWeight: 400, letterSpacing: '0.01em',
      color: 'rgba(0,0,0,0.40)', margin: '0 0 16px',
    }}>
      {children}
    </h2>
  )
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)', margin: '28px 0' }} />
}

// ─── Experience ───────────────────────────────────────────────────────────────

type SingleRole = {
  kind: 'single'
  dates: string
  role: string
  company: string
  description: string
}

type GroupedRoles = {
  kind: 'group'
  dates: string
  company: string
  category: string
  roles: { role: string; dates: string; tag?: string; description: string }[]
}

type ExperienceEntry = SingleRole | GroupedRoles

const EXPERIENCE: ExperienceEntry[] = [
  {
    kind: 'single',
    dates: '2026 — Present',
    role: 'Lead Product Designer',
    company: 'EY',
    description: 'Enterprise product design for AI-enabled platforms used by 400K+ professionals globally.',
  },
  {
    kind: 'single',
    dates: '2025 — 2026',
    role: 'Lead Product Designer',
    company: 'HeySam',
    description: 'Product Design 0→1 for an AI-native sales tool.',
  },
  {
    kind: 'group',
    dates: '2022 — 2025',
    company: 'MODO',
    category: 'Fintech',
    roles: [
      {
        role: 'Tech Lead Product Designer',
        dates: '2025',
        tag: 'Promoted',
        description: 'Led QR and NFC payment experiences across 2 squads and 30+ partner banks.',
      },
      {
        role: 'Product Designer',
        dates: '2022 — 2025',
        description: 'Designed digital tipping, transit top-ups and loyalty experiences for a 6M+ user fintech ecosystem.',
      },
    ],
  },
  {
    kind: 'single',
    dates: '2020 — 2022',
    role: 'Product Designer',
    company: 'Drixit',
    description: 'Shipped IoT and Industry 4.0 products across 2 product ecosystems.',
  },
]

const dateStyle: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.50)', paddingTop: 2, whiteSpace: 'nowrap',
}

function ExperienceSection() {
  return (
    <div>
      <SectionLabel>Selected experience</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {EXPERIENCE.map((item) => (
          <div key={item.kind === 'single' ? item.company + item.dates : item.company} className="exp-row" style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0 16px' }}>
            <span className="exp-date" style={dateStyle}>{item.dates}</span>

            {item.kind === 'single' ? (
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d0d0d', margin: 0, lineHeight: 1.3 }}>
                  {item.role}{' '}
                  <span style={{ fontWeight: 400, color: 'rgba(0,0,0,0.45)' }}>· {item.company}</span>
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: '3px 0 0' }}>
                  {item.description}
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d0d0d', margin: '0 0 8px', lineHeight: 1.3 }}>
                  {item.company}{' '}
                  <span style={{ fontWeight: 400, color: 'rgba(0,0,0,0.38)' }}>· {item.category}</span>
                </p>
                <div style={{ borderLeft: '2px solid rgba(0,0,0,0.08)', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {item.roles.map((r) => (
                    <div key={r.role}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0d0d0d', margin: 0, lineHeight: 1.3 }}>
                        {r.role}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.40)', margin: '2px 0 3px', lineHeight: 1 }}>
                        {r.dates}{r.tag && <span style={{ marginLeft: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 4, padding: '1px 6px', fontSize: '0.6875rem', fontWeight: 500 }}>{r.tag}</span>}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
                        {r.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Work folders ─────────────────────────────────────────────────────────────


function projectToFiles(project: Project, href: string) {
  const deliverables: string[] = Array.isArray(project.deliverables) ? project.deliverables : []
  if (deliverables.length > 0) {
    return deliverables.slice(0, 3).map((d) => ({ name: d, href }))
  }
  // fallback generic files
  return [
    { name: 'Discovery & Research', meta: 'UX', href },
    { name: 'Design System', meta: 'UI', href },
    { name: 'Final Outcomes', meta: project.metric ?? '', href },
  ]
}

// ─── macOS Window Modal ───────────────────────────────────────────────────────

const DEMO_W = 390
const DEMO_H = 844
const WIN_MARGIN = 80   // top + bottom gap from viewport edge
const TITLEBAR_H = 32
const PADDING = 16 * 2  // top + bottom content padding

function MacWindow({ url, onClose }: { url: string; onClose: () => void }) {
  const prefersReduced = useReducedMotion()
  const dragControls = useDragControls()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const compute = () => {
      const available = window.innerHeight - WIN_MARGIN - TITLEBAR_H - PADDING
      setScale(Math.min(1, available / DEMO_H))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  const scaledW = Math.round(DEMO_W * scale)
  const scaledH = Math.round(DEMO_H * scale)

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }
  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.40)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        initial={prefersReduced ? {} : { opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={prefersReduced ? {} : { opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          borderRadius: 12,
          boxShadow: '0 6px 40px rgba(0,0,0,0.38), 0 2px 10px rgba(0,0,0,0.14)',
          display: 'flex',
          flexDirection: 'column',
          width: 'fit-content',
        }}
      >
        {/* clip-path clips everything — layout AND visual effects like backdrop-filter bleed */}
        <div style={{ clipPath: 'inset(0 round 12px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Title bar — 3-col grid: lights | title | spacer */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          style={{
            height: TITLEBAR_H,
            background: '#f2f2f2',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            paddingLeft: 12,
            paddingRight: 12,
            flexShrink: 0,
            cursor: 'grab',
            userSelect: 'none',
          }}
        >
          {/* Traffic lights — stop drag propagation so clicks still work */}
          <div onPointerDown={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onClose}
              aria-label="Close window"
              style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0 }}
            />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E', flexShrink: 0 }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840', flexShrink: 0 }} />
          </div>
          {/* Title */}
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#0d0d0d', letterSpacing: '-0.01em' }}>Propina_demo.html</span>
          {/* Spacer */}
          <div />
        </div>
        {/* Content: iframe scaled to fit viewport */}
        <div style={{ background: '#ffffff', padding: 16 }}>
          {/* Clip wrapper — sized to scaled dimensions */}
          <div style={{ width: scaledW, height: scaledH, overflow: 'hidden', borderRadius: Math.round(50 * scale), position: 'relative' }}>
            <iframe
              src={url}
              title="Propina Demo"
              style={{
                width: DEMO_W,
                height: DEMO_H,
                border: 'none',
                display: 'block',
                transformOrigin: 'top left',
                transform: `scale(${scale})`,
              }}
            />
          </div>
        </div>
        </div>{/* end clip-path wrapper */}
      </motion.div>
    </div>
  )
}

// ─── Selected Projects ────────────────────────────────────────────────────────

const PROJECTS_DATA = [
  {
    slug: 'fintech-tipping-flow',
    title: 'Propina',
    image: '/propina-start.png',
  },
  {
    slug: 'loyalty-club-payments',
    title: 'Loyalty Club',
    image: '/card-2.png',
  },
]

function SelectedProjectsSection() {
  const { data: projects } = useCaseStudies()
  const visible = projects?.filter(p => !p.locked) ?? []
  const [first, second] = visible
  const folderW = 130

  if (!first && !second) return null

  return (
    <div>
      <SectionLabel>Selected projects</SectionLabel>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {first && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <GlassFolder
              label={first.label}
              href={`/work/${first.slug}`}
              open={undefined}
              art="none"
              backColor="#008859"
              seed={7}
              action="none"
              hideLabel
              appear={true}
              appearDelay={0}
              width={folderW}
              files={projectToFiles(first, `/work/${first.slug}`)}
            />
            <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0d0d0d', margin: 0, textAlign: 'center', maxWidth: folderW }}>{first.label}</p>
          </div>
        )}
        {second && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <GlassFolder
              label={second.label}
              href={`/work/${second.slug}`}
              open={undefined}
              art="none"
              backColor="#031061"
              seed={12}
              action="none"
              hideLabel
              appear={true}
              appearDelay={0.06}
              width={folderW}
              files={projectToFiles(second, `/work/${second.slug}`)}
            />
            <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0d0d0d', margin: 0, textAlign: 'center', maxWidth: folderW }}>{second.label}</p>
          </div>
        )}
      </div>
    </div>
  )
}

type DragItem = 'first' | 'second' | 'demo'

function WorkFolders({ mobile = false }: { mobile?: boolean }) {
  const { data: projects, loading } = useCaseStudies()
  const containerRef = useRef<HTMLDivElement>(null)
  const firstRef  = useRef<HTMLDivElement>(null)
  const secondRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)
  const [firstHovered, setFirstHovered] = useState(false)
  const [secondHovered, setSecondHovered] = useState(false)
  const [demoHovered, setDemoHovered] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  // ── Drag state ──────────────────────────────────────────────────────────────
  const [dragging, setDragging] = useState<DragItem | null>(null)
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 })
  const [offsets, setOffsets] = useState<Record<DragItem, { dx: number; dy: number }>>({
    first: { dx: 0, dy: 0 },
    second: { dx: 0, dy: 0 },
    demo: { dx: 0, dy: 0 },
  })
  const dragOffsetRef  = useRef({ x: 0, y: 0 })
  const dragStartRef   = useRef<{ x: number; y: number } | null>(null)
  const hasDraggedRef  = useRef(false)
  const justDraggedRef = useRef(false)

  // Attach move/up listeners at window level so tracking never breaks when
  // the pointer leaves the element (React synthetic events stop firing then).
  const onItemPointerDown = useCallback((item: DragItem) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (mobile) return // no drag on mobile
    e.preventDefault() // stop browser native drag on images/links
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    hasDraggedRef.current = false
    const rect = e.currentTarget.getBoundingClientRect()
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    const onMove = (ev: PointerEvent) => {
      if (!dragStartRef.current) return
      const dx = ev.clientX - dragStartRef.current.x
      const dy = ev.clientY - dragStartRef.current.y
      if (!hasDraggedRef.current && Math.sqrt(dx * dx + dy * dy) > 6) {
        hasDraggedRef.current = true
        setDragging(item)
      }
      if (hasDraggedRef.current) {
        ev.preventDefault() // prevent scroll on touch while dragging
        setGhostPos({ x: ev.clientX - dragOffsetRef.current.x, y: ev.clientY - dragOffsetRef.current.y })
      }
    }

    const onUp = (ev: PointerEvent) => {
      if (hasDraggedRef.current && dragStartRef.current) {
        const moveDx = ev.clientX - dragStartRef.current.x
        const moveDy = ev.clientY - dragStartRef.current.y
        setOffsets(prev => ({
          ...prev,
          [item]: { dx: prev[item].dx + moveDx, dy: prev[item].dy + moveDy },
        }))
      }
      justDraggedRef.current = hasDraggedRef.current
      if (item === 'demo' && !hasDraggedRef.current) setDemoOpen(true)
      setDragging(null)
      dragStartRef.current = null
      hasDraggedRef.current = false
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  // While dragging, keep the item's hover state active
  const firstActive  = firstHovered  || dragging === 'first'
  const secondActive = secondHovered || dragging === 'second'
  const demoActive   = demoHovered   || dragging === 'demo'

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => setContainerW(entries[0].contentRect.width))
    ro.observe(el)
    setContainerW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const gap = 24
  // Always side-by-side: Propina+Demo on left, Loyalty on right
  const folderW = containerW > 0
    ? Math.min(130, Math.floor((containerW - gap) / 2))
    : 120
const visible = projects?.filter(p => !p.locked) ?? []
  const [first, second] = visible

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', gap }}>
          {[0, 1].map(i => (
            <div key={i} style={{ width: folderW || 140, height: (folderW || 140) * 0.96, borderRadius: 16, background: 'rgba(0,0,0,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    )
  }

  const phoneW = Math.round(folderW * 0.62)

  // ── Item renderers ────────────────────────────────────────────────────────

  const propinItem = first && (
    <div
      ref={firstRef}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, touchAction: mobile ? 'auto' : 'none', transform: mobile ? undefined : `translate(${offsets.first.dx}px, ${offsets.first.dy}px)`, transition: 'none', willChange: mobile ? undefined : 'transform', opacity: dragging === 'first' ? 0.4 : 1 }}
      onMouseEnter={() => setFirstHovered(true)}
      onMouseLeave={() => { if (dragging !== 'first') setFirstHovered(false) }}
      onPointerDown={onItemPointerDown('first')}
      onClickCapture={(e) => { if (justDraggedRef.current) { justDraggedRef.current = false; e.preventDefault() } }}
    >
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: -4, left: -10, right: -10, bottom: -10, background: 'rgba(156,163,175,0.30)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', borderRadius: 16, opacity: firstActive ? 1 : 0, transition: 'opacity 0.15s ease', pointerEvents: 'none' }} />
        <GlassFolder label={first.label} href={`/work/${first.slug}`} open={undefined} art="none" backColor="#008859" seed={7} action="none" hideLabel appear={true} appearDelay={0} width={folderW} files={projectToFiles(first, `/work/${first.slug}`)} />
      </div>
      <div style={{ isolation: 'isolate', textAlign: 'center', background: firstActive ? '#0067EA' : 'transparent', borderRadius: firstActive ? 6 : 0, padding: '4px 10px', transition: 'all 0.15s ease', maxWidth: folderW, width: 'fit-content' }}>
        <p style={{ fontSize: '0.75rem', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          <span style={{ fontWeight: 500, color: firstActive ? '#ffffff' : '#0d0d0d', transition: 'color 0.15s ease' }}>{first.label}</span>
          {first.metric && <span style={{ fontWeight: 500, color: firstActive ? '#ffffff' : '#0d0d0d', transition: 'color 0.15s ease' }}> {first.metric} {first.metricLabel}</span>}
        </p>
      </div>
    </div>
  )

  const demoItem = (
    <div
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, touchAction: mobile ? 'auto' : 'none', transform: mobile ? undefined : `translate(${offsets.demo.dx}px, ${offsets.demo.dy}px)`, transition: 'none', willChange: mobile ? undefined : 'transform', opacity: dragging === 'demo' ? 0.4 : 1 }}
      onMouseEnter={() => setDemoHovered(true)}
      onMouseLeave={() => { if (dragging !== 'demo') setDemoHovered(false) }}
      onPointerDown={onItemPointerDown('demo')}
      onClick={mobile ? () => setDemoOpen(true) : undefined}
      onClickCapture={(e) => { if (justDraggedRef.current) { justDraggedRef.current = false; e.preventDefault() } }}
    >
      <div style={{ position: 'relative' }}>
        <button aria-label="Open Propina Demo" style={{ display: 'block', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src="/propina-start.png" alt="Propina Demo" draggable={false} width={phoneW} style={{ width: phoneW, height: 'auto', display: 'block', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }} />
        </button>
        <div style={{ position: 'absolute', top: -4, left: -8, right: -8, bottom: -8, background: 'rgba(156,163,175,0.30)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', borderRadius: 14, opacity: demoActive ? 1 : 0, transition: 'opacity 0.15s ease', pointerEvents: 'none', zIndex: -1 }} />
      </div>
      <div style={{ isolation: 'isolate', textAlign: 'center', background: demoActive ? '#0067EA' : 'transparent', borderRadius: demoActive ? 6 : 0, padding: '4px 10px', transition: 'all 0.15s ease', width: 'fit-content', maxWidth: 'none' }}>
        <p style={{ fontSize: '0.75rem', lineHeight: 1.4, margin: 0, whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 500, color: demoActive ? '#ffffff' : '#0d0d0d', transition: 'color 0.15s ease' }}>Propina_demo.html</span>
        </p>
      </div>
    </div>
  )

  const loyaltyItem = second && (
    <div
      ref={secondRef}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, touchAction: mobile ? 'auto' : 'none', transform: mobile ? undefined : `translate(${offsets.second.dx}px, ${offsets.second.dy}px)`, transition: 'none', willChange: mobile ? undefined : 'transform', opacity: dragging === 'second' ? 0.4 : 1 }}
      onMouseEnter={() => setSecondHovered(true)}
      onMouseLeave={() => { if (dragging !== 'second') setSecondHovered(false) }}
      onPointerDown={onItemPointerDown('second')}
      onClickCapture={(e) => { if (justDraggedRef.current) { justDraggedRef.current = false; e.preventDefault() } }}
    >
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: -4, left: -10, right: -10, bottom: -10, background: 'rgba(156,163,175,0.30)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', borderRadius: 16, opacity: secondActive ? 1 : 0, transition: 'opacity 0.15s ease', pointerEvents: 'none' }} />
        <GlassFolder label={second.label} href={`/work/${second.slug}`} open={undefined} art="none" backColor="#031061" seed={12} action="none" hideLabel appear={true} appearDelay={120} width={folderW} files={projectToFiles(second, `/work/${second.slug}`)} />
      </div>
      <div style={{ isolation: 'isolate', textAlign: 'center', background: secondActive ? '#0067EA' : 'transparent', borderRadius: secondActive ? 6 : 0, padding: '4px 10px', transition: 'all 0.15s ease', maxWidth: folderW, width: 'fit-content' }}>
        <p style={{ fontSize: '0.75rem', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          <span style={{ fontWeight: 500, color: secondActive ? '#ffffff' : '#0d0d0d', transition: 'color 0.15s ease' }}>{second.label}</span>
          {second.metric && <span style={{ fontWeight: 500, color: secondActive ? '#ffffff' : '#0d0d0d', transition: 'color 0.15s ease' }}> {second.metric} {second.metricLabel}</span>}
        </p>
      </div>
    </div>
  )

  return (
    <div>
      {mobile ? (
        /* Mobile: row 1 = Propina + Demo, row 2 = Loyalty */
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap, alignItems: 'flex-end' }}>
            {propinItem}
            {demoItem}
          </div>
          {loyaltyItem}
        </div>
      ) : (
        /* Desktop: flat row — Propina | Demo | Loyalty */
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'row', gap, alignItems: 'flex-end', justifyContent: 'flex-start' }}>
          {propinItem}
          {demoItem}
          {loyaltyItem}
        </div>
      )}


      {/* Ghost portal — floats above everything while dragging */}
      {dragging && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          left: ghostPos.x,
          top: ghostPos.y,
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.92,
          transform: 'scale(1.04)',
          transformOrigin: 'top left',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.3))',
        }}>
          {dragging === 'first' && first && (
            <>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -4, left: -10, right: -10, bottom: -10,
                  background: 'rgba(156,163,175,0.30)',
                  backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                  borderRadius: 16, opacity: 1, pointerEvents: 'none',
                }} />
                <GlassFolder label={first.label} href={`/work/${first.slug}`} open={undefined} art="none" backColor="#008859" seed={7} action="none" hideLabel appear={false} width={folderW} files={projectToFiles(first, `/work/${first.slug}`)} />
              </div>
              <div style={{ isolation: 'isolate', textAlign: 'center', background: '#0067EA', borderRadius: 6, padding: '4px 10px', maxWidth: folderW, width: 'fit-content' }}>
                <p style={{ fontSize: '0.75rem', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 500, color: '#ffffff' }}>{first.label}</span>
                  {first.metric && <span style={{ fontWeight: 500, color: '#ffffff' }}> {first.metric} {first.metricLabel}</span>}
                </p>
              </div>
            </>
          )}
          {dragging === 'second' && second && (
            <>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -4, left: -10, right: -10, bottom: -10,
                  background: 'rgba(156,163,175,0.30)',
                  backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                  borderRadius: 16, opacity: 1, pointerEvents: 'none',
                }} />
                <GlassFolder label={second.label} href={`/work/${second.slug}`} open={undefined} art="none" backColor="#031061" seed={12} action="none" hideLabel appear={false} width={folderW} files={projectToFiles(second, `/work/${second.slug}`)} />
              </div>
              <div style={{ isolation: 'isolate', textAlign: 'center', background: '#0067EA', borderRadius: 6, padding: '4px 10px', maxWidth: folderW, width: 'fit-content' }}>
                <p style={{ fontSize: '0.75rem', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 500, color: '#ffffff' }}>{second.label}</span>
                  {second.metric && <span style={{ fontWeight: 500, color: '#ffffff' }}> {second.metric} {second.metricLabel}</span>}
                </p>
              </div>
            </>
          )}
          {dragging === 'demo' && (
            <>
              <div style={{ position: 'relative' }}>
                <img src="/propina-start.png" alt="Propina Demo" draggable={false} width={phoneW}
                  style={{ width: phoneW, height: 'auto', display: 'block', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }} />
                <div style={{
                  position: 'absolute', top: -4, left: -8, right: -8, bottom: -8,
                  background: 'rgba(156,163,175,0.30)',
                  backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                  borderRadius: 14, opacity: 1, pointerEvents: 'none', zIndex: -1,
                }} />
              </div>
              <div style={{ isolation: 'isolate', textAlign: 'center', background: '#0067EA', borderRadius: 6, padding: '4px 10px', width: 'fit-content', maxWidth: 'none' }}>
                <p style={{ fontSize: '0.75rem', lineHeight: 1.4, margin: 0, whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 500, color: '#ffffff' }}>Propina_demo.html</span>
                </p>
              </div>
            </>
          )}
        </div>,
        document.body
      )}

      <AnimatePresence>
        {demoOpen && <MacWindow url="/demo/propi?embed" onClose={() => setDemoOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

// ─── Personal ─────────────────────────────────────────────────────────────────

const PERSONAL_FACTS = [
  'Buenos Aires, Argentina',
  'Football weekends',
  'Skiing at the end of the world',
  'Podcast host',
]

const PERSONAL_IMAGES = [
  { src: 'https://hpnfqxxapukjtaoewckv.supabase.co/storage/v1/object/public/cris-bio/Personal%20Cris%201.webp', alt: 'Personal photo 1' },
  { src: 'https://hpnfqxxapukjtaoewckv.supabase.co/storage/v1/object/public/cris-bio/Personal%20Cris%202.webp', alt: 'Personal photo 2' },
  { src: 'https://hpnfqxxapukjtaoewckv.supabase.co/storage/v1/object/public/cris-bio/Personal%20Cris%203.webp', alt: 'Personal photo 3' },
]

const WMO_DESC: Record<number, string> = {
  0: 'clear', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'foggy', 48: 'foggy',
  51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain',
  71: 'light snow', 73: 'snow', 75: 'heavy snow',
  80: 'showers', 81: 'showers', 82: 'heavy showers',
  95: 'thunderstorm', 96: 'thunderstorm', 99: 'thunderstorm',
}

function getBATime(): string {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase()
}

function PersonalSection() {
  const [time, setTime] = useState(getBATime)
  const [weather, setWeather] = useState<string | null>(null)

  useEffect(() => {
    const id = setInterval(() => setTime(getBATime()), 15_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-34.6037&longitude=-58.3816&current=temperature_2m,weather_code&forecast_days=1'
    )
      .then(r => r.json())
      .then(data => {
        const c = Math.round(data.current.temperature_2m)
        const f = Math.round(c * 9 / 5 + 32)
        const desc = WMO_DESC[data.current.weather_code as number] ?? 'cloudy'
        setWeather(`${c}°c / ${f}°f ${desc}`)
      })
      .catch(() => {})
  }, [])

  return (
    <div>
      <SectionLabel>Personal</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {PERSONAL_IMAGES.map((img) => (
          <div
            key={img.src}
            style={{
              aspectRatio: '3/4', borderRadius: 12, overflow: 'hidden',
              transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
          >
            <img
              src={img.src}
              alt={img.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>
      <p style={{ marginTop: 16, fontSize: '0.75rem', color: 'rgba(0,0,0,0.30)', lineHeight: 1.5 }}>
        designed in buenos aires, argentina
        {(time || weather) && (
          <> &nbsp;·&nbsp; {time}{weather ? ` · ${weather}` : ''}</>
        )}
      </p>
    </div>
  )
}

// ─── GitHub Activity ──────────────────────────────────────────────────────────

const GITHUB_USERNAME = 'Cristobal88'
const GAP  = 3
const WEEKS_TO_SHOW = 39  // ~9 months
const GH_COLORS = ['#ebedf0', '#dde8ff', '#92b4f8', '#4070e8', '#0044d4']

type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }

function GitHubActivitySection() {
  const [allWeeks, setAllWeeks] = useState<ContributionDay[][]>([])
  const [total, setTotal]       = useState<number | null>(null)
  const [loading, setLoading]   = useState(true)
  const [containerW, setContainerW] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`)
      .then(r => r.json())
      .then(data => {
        const days: ContributionDay[] = data.contributions ?? []
        const grouped: ContributionDay[][] = []
        for (let i = 0; i < days.length; i += 7) grouped.push(days.slice(i, i + 7))
        setAllWeeks(grouped)
        setTotal(data.total?.lastYear ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => { setContainerW(entries[0].contentRect.width) })
    ro.observe(el)
    setContainerW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const weeks = allWeeks.slice(-WEEKS_TO_SHOW)
  const cell = containerW > 0 ? Math.floor((containerW - (WEEKS_TO_SHOW - 1) * GAP) / WEEKS_TO_SHOW) : 10
  const labelStyle: React.CSSProperties = { fontSize: '0.625rem', color: 'rgba(0,0,0,0.38)', fontWeight: 500, userSelect: 'none' }

  type CellTooltip = { date: string; count: number; x: number; y: number }
  const [tooltip, setTooltip] = useState<CellTooltip | null>(null)

  const formatTooltipDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const radius = Math.max(3, Math.round(cell * 0.3))

  return (
    <div ref={containerRef}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <a href="https://github.com/Cristobal88" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.875rem', fontWeight: 400, letterSpacing: '0.01em', color: 'rgba(0,0,0,0.40)', textDecoration: 'none', padding: '6px 0', display: 'inline-block' }}>
          GitHub Activity
        </a>
        {total !== null && (
          <span style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.40)', fontWeight: 700 }}>
            <span style={{ color: 'rgba(0,0,0,0.70)' }}>{total.toLocaleString()}</span> contributions in the last year
          </span>
        )}
      </div>

      {/* Custom tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x,
          top: tooltip.y - 8,
          transform: 'translate(-50%, -100%)',
          background: '#0d0d0d',
          color: '#fff',
          borderRadius: 8,
          padding: '5px 10px',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 9999,
          lineHeight: 1.4,
        }}>
          <span style={{ fontWeight: 600 }}>{tooltip.count} contribution{tooltip.count !== 1 ? 's' : ''}</span>
          <span style={{ color: 'rgba(255,255,255,0.55)' }}> on {formatTooltipDate(tooltip.date)}</span>
        </div>
      )}

      {loading ? (
        <div style={{ height: 104, borderRadius: 8, background: 'rgba(0,0,0,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: GAP }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                {week.map((day) => (
                  <div
                    key={day.date}
                    style={{
                      width: cell, height: cell, borderRadius: radius,
                      background: GH_COLORS[day.level] ?? GH_COLORS[0],
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease', flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                      setTooltip({ date: day.date, count: day.count, x: rect.left + rect.width / 2, y: rect.top })
                      const el = e.currentTarget as HTMLDivElement
                      el.style.transform = 'scale(1.4)'
                      el.style.boxShadow = `0 0 0 1.5px rgba(0,0,0,0.18)`
                    }}
                    onMouseLeave={e => {
                      setTooltip(null)
                      const el = e.currentTarget as HTMLDivElement
                      el.style.transform = 'scale(1)'
                      el.style.boxShadow = ''
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 8, visibility: 'hidden', height: 0, overflow: 'hidden' }}>
            <span style={labelStyle}>Less</span>
            {GH_COLORS.map((color, i) => (
              <div key={i} style={{ width: cell, height: cell, borderRadius: radius, background: color, flexShrink: 0 }} />
            ))}
            <span style={labelStyle}>More</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stack ────────────────────────────────────────────────────────────────────

const STACK_AVATARS = [
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',   alt: 'Figma',    label: 'Figma',    bg: '#f5f5f5' },
  { src: 'https://cdn.simpleicons.org/claude/ffffff',                                             alt: 'Claude',   label: 'Claude',   bg: '#C96B49' },
  { src: 'https://cdn.simpleicons.org/vercel/ffffff',                                             alt: 'Vercel',   label: 'Vercel',   bg: '#000000' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg', alt: 'VS Code',  label: 'VS Code',  bg: '#f5f5f5' },
  { src: 'https://cdn.simpleicons.org/supabase/3ECF8E',                                          alt: 'Supabase', label: 'Supabase', bg: '#1C1C1E' },
  { src: 'https://cdn.simpleicons.org/github/ffffff',                                             alt: 'GitHub',   label: 'GitHub',   bg: '#181717', href: 'https://github.com/Cristobal88' },
]

function StackSection() {
  return (
    <div>
      <SectionLabel>Stack</SectionLabel>
      <AvatarGroup avatars={STACK_AVATARS} maxVisible={6} size={44} overlap={10} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  useThemeColor('#ffffff')
  const [emailCopied, setEmailCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    document.title = 'Cristobal Lemoine — Staff Product Designer'
  }, [])

  useEffect(() => {
    async function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'e' || e.key === 'E') {
        const email = 'cristoballemoine88@gmail.com'
        try {
          await navigator.clipboard.writeText(email)
        } catch {
          // fallback for browsers that block clipboard without HTTPS
          const el = document.createElement('textarea')
          el.value = email
          el.style.position = 'fixed'
          el.style.opacity = '0'
          document.body.appendChild(el)
          el.select()
          document.execCommand('copy')
          document.body.removeChild(el)
        }
        chime.emailCopy()
        setEmailCopied(true)
        setTimeout(() => setEmailCopied(false), 2000)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const pStyle: React.CSSProperties = {
    fontSize: '1rem',
    lineHeight: 1.7,
    fontWeight: 400,
    textWrap: 'pretty' as React.CSSProperties['textWrap'],
    margin: 0,
    color: 'rgba(0,0,0,0.52)',
  }

  const pStyleMobile: React.CSSProperties = {
    ...pStyle,
    fontSize: '0.9375rem',
  }

  // Keyword highlight — dark on dimmed base
  const kw = (text: string) => (
    <span style={{ color: 'rgba(0,0,0,0.78)', fontWeight: 500 }}>{text}</span>
  )

  const photoBlock = (
    <div style={{ marginBottom: 32 }}>
      <div style={{ width: 88, height: 88, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', flexShrink: 0 }}>
        <img
          src="/team/cristobal-lemoine.webp"
          alt="Cristobal Lemoine"
          width={88} height={88}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '60% 0%', transform: 'scale(1.35) translateY(-8%)', transformOrigin: '60% 0%' }}
        />
      </div>
    </div>
  )

  const bioPanelContent = (
    <>
      {photoBlock}
      {/* Name */}
      <div style={{ margin: '0 0 32px' }}>
        <h1 style={{ fontSize: '1rem', fontWeight: 500, fontFamily: 'Barlow, sans-serif', color: '#0d0d0d', lineHeight: 1.2, margin: '0 0 4px' }}>
          Cristobal Lemoine
        </h1>
        <p style={{ fontSize: '1rem', fontWeight: 400, color: 'rgba(0,0,0,0.45)', lineHeight: 1.4, margin: 0 }}>
          Staff Product Designer
        </p>
      </div>
      {/* Bio — full */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={pStyle}>
          Based in Buenos Aires. Currently at {kw('EY')}, previously at {kw('MODO')}, {kw('HeySam')} and {kw('Drixit')}. {kw('9 years')} across {kw('fintech, AI and IoT')}, working with products that reach {kw('6M+ people')}.
        </p>
        <p style={pStyle}>
          Also building <a href="https://www.youtube.com/@UXBS-Cris" target="_blank" rel="noopener noreferrer" className="uxbs-link" style={{ color: 'rgba(0,0,0,0.78)', fontWeight: 500 }}>uxbs</a>, a YouTube channel and lab about {kw('product design')} and what happens when {kw('designers start building')}. I'm in this because {kw('design')} is one of the few tools that can genuinely {kw('change how people experience the world')}.
        </p>
        <p style={pStyle}>
          If any of that sounds like a fit, <a href="https://calendar.app.google/q37dZacRGpmM2wgy7" target="_blank" rel="noopener noreferrer" className="uxbs-link" style={{ color: 'rgba(0,0,0,0.78)', fontWeight: 500 }}>let's talk</a>.
        </p>
      </div>
    </>
  )

  const bioPanelMobile = (
    <>
      {photoBlock}
      {/* Name */}
      <div style={{ margin: '0 0 24px' }}>
        <h1 style={{ fontSize: '0.875rem', fontWeight: 500, fontFamily: 'Barlow, sans-serif', color: '#0d0d0d', lineHeight: 1.2, margin: '0 0 4px' }}>
          Cristobal Lemoine
        </h1>
        <p style={{ fontSize: '0.875rem', fontWeight: 400, color: 'rgba(0,0,0,0.45)', lineHeight: 1.4, margin: 0 }}>
          Staff Product Designer
        </p>
      </div>
      {/* Bio — short */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={pStyleMobile}>
          Based in Buenos Aires. Currently at {kw('EY')}, previously at {kw('MODO')}, {kw('HeySam')} and {kw('Drixit')}. {kw('9 years')} across {kw('fintech, AI and IoT')}, working with products that reach {kw('6M+ people')}.
        </p>
        <p style={pStyleMobile}>
          Also building <a href="https://www.youtube.com/@UXBS-Cris" target="_blank" rel="noopener noreferrer" className="uxbs-link" style={{ color: 'rgba(0,0,0,0.78)', fontWeight: 500 }}>uxbs</a>, a YouTube channel and lab about {kw('product design')} and what happens when {kw('designers start building')}. I'm in this because {kw('design')} is one of the few tools that can genuinely {kw('change how people experience the world')}.
        </p>
        <p style={pStyleMobile}>
          If any of that sounds like a fit, <a href="https://calendar.app.google/q37dZacRGpmM2wgy7" target="_blank" rel="noopener noreferrer" className="uxbs-link" style={{ color: 'rgba(0,0,0,0.78)', fontWeight: 500 }}>let's talk</a>.
        </p>
      </div>
    </>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Barlow, sans-serif', color: '#0d0d0d', backgroundColor: '#ffffff' }}>
      <div className="gradient-blur" />
      <div className="gradient-blur-bottom" />
      <AppDock />

      <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>

        {isMobile ? (
          // ── Mobile: single card, stacked layout ──────────────────────────────
          <div className="home-main">
            <div className="mx-auto w-full max-w-6xl px-6">
              <Card style={{ padding: '16px 24px 32px', margin: '0 auto 100px', maxWidth: 680 }}>
                {bioPanelMobile}
                <Divider />
                <div id="work"><WorkFolders mobile /></div>
                <Divider />
                <GitHubActivitySection />
                <Divider />
                <StackSection />
                <Divider />
                <PersonalSection />
              </Card>
            </div>
          </div>
        ) : (
          // ── Desktop: content centered, folders + demo together ──────────────
          <div style={{ position: 'relative', paddingTop: 'clamp(120px, 15vh, 180px)', paddingBottom: 100 }}>
            {/* Main content — truly centered */}
            <div style={{
              maxWidth: 700,
              margin: '0 auto',
              paddingTop: 0,
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 100,
            }}>
              {bioPanelContent}
              <Divider />
              <div>
                <SectionLabel>Selected projects</SectionLabel>
                <WorkFolders />
              </div>
              <Divider />
              <GitHubActivitySection />
              <Divider />
              <PersonalSection />
            </div>
          </div>
        )}

      </main>

      {/* Floating email hint — bottom right (desktop/keyboard only) */}
      <div className="email-hint" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
        <AnimatePresence mode="wait">
          {emailCopied ? (
            <motion.p
              key="copied"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.4)', margin: 0 }}
            >
              ✓ Copied to clipboard
            </motion.p>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.35)', margin: 0 }}
            >
              Press{' '}
              <kbd style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.07)', borderRadius: 5,
                padding: '1px 6px', fontSize: '0.6875rem', fontWeight: 600,
                fontFamily: 'inherit', color: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(0,0,0,0.10)',
              }}>E</kbd>{' '}
              to copy my email
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
