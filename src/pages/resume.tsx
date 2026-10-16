import { useEffect, useState } from 'react'
import { Download, MapPin } from 'lucide-react'
import { AppDock } from '@/components/blocks/app-dock'
import { PersonalFooter } from '@/components/blocks/personal-footer'
import { Card } from '@/components/ui/card'
import { chime } from '@/lib/chime'

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    kind: 'single' as const,
    dates: '2026 — Present',
    role: 'Lead Product Designer',
    company: 'EY GDS',
    bullets: [
      'Own and lead discovery, research and design across multiple global enterprise initiatives for platforms used by 400K+ professionals globally.',
      'Set direction for AI-enabled experiences including LLM-powered assistants, generative content and intelligent workflows.',
      'Strengthen and evolve enterprise design systems (tokens, components and documentation) used by distributed global teams.',
    ],
  },
  {
    kind: 'single' as const,
    dates: '2025 — 2026',
    role: 'Lead Product Designer',
    company: 'HeySam',
    bullets: [
      'Owned the full 0 to 1 design lifecycle: UX flows, UI systems and prototyping for an AI-native sales copilot.',
      'Designed AI-driven workflows including intelligent demo automation and real-time sales collaboration features.',
      'Partnered with the founder on product vision, roadmap and go-to-market design strategy.',
    ],
  },
  {
    kind: 'group' as const,
    dates: '2022 — 2025',
    company: 'MODO',
    category: 'Fintech',
    roles: [
      {
        role: 'Tech Lead Product Designer',
        dates: '2025',
        tag: 'Promoted',
        bullets: [
          'Defined UX strategy through OKRs and roadmap planning for 2 core squads as the UX decision owner for QR and NFC payments.',
          'Created a UX QA framework that became the company-wide standard across multiple squads in a regulated fintech environment.',
          'Owned end-to-end NFC tap-to-pay UX from POC to V1, reaching 66K+ MAU across 30+ partner banks via a plug-and-play SDK.',
        ],
      },
      {
        role: 'Product Designer',
        dates: '2022 — 2025',
        bullets: [
          'Designed a digital tipping flow across 30+ partner banks generating 15K completed tips with 16% conversion in the first 30 days.',
          'Designed the SUBE bus card top-up experience supporting 100K+ MAU in the first 6 months.',
          'Owned the 0 to 1 UX of a loyalty platform, leading from discovery to pilot launch with Axion and enabling a new business vertical.',
        ],
      },
    ],
  },
  {
    kind: 'single' as const,
    dates: '2020 — 2022',
    role: 'Product Designer',
    company: 'Drixit Technologies',
    bullets: [
      'Built a mobile-first design system aligned with desktop components to improve consistency across platforms.',
      'Designed mobile and dashboard experiences for managers supervising workers in high-risk industrial environments.',
      'Translated IoT wearable data into actionable interfaces for real-time safety monitoring and operational decisions.',
    ],
  },
  {
    kind: 'single' as const,
    dates: '2019 — 2020',
    role: 'UX Designer',
    company: 'Summa Solutions',
    bullets: [
      'Collaborated with delivery teams (product, engineering, QA) to design and iterate on features in a software factory environment.',
      'Contributed to usability and conversion improvements by refining information architecture, interaction patterns and visual hierarchy.',
      'Supported multiple client projects in parallel, adapting quickly to different domains, requirements and timelines.',
    ],
  },
]


const SKILLS = [
  'Product Design', 'UX Research', 'Design Systems', 'Prototyping',
  'Design Strategy', 'Interaction Design', 'User Testing', 'Figma',
  'Design Leadership', 'Cross-functional Collaboration',
  'UX Strategy', 'Data-Driven Design',
]


// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Download Button ──────────────────────────────────────────────────────────

function DownloadButton() {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href="/Cristobal-Lemoine-CV-EN.pdf"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => chime.cvDownload()}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
        background: '#ffffff',
        border: `1px solid ${hovered ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.10)'}`,
        borderRadius: 8, padding: '7px 14px',
        fontSize: '0.8125rem', fontWeight: 500,
        color: hovered ? '#111' : 'rgba(0,0,0,0.55)',
        textDecoration: 'none',
        transition: 'border-color 0.2s, color 0.2s',
      }}
    >
      Download CV
      <Download size={13} />
    </a>
  )
}

