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
    company: 'EY',
    description: 'Enterprise product design for AI-enabled platforms used by 400K+ professionals globally.',
  },
  {
    kind: 'single' as const,
    dates: '2025 — 2026',
    role: 'Lead Product Designer',
    company: 'HeySam',
    description: 'Product Design 0→1 for an AI-native sales tool.',
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
    kind: 'single' as const,
    dates: '2020 — 2022',
    role: 'Product Designer',
    company: 'Drixit',
    description: 'Shipped IoT and Industry 4.0 products across 2 product ecosystems.',
  },
]

const SKILLS = [
  'Product Design', 'UX Research', 'Design Systems', 'Prototyping',
  'Design Strategy', 'Interaction Design', 'User Testing', 'Figma',
  'Design Leadership', 'Cross-functional Collaboration',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: 'rgba(0,0,0,0.42)', margin: '0 0 16px',
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

// ─── Sections ─────────────────────────────────────────────────────────────────

function ExperienceSection() {
  const dateStyle: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.50)', paddingTop: 2, whiteSpace: 'nowrap',
  }

  return (
    <div>
      <SectionLabel>Experience</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {EXPERIENCE.map((item) => (
          <div
            key={item.kind === 'single' ? item.company + item.dates : item.company}
            className="exp-row"
            style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0 16px' }}
          >
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
                        {r.dates}
                        {r.tag && (
                          <span style={{ marginLeft: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 4, padding: '1px 6px', fontSize: '0.6875rem', fontWeight: 500 }}>
                            {r.tag}
                          </span>
                        )}
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
          <Card style={{ padding: '40px 48px', margin: '0 auto 100px', maxWidth: 680, position: 'relative' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                {/* Photo */}
                <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', flexShrink: 0 }}>
                  <img
                    src="/team/cristobal-lemoine.webp"
                    alt="Cristobal Lemoine"
                    width={72} height={72}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '60% 0%', transform: 'scale(1.35) translateY(-8%)', transformOrigin: '60% 0%' }}
                  />
                </div>

                {/* Name + title + location + links */}
                <div>
                  <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d0d0d', lineHeight: 1.3, margin: 0 }}>
                    Cristobal Lemoine
                  </h1>
                  <p style={{ fontSize: '0.875rem', fontWeight: 400, color: 'rgba(0,0,0,0.45)', lineHeight: 1.4, margin: '2px 0 10px' }}>
                    Staff Product Designer
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'rgba(0,0,0,0.40)', fontWeight: 500 }}>
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

              {/* Download button — top-right */}
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
