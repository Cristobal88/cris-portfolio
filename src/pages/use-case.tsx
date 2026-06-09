import { useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCaseStudy } from '@/hooks/useCaseStudy'
import { PersonalNav } from '@/components/blocks/personal-nav'
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

export default function CaseStudy() {
  const { slug } = useParams<{ slug: string }>()
  const { data: project, nextProject, loading, notFound } = useCaseStudy(slug)

  if (loading) {
    return (
      <div style={{ background: '#050505', color: T1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow, sans-serif' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: BLUE, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div style={{ background: '#050505', color: T1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow, sans-serif', gap: 16 }}>
        <p style={{ color: T3, fontSize: 14 }}>Project not found.</p>
        <a href="/" style={{ color: BLUE, fontSize: 14, textDecoration: 'none' }}>← Back to home</a>
      </div>
    )
  }

  const altVisuals  = project.workVisuals.slice(0, 2)
  const wideVisuals = project.workVisuals.slice(2)

  return (
    <div style={{ background: '#050505', color: T1, fontFamily: 'Barlow, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <div className="gradient-blur" />
      <PersonalNav variant="dark" />

      {/* ── Hero ── */}
      <section style={{ paddingTop: 'clamp(100px, 9vw, 104px)', paddingBottom: 0 }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', paddingTop: 0 }}>

          {/* Back link */}
          <a href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T3, textDecoration: 'none', fontSize: 13, fontWeight: 500, marginBottom: 20, transition: 'color 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = T1)}
            onMouseLeave={e => (e.currentTarget.style.color = T3)}
          >
            <ArrowLeft size={12} strokeWidth={2.5} />
            Back
          </a>

          {/* Scope pill */}
          <div style={{ marginBottom: 28 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '0.3px', color: T4, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 9999, padding: '5px 14px' }}>
              {project.scopePill}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(40px, 4.5vw, 72px)', lineHeight: 1.08, letterSpacing: '-1px', color: T1, maxWidth: 900, margin: '0 0 48px' }}>
            {project.outcomeHeadline}
          </h1>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', justifyContent: 'start', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, paddingTop: 28, paddingBottom: 28 }}>
            {project.stats.map((stat, i) => (
              <div key={i} style={{ paddingRight: i < 2 ? 48 : 0, paddingLeft: i > 0 ? 48 : 0, borderRight: i < 2 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ marginBottom: 6 }}>
                  <AnimatedNumber value={stat.value} style={{ fontFamily: 'Barlow, sans-serif', fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 700, letterSpacing: '-2px', color: T1, lineHeight: 1 }} />
                </div>
                <div style={{ fontSize: 12, color: T4, fontWeight: 500 }}>{stat.label}</div>
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

      {/* ── Context ── */}
      {project.context && (
        <section className="cs-section--sm" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64, alignItems: 'start' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-1.5px', color: T1, lineHeight: 1.1, margin: 0 }}>
                  {project.contextTitle ?? 'The context'}
                </h2>
              </div>
              <div>
                {project.context.split('\n\n').map((para, i, arr) => (
                  <p key={i} style={{ fontSize: 17, lineHeight: 1.8, color: T2, marginBottom: i < arr.length - 1 ? 18 : 0 }}>{para}</p>
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
                <h2 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(30px, 3.2vw, 52px)', lineHeight: 1.12, letterSpacing: '-0.8px', color: T1, marginBottom: 28 }}>
                  {project.problemHeadline}
                </h2>
                {project.problemExpanded.split('\n\n').map((para, i, arr) => (
                  <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: T3, marginBottom: i < arr.length - 1 ? 12 : 0 }}>{para}</p>
                ))}
              </div>
              {project.problemInsights && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48 }}>
                  {project.problemInsights.map((insight, i) => (
                    <div key={i}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: T1, marginBottom: 12, letterSpacing: '-0.2px' }}>
                        {i + 1}. {insight.title}
                      </p>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: T3, margin: 0 }}>{insight.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64 }}>
              <div>
                <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-1.5px', color: T1, marginBottom: 20, lineHeight: 1.2 }}>
                  What was broken
                </h2>
                {project.problemExpanded.split('\n\n').map((para, i, arr) => (
                  <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: T2, marginBottom: i < arr.length - 1 ? 16 : 0 }}>{para}</p>
                ))}
              </div>
              <div>
                <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-1.5px', color: T1, marginBottom: 20, lineHeight: 1.2 }}>
                  Our role
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.75, color: T2, marginBottom: 32 }}>{project.ourRole}</p>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.3px', color: T4, marginBottom: 14 }}>Deliverables</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {project.deliverables.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: T2 }}>
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
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-1.5px', color: T1, margin: 0 }}>
              {project.designTitle ?? 'The design'}
            </h2>
            <span style={{ fontSize: 12, color: T4, fontWeight: 500 }}>Some visuals and values have been altered to comply with NDA. The outcomes and decisions shown are real.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
            {altVisuals.map((visual, i) => {
              const imageLeft = i % 2 === 0
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48, alignItems: 'center' }}>
                  <div style={{ order: imageLeft ? 0 : 1 }}>
                    <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${BORDER}`, background: SURFACE, aspectRatio: '4/3' }}>
                      <img src={visual.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  </div>
                  <div style={{ order: imageLeft ? 1 : 0 }}>
                    {visual.title && (
                      <h3 style={{ fontSize: 'clamp(20px, 2vw, 30px)', fontWeight: 500, letterSpacing: '-0.8px', color: T1, marginBottom: 16, lineHeight: 1.25 }}>
                        {visual.title}
                      </h3>
                    )}
                    <p style={{ fontSize: 16, lineHeight: 1.75, color: T2, margin: 0 }}>{visual.caption}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {wideVisuals.length > 0 && (
            <div style={{ marginTop: 80, display: 'flex', flexDirection: 'column', gap: 56 }}>
              {wideVisuals.map((visual, i) => (
                <div key={i}>
                  <div style={{ maxWidth: 680, marginBottom: 32 }}>
                    {visual.title && (
                      <h3 style={{ fontSize: 'clamp(20px, 2vw, 30px)', fontWeight: 500, letterSpacing: '-0.8px', color: T1, marginBottom: 14, lineHeight: 1.25 }}>
                        {visual.title}
                      </h3>
                    )}
                    <p style={{ fontSize: 16, lineHeight: 1.75, color: T2, margin: 0 }}>{visual.caption}</p>
                  </div>
                  <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${BORDER}`, background: SURFACE, aspectRatio: '21/9' }}>
                    <img src={visual.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Key Decisions ── */}
      <section className="cs-section" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-1.5px', color: T1, marginBottom: 48 }}>
            {project.decisionTitle ?? 'The decision'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {project.keyDecisions.map((decision, i) => (
              <div key={i} className="decision-grid decision-row" style={{ padding: '48px 0', borderTop: `1px solid ${BORDER}`, alignItems: 'start' }}>
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <AnimatedNumber value={`0${i + 1}`} style={{ fontFamily: 'Barlow, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: T4 }} />
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: T3, margin: 0 }}>{decision.challenge}</p>
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
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 500, letterSpacing: '-1.5px', color: T1, marginBottom: 48 }}>
            {project.proofTitle ?? 'The proof'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 48, marginBottom: 48 }}>
            {project.results.map((result, i) => (
              <div key={i}>
                <div style={{ marginBottom: 10 }}>
                  <AnimatedNumber value={result.value} style={{ fontFamily: 'Barlow, sans-serif', fontSize: 'clamp(34px, 3.5vw, 52px)', fontWeight: 700, letterSpacing: '-2.5px', color: T1, lineHeight: 1 }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T3, marginBottom: 10 }}>{result.label}</div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: T4, margin: 0 }}>{result.context}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: T2, maxWidth: 680 }}>{project.resultsParagraph}</p>
        </div>
      </section>

      {/* ── Up Next ── */}
      {nextProject && (
        <section className="cs-section--sm" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 32px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.3px', color: T4, marginBottom: 20 }}>Up next</p>
            <p style={{ fontSize: 'clamp(20px, 2vw, 30px)', fontWeight: 500, letterSpacing: '-0.8px', color: T1, marginBottom: 20, lineHeight: 1.3, maxWidth: 640 }}>
              {nextProject.problem}
            </p>
            <a
              href={`/work/${nextProject.slug}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: T3, textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = T1)}
              onMouseLeave={e => (e.currentTarget.style.color = T3)}
            >
              View case study <ArrowRight size={14} strokeWidth={2} />
            </a>
          </div>
        </section>
      )}

      <PersonalCta />
      <PersonalFooter />
    </div>
  )
}

