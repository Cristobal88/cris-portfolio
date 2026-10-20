import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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

function WorkFolders() {
  const { data: projects, loading } = useCaseStudies()
  const containerRef = useRef<HTMLDivElement>(null)
  const firstRef  = useRef<HTMLDivElement>(null)
  const secondRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)
  const [firstOpen,  setFirstOpen]  = useState(false)
  const [secondOpen, setSecondOpen] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => setContainerW(entries[0].contentRect.width))
    ro.observe(el)
    setContainerW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const gap = 24
  const stacked = containerW > 0 && containerW < 420
  const folderW = containerW > 0
    ? stacked ? containerW : Math.floor((containerW - gap) / 4)
    : 140

  // On mobile: open each folder when 30 % of it enters the viewport
  useEffect(() => {
    if (!stacked) return
    const watch = (el: HTMLDivElement | null, set: (v: boolean) => void) => {
      if (!el) return
      const io = new IntersectionObserver(
        ([entry]) => set(entry.intersectionRatio >= 0.3),
        { threshold: 0.3 },
      )
      io.observe(el)
      return io
    }
    const io1 = watch(firstRef.current,  setFirstOpen)
    const io2 = watch(secondRef.current, setSecondOpen)
    return () => { io1?.disconnect(); io2?.disconnect() }
  }, [stacked])

  const visible = projects?.filter(p => !p.locked) ?? []
  const [first, second] = visible

  if (loading) {
    return (
      <div>
        <SectionLabel>Some of my work</SectionLabel>
        <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', gap }}>
          {[0, 1].map(i => (
            <div key={i} style={{ width: folderW || 140, height: (folderW || 140) * 0.96, borderRadius: 16, background: 'rgba(0,0,0,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionLabel>Some of my work</SectionLabel>
      <div ref={containerRef} style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', gap, alignItems: 'flex-start' }}>
        {first && (
          <div ref={firstRef} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <GlassFolder
              label={first.label}
              href={`/work/${first.slug}`}
              open={stacked ? firstOpen : undefined}
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
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d0d0d', margin: 0, lineHeight: 1.3 }}>{first.label}</p>
              {first.metric && <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.45)', margin: '2px 0 0', lineHeight: 1.3 }}>{first.metric} {first.metricLabel}</p>}
            </div>
          </div>
        )}
        {second && (
          <div ref={secondRef} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <GlassFolder
              label={second.label}
              href={`/work/${second.slug}`}
              open={stacked ? secondOpen : undefined}
              art="none"
              backColor="#031061"
              seed={12}
              action="none"
              hideLabel
              appear={true}
              appearDelay={120}
              width={folderW}
              files={projectToFiles(second, `/work/${second.slug}`)}
            />
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d0d0d', margin: 0, lineHeight: 1.3 }}>{second.label}</p>
              {second.metric && <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.45)', margin: '2px 0 0', lineHeight: 1.3 }}>{second.metric} redemptions</p>}
            </div>
          </div>
        )}
      </div>
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
          style={{ fontSize: '0.875rem', fontWeight: 400, letterSpacing: '0.01em', color: 'rgba(0,0,0,0.40)', textDecoration: 'none', padding: '6px 0', display: 'inline-block' }}>
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

const STACK_AVATARS = [
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',   alt: 'Figma',    label: 'Figma',    bg: '#f5f5f5' },
  { src: 'https://cdn.simpleicons.org/claude/ffffff',                                             alt: 'Claude',   label: 'Claude',   bg: '#C96B49' },
  { src: 'https://cdn.simpleicons.org/vercel/ffffff',                                             alt: 'V0',       label: 'V0',       bg: '#000000' },
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
  const reducedMotion = useReducedMotion()

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

      <main id="main-content" className="home-main" tabIndex={-1} style={{ outline: 'none' }}>
        <div className="mx-auto w-full max-w-6xl px-6">

          <Card style={{ padding: '40px 48px', margin: '0 auto 100px', maxWidth: 680 }}>

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
              <h1 style={{ fontSize: '0.875rem', fontWeight: 400, fontFamily: 'Barlow, sans-serif', color: '#0d0d0d', lineHeight: 1.3, margin: 0 }}>
                Cristobal Lemoine
              </h1>
              <p style={{ fontSize: '0.875rem', fontWeight: 400, color: 'rgba(0,0,0,0.45)', lineHeight: 1.4, margin: 0 }}>
                Staff Product Designer
              </p>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 0 }}>
              <p style={{ ...pStyle, margin: 0, fontSize: '0.875rem' }}>
                Based in Buenos Aires. Currently at EY, previously at MODO, HeySam and Drixit. 9 years across fintech, AI and IoT, working with products that reach 6M+ people.
              </p>
              <p className="bio-desktop-only" style={{ ...pStyle, margin: '12px 0 0', fontSize: '0.875rem' }}>
                Also building <a href="https://www.youtube.com/@UXBS-Cris" target="_blank" rel="noopener noreferrer" className="uxbs-link">uxbs</a>, a YouTube channel and lab about product design and what happens when designers start building. I'm in this because design is one of the few tools that can genuinely change how people experience the world.
              </p>
              <p className="bio-desktop-only" style={{ ...pStyle, margin: '12px 0 0', fontSize: '0.875rem' }}>
                If any of that sounds like a fit, <a href="https://calendar.app.google/q37dZacRGpmM2wgy7" target="_blank" rel="noopener noreferrer" className="uxbs-link">let's talk</a>.
              </p>
            </div>

            <Divider />
            <div id="work">
            <WorkFolders />
            </div>

            <Divider />
            <GitHubActivitySection />

            <Divider />
            <StackSection />

            <Divider />
            <PersonalSection />

          </Card>
        </div>
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