// ─── Bullet list ──────────────────────────────────────────────────────────────

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((text, i) => (
        <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ marginTop: '0.45em', width: 3, height: 3, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontSize: '0.8125rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6 }}>{text}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── Shared experience row renderer ───────────────────────────────────────────

type ExpItem = typeof EXPERIENCE[number]

function ExpRow({ item }: { item: ExpItem }) {
  const dateStyle: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.50)', paddingTop: 2, whiteSpace: 'nowrap',
  }

  return (
    <div
      key={item.kind === 'single' ? item.company + item.dates : item.company}
      className="exp-row"
      style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0 16px' }}
    >
      <span className="exp-date" style={dateStyle}>{item.dates}</span>

      {item.kind === 'single' ? (
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d0d0d', margin: '0 0 6px', lineHeight: 1.3 }}>
            {item.role}{' '}
            <span style={{ fontWeight: 400, color: 'rgba(0,0,0,0.45)' }}>· {item.company}</span>
          </p>
          <Bullets items={item.bullets} />
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d0d0d', margin: '0 0 8px', lineHeight: 1.3 }}>
            {item.company}{' '}
            <span style={{ fontWeight: 400, color: 'rgba(0,0,0,0.38)' }}>· {item.category}</span>
          </p>
          <div style={{ borderLeft: '2px solid rgba(0,0,0,0.08)', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {item.roles.map((r) => (
              <div key={r.role}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0d0d0d', margin: 0, lineHeight: 1.3 }}>
                  {r.role}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.40)', margin: '2px 0 6px', lineHeight: 1 }}>
                  {r.dates}
                  {r.tag && (
                    <span style={{ marginLeft: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 4, padding: '1px 6px', fontSize: '0.6875rem', fontWeight: 500 }}>
                      {r.tag}
                    </span>
                  )}
                </p>
                <Bullets items={r.bullets} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function ExperienceSection() {
  return (
    <div>
      <SectionLabel>Experience</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {EXPERIENCE.map((item) => (
          <ExpRow key={item.kind === 'single' ? item.company + item.dates : item.company} item={item} />
        ))}
      </div>
    </div>
  )
}

function SkillsSection() {
  return (
    <div>
      <SectionLabel>Skills</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {SKILLS.map(skill => (
          <span key={skill} style={{
            fontSize: '0.8125rem', fontWeight: 500,
            color: 'rgba(0,0,0,0.55)',
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 6, padding: '4px 10px',
          }}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}



// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Resume() {
  useEffect(() => {
    document.title = 'Resume — Cristobal Lemoine'
  }, [])

  return (
    <div className="home-dot-bg" style={{ minHeight: '100vh', fontFamily: 'Barlow, sans-serif', color: '#0d0d0d' }}>
      <div className="gradient-blur" />
      <div className="gradient-blur-bottom" />
      <AppDock />

      <main id="main-content" className="home-main" tabIndex={-1} style={{ outline: 'none' }}>
        <div className="mx-auto w-full max-w-6xl px-6">
          <Card className="resume-card" style={{ padding: '40px 48px', margin: '0 auto 100px', maxWidth: 680, position: 'relative' }}>

            {/* ── Header ── */}
            <div className="resume-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16 }}>
              <div className="resume-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                {/* Name + title + location + links */}
                <div>
                  <h1 style={{ fontSize: '1.125rem', fontWeight: 400, fontStyle: 'italic', fontFamily: 'Instrument Serif, serif', color: '#0d0d0d', lineHeight: 1.3, margin: 0 }}>
                    Cristobal Lemoine
                  </h1>
                  <p style={{ fontSize: '0.875rem', fontWeight: 400, color: 'rgba(0,0,0,0.45)', lineHeight: 1.4, margin: '2px 0 10px' }}>
                    Staff Product Designer
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span className="resume-location" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'rgba(0,0,0,0.40)', fontWeight: 500 }}>
                      <MapPin size={11} strokeWidth={2} />
                      Buenos Aires, Argentina
                    </span>
                    <a
                      href="https://www.linkedin.com/in/cristoballemoine"
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.40)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#0d0d0d')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.40)')}
                    >
                      LinkedIn
                    </a>
                    <a
                      href="https://github.com/Cristobal88"
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.40)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#0d0d0d')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.40)')}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>

              {/* Download button */}
              <DownloadButton />
            </div>

            <Divider />

            {/* ── About ── */}
            <div>
              <SectionLabel>About</SectionLabel>
              {[
                "For 9+ years, I've been designing and scaling product experiences across Fintech, IoT, SaaS, and AI-native companies. Over 6 million users interact daily with products I've shaped, mostly in industries where a confusing flow isn't just frustrating: it breaks compliance, loses a transaction, or kills trust overnight.",
                "That context shapes how I work. I lead design from the ground up, from early discovery and UX research through high-fidelity UI and delivery, staying close to the details that matter in complex, regulated environments.",
                "I partner with Product, Engineering, and Data not just to execute, but to help define strategy, shift adoption metrics, and connect design decisions to outcomes that show up in the business.",
              ].map((para, i, arr) => (
                <p key={i} style={{
                  fontSize: '0.9375rem', lineHeight: 1.7, fontWeight: 400, textWrap: 'pretty',
                  margin: i < arr.length - 1 ? '0 0 14px' : 0, color: 'rgba(0,0,0,0.65)',
                }}>
                  {para}
                </p>
              ))}
            </div>

            <Divider />
            <ExperienceSection />

            <Divider />
            <SkillsSection />


          </Card>
        </div>
      </main>

      <PersonalFooter />
    </div>
  )
}
