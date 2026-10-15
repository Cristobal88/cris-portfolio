import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { AppDock } from '@/components/blocks/app-dock'
import { PersonalFooter } from '@/components/blocks/personal-footer'
import { useCaseStudies } from '@/hooks/useCaseStudies'
import { chime } from '@/lib/chime'
import type { Project } from '@/types/content'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: 'rgba(0,0,0,0.42)', margin: '0 0 16px',
    }}>
      {children}
    </p>
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

// ─── Work cards ───────────────────────────────────────────────────────────────

function cardSrc(project: Project, index: number): string {
  if (project.cardImage) return project.cardImage
  return `/card-${index + 1}.webp`
}

function WorkCards() {
  const { data: projects, loading } = useCaseStudies()
  const visible = projects?.filter(p => !p.locked) ?? []

  if (loading) {
    return (
      <div>
        <SectionLabel>Some of my work</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: 120, borderRadius: 12, background: 'rgba(0,0,0,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionLabel>Some of my work</SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        {visible.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={`/work/${project.slug}`}
      style={{
        display: 'block',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        aspectRatio: '4/3',
        textDecoration: 'none',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.14)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => { setHovered(true); chime.cardHover() }}
      onMouseLeave={() => setHovered(false)}
    >
      <picture>
        <source srcSet={cardSrc(project, index)} type="image/webp" />
        <img
          src={`/card-${index + 1}.png`}
          alt={project.label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </picture>

      {/* Hover metric hero overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.40) 55%, transparent 100%)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '14px',
            }}
          >
            {project.metric && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.04 }}
                style={{
                  fontSize: '1.75rem', fontWeight: 700, color: '#ffffff',
                  letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                  marginBottom: 3,
                }}
              >
                {project.metric}
              </motion.span>
            )}
            {project.metricLabel && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.08 }}
                style={{
                  fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(255,255,255,0.70)',
                  lineHeight: 1.3, marginBottom: 8,
                }}
              >
                {project.metricLabel}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </a>
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

function PersonalSection() {
  return (
    <div>
      <SectionLabel>Personal</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0', alignItems: 'center', marginBottom: 16 }}>
        {PERSONAL_FACTS.map((fact, i) => (
          <span key={fact} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.55)' }}>{fact}</span>
            {i < PERSONAL_FACTS.length - 1 && (
              <span style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.2)', margin: '0 10px' }}>·</span>
            )}
          </span>
        ))}
      </div>
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
    </div>
  )
}

// ─── GitHub Activity ──────────────────────────────────────────────────────────

const GITHUB_USERNAME = 'Cristobal88'
const CELL = 10
const GAP  = 2
const STEP = CELL + GAP
const DAY_LABEL_W = 26
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const GH_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']

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

  const gridW = containerW - DAY_LABEL_W
  const visibleCount = gridW > 0 ? Math.floor(gridW / STEP) : allWeeks.length
  const weeks = allWeeks.slice(-visibleCount)

  const monthLabels: { label: string; x: number }[] = []
  weeks.forEach((week, wi) => {
    if (!week[0]) return
    const month = new Date(week[0].date).getMonth()
    const prev  = wi > 0 && weeks[wi - 1][0] ? new Date(weeks[wi - 1][0].date).getMonth() : -1
    if (month !== prev) {
      const x = DAY_LABEL_W + wi * STEP
      const last = monthLabels[monthLabels.length - 1]
      if (!last || x - last.x >= 28) monthLabels.push({ label: MONTHS[month], x })
    }
  })

  const labelStyle: React.CSSProperties = { fontSize: '0.625rem', color: 'rgba(0,0,0,0.38)', fontWeight: 500, userSelect: 'none' }

  return (
    <div ref={containerRef}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <a href="https://github.com/Cristobal88" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.28)', textDecoration: 'none' }}>
          GitHub Activity
        </a>
        {total !== null && (
          <span style={{ fontSize: '0.6875rem', color: 'rgba(0,0,0,0.35)', fontWeight: 500 }}>
            {total.toLocaleString()} contributions in the last year
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ height: 104, borderRadius: 8, background: 'rgba(0,0,0,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <div style={{ overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: 16, marginBottom: 4 }}>
            {monthLabels.map(({ label, x }) => (
              <span key={`${label}-${x}`} style={{ ...labelStyle, position: 'absolute', left: x }}>{label}</span>
            ))}
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: DAY_LABEL_W, display: 'flex', flexDirection: 'column', gap: GAP, flexShrink: 0 }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                <div key={d} style={{ height: CELL, display: 'flex', alignItems: 'center' }}>
                  {(i === 1 || i === 3 || i === 5) && <span style={labelStyle}>{d}</span>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
                      style={{
                        width: CELL, height: CELL, borderRadius: 2,
                        background: GH_COLORS[day.level] ?? GH_COLORS[0],
                        transition: 'transform 0.15s ease', flexShrink: 0,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.4)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 8 }}>
            <span style={labelStyle}>Less</span>
            {GH_COLORS.map((color, i) => (
              <div key={i} style={{ width: CELL, height: CELL, borderRadius: 2, background: color, flexShrink: 0 }} />
            ))}
            <span style={labelStyle}>More</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stack ────────────────────────────────────────────────────────────────────

function ClaudeIcon() {
  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
  return (
    <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {angles.map((angle) => (
        <rect key={angle} x="46.5" y="11" width="7" height="31" rx="3.5" fill="#FAE4D8" transform={`rotate(${angle} 50 50)`} />
      ))}
    </svg>
  )
}

function VSCodeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="vsc-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
        <path fillRule="evenodd" clipRule="evenodd" d="M70.9119 99.3171C72.4869 99.9307 74.2828 99.8914 75.8725 99.1264L96.4608 89.2197C98.6242 88.1787 100 85.9892 100 83.5872V16.4133C100 14.0113 98.6243 11.8218 96.4609 10.7808L75.8725 0.873756C73.7862 -0.130129 71.3446 0.11576 69.5135 1.44695C69.252 1.63711 69.0028 1.84943 68.769 2.08341L29.3551 38.0415L12.1872 25.0096C10.589 23.7965 8.35363 23.8959 6.86933 25.2461L1.36303 30.2549C-0.452552 31.9064 -0.454633 34.7627 1.35853 36.417L16.2471 50.0001L1.35853 63.5832C-0.454633 65.2374 -0.452552 68.0938 1.36303 69.7453L6.86933 74.7541C8.35363 76.1043 10.589 76.2037 12.1872 74.9905L29.3551 61.9587L68.769 97.9167C69.3925 98.5406 70.1246 99.0104 70.9119 99.3171ZM75.0152 27.2989L45.1091 50.0001L75.0152 72.7012V27.2989Z" fill="white"/>
      </mask>
      <g mask="url(#vsc-mask)">
        <path d="M96.4614 10.7962L75.8569 0.875542C73.4719 -0.272773 70.6217 0.211611 68.75 2.08333L1.29858 63.5832C-0.515693 65.2373 -0.513607 68.0937 1.30308 69.7452L6.81272 74.754C8.29793 76.1042 10.5347 76.2036 12.1338 74.9905L93.3609 13.3699C96.086 11.3026 100 13.2462 100 16.6667V16.4275C100 14.0265 98.6246 11.8378 96.4614 10.7962Z" fill="#0065A9"/>
        <path d="M96.4614 89.2038L75.8569 99.1245C73.4719 100.273 70.6217 99.7884 68.75 97.9167L1.29858 36.4169C-0.515693 34.7627 -0.513607 31.9063 1.30308 30.2548L6.81272 25.246C8.29793 23.8958 10.5347 23.7964 12.1338 25.0095L93.3609 86.6301C96.086 88.6974 100 86.7538 100 83.3334V83.5726C100 85.9735 98.6246 88.1622 96.4614 89.2038Z" fill="#007ACC"/>
        <path d="M75.8578 99.1263C73.4721 100.274 70.6219 99.7885 68.75 97.9166C71.0564 100.223 75 98.5895 75 95.3278V4.67213C75 1.41039 71.0564 -0.223106 68.75 2.08329C70.6219 0.211402 73.4721 -0.273666 75.8578 0.873633L96.4587 10.7807C98.6234 11.8217 100 14.0112 100 16.4132V83.5871C100 85.9891 98.6234 88.1786 96.4586 89.2196L75.8578 99.1263Z" fill="#1F9CF0"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M70.8511 99.3171C72.4261 99.9306 74.2221 99.8913 75.8117 99.1264L96.4 89.2197C98.5634 88.1787 99.9392 85.9892 99.9392 83.5871V16.4133C99.9392 14.0112 98.5635 11.8217 96.4001 10.7807L75.8117 0.873695C73.7255 -0.13019 71.2838 0.115699 69.4527 1.44688C69.1912 1.63705 68.942 1.84937 68.7082 2.08335L29.2943 38.0414L12.1264 25.0096C10.5283 23.7964 8.29285 23.8959 6.80855 25.246L1.30225 30.2548C-0.513334 31.9064 -0.515415 34.7627 1.29775 36.4169L16.1863 50L1.29775 63.5832C-0.515415 65.2374 -0.513334 68.0937 1.30225 69.7452L6.80855 74.754C8.29285 76.1042 10.5283 76.2036 12.1264 74.9905L29.2943 61.9586L68.7082 97.9167C69.3317 98.5405 70.0638 99.0104 70.8511 99.3171ZM74.9544 27.2989L45.0483 50L74.9544 72.7012V27.2989Z" fill="white" fillOpacity="0.25"/>
      </g>
    </svg>
  )
}

function FigmaIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 28.5C19 24.9101 21.9101 22 25.5 22C29.0899 22 32 24.9101 32 28.5C32 32.0899 29.0899 35 25.5 35C21.9101 35 19 32.0899 19 28.5Z" fill="#1ABCFE"/>
      <path d="M6 42C6 38.4101 8.91015 35.5 12.5 35.5H19V42C19 45.5899 16.0899 48.5 12.5 48.5C8.91015 48.5 6 45.5899 6 42Z" fill="#0ACF83"/>
      <path d="M19 8.5V22H25.5C29.0899 22 32 19.0899 32 15.5C32 11.9101 29.0899 9 25.5 9H19V8.5Z" fill="#FF7262"/>
      <path d="M6 15.5C6 19.0899 8.91015 22 12.5 22H19V9H12.5C8.91015 9 6 11.9101 6 15.5Z" fill="#F24E1E"/>
      <path d="M6 28.5C6 32.0899 8.91015 35 12.5 35H19V22H12.5C8.91015 22 6 24.9101 6 28.5Z" fill="#A259FF"/>
    </svg>
  )
}

const STACK = [
  { name: 'Figma',    slug: 'figma',      hex: '000000', iconColor: 'ffffff', custom: 'figma'   as const },
  { name: 'VS Code',  slug: 'vscode',     hex: 'FFFFFF', iconColor: 'ffffff', custom: 'vscode'  as const },
  { name: 'Claude',   slug: 'anthropic',  hex: 'C96B49', iconColor: 'ffffff', custom: 'claude'  as const },
  { name: 'V0',       slug: 'v0',         hex: '000000', iconColor: 'ffffff' },
  { name: 'Supabase', slug: 'supabase',   hex: '1C1C1E', iconColor: '3ECF8E' },
  { name: 'GitHub',   slug: 'github',     hex: '181717', iconColor: 'ffffff', href: 'https://github.com/Cristobal88' },
]

function StackSection() {
  return (
    <div>
      <SectionLabel>Stack</SectionLabel>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {STACK.map((tool) => {
          const inner = (
            <>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `#${tool.hex}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: ('custom' in tool && (tool.custom === 'figma' || tool.custom === 'claude')) ? 4 : 7,
                flexShrink: 0,
                ...('custom' in tool && tool.custom === 'vscode' ? { border: '1px solid rgba(0,0,0,0.10)' } : {}),
              }}>
                {'custom' in tool && tool.custom === 'figma'
                  ? <FigmaIcon />
                  : 'custom' in tool && tool.custom === 'claude'
                    ? <ClaudeIcon />
                    : 'custom' in tool && tool.custom === 'vscode'
                      ? <VSCodeIcon />
                      : <img src={`https://cdn.simpleicons.org/${tool.slug}/${tool.iconColor}`} alt={tool.name} width={28} height={28} style={{ display: 'block', width: 28, height: 28 }} />
                }
              </div>
              <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.01em' }}>
                {tool.name}
              </span>
            </>
          )
          return 'href' in tool && tool.href ? (
            <a key={tool.name} href={tool.href} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              {inner}
            </a>
          ) : (
            <div key={tool.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── CV Download Button ───────────────────────────────────────────────────────

function CvDownloadButton({ mode = 'absolute' }: { mode?: 'absolute' | 'inline' }) {
  const [hovered, setHovered] = useState(false)

  const wrapperStyle: React.CSSProperties = mode === 'absolute'
    ? { position: 'absolute', top: 20, right: 24, zIndex: 10 }
    : { display: 'inline-block', marginTop: 12 }

  return (
    <div className={mode === 'absolute' ? 'cv-btn-desktop' : 'cv-btn-mobile'} style={wrapperStyle}>
      <a
        href="/Cristobal-Lemoine-CV-EN.pdf"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => chime.cvDownload()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#ffffff',
          border: `1px solid ${hovered ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.10)'}`,
          borderRadius: 9999, padding: '7px 14px',
          fontSize: '0.8125rem', fontWeight: 500,
          color: hovered ? '#111' : 'rgba(0,0,0,0.55)',
          textDecoration: 'none',
          transition: 'border-color 0.2s, color 0.2s',
        }}
      >
        <Download size={13} />
        Download CV
      </a>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [emailCopied, setEmailCopied] = useState(false)

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
    textWrap: 'pretty',
    margin: '0 0 20px',
    color: 'rgba(0,0,0,0.65)',
  }

  return (
    <div className="home-dot-bg" style={{ minHeight: '100vh', fontFamily: 'Barlow, sans-serif', color: '#0d0d0d' }}>
      <div className="gradient-blur" />
      <div className="gradient-blur-bottom" />
      <AppDock />

      <main className="home-main">
        <div className="mx-auto w-full max-w-6xl px-6">

          <Card style={{ padding: '40px 48px', margin: '0 auto 100px', maxWidth: 680, position: 'relative' }}>

            <CvDownloadButton />

            {/* Photo */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 88, height: 88, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', flexShrink: 0 }}>
                <img
                  src="/team/cristobal-lemoine.webp"
                  alt="Cristobal Lemoine"
                  width={88} height={88}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '60% 0%', transform: 'scale(1.35) translateY(-8%)', transformOrigin: '60% 0%' }}
                />
              </div>
            </div>

            {/* Name */}
            <div style={{ margin: '0 0 32px' }}>
              <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d0d0d', lineHeight: 1.4, margin: 0 }}>
                Cristobal Lemoine
              </h1>
              <p style={{ fontSize: '1rem', fontWeight: 400, color: 'rgba(0,0,0,0.45)', lineHeight: 1.4, margin: 0 }}>
                Staff Product Designer
              </p>
              <CvDownloadButton mode="inline" />
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 0 }}>
              <p style={pStyle}>
                For 9+ years, I've been designing and scaling product experiences across Fintech, IoT, SaaS, and AI-native companies. Over 6 million users interact daily with products I've shaped, mostly in industries where a confusing flow isn't just frustrating: it breaks compliance, loses a transaction, or kills trust overnight.
              </p>
              <p style={pStyle}>
                That context shapes how I work. I lead design from the ground up, from early discovery and UX research through high-fidelity UI and delivery, staying close to the details that matter in complex, regulated environments.
              </p>
              <p style={pStyle}>
                I partner with Product, Engineering, and Data not just to execute, but to help define strategy, shift adoption metrics, and connect design decisions to outcomes that show up in the business.
              </p>
              <p style={{ ...pStyle, margin: 0 }}>
                Behind all of it is a simple conviction: I'm a maker at heart, and I care deeply about building products with the potential to leave a positive mark on the world. Design is the best tool I've found for that.
              </p>
            </div>

            <Divider />
            <div id="work">
            <WorkCards />
            </div>

            <Divider />
            <ExperienceSection />

            <Divider />
            <GitHubActivitySection />

            <Divider />
            <StackSection />

            <Divider />
            <PersonalSection />

          </Card>
        </div>
      </main>

      <PersonalFooter />

      {/* Floating email hint — bottom right (desktop/keyboard only) */}
      <div className="email-hint" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
        <AnimatePresence mode="wait">
          {emailCopied ? (
            <motion.p
              key="copied"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.4)', margin: 0 }}
            >
              ✓ Copied to clipboard
            </motion.p>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
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
