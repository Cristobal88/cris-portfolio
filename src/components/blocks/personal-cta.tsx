export function PersonalCta() {
  return (
    <section
      style={{
        background: '#080808',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: 'clamp(64px, 8vw, 96px) 32px',
        textAlign: 'center',
        fontFamily: 'Barlow, sans-serif',
      }}
    >
      <p style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.3px',
        color: 'rgba(255,255,255,0.38)', marginBottom: 20,
        textTransform: 'uppercase',
      }}>
        Get in touch
      </p>

      <h2 style={{
        fontFamily: "'Instrument Serif', serif",
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 'clamp(32px, 4vw, 56px)',
        letterSpacing: '-1px',
        color: '#ffffff',
        lineHeight: 1.1,
        marginBottom: 20,
      }}>
        Let's build something great.
      </h2>

      <p style={{
        fontSize: 16,
        color: 'rgba(255,255,255,0.50)',
        maxWidth: 480,
        margin: '0 auto 40px',
        lineHeight: 1.65,
      }}>
        I'm available for senior product design roles and consulting engagements.
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href="https://cal.com/cris-y-caro-uxbs-zuy29e/30min"
          data-cal-link="cris-y-caro-uxbs-zuy29e/30min"
          data-cal-namespace="30min"
          data-cal-config='{"layout":"month_view","theme":"dark"}'
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#ffffff', color: '#111',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
            padding: '12px 24px', borderRadius: 9999,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.12)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = ''
          }}
        >
          Book a Call
        </a>
        <a
          href="https://www.linkedin.com/in/cristoballemoine"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: 'rgba(255,255,255,0.70)',
            fontSize: 14, fontWeight: 500, textDecoration: 'none',
            padding: '12px 24px', borderRadius: 9999,
            border: '1px solid rgba(255,255,255,0.12)',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ffffff'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.70)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          }}
        >
          LinkedIn
        </a>
      </div>
    </section>
  )
}
