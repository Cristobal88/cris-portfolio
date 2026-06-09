import { CtaButton } from '@/components/ui/cta-button'

interface PersonalNavProps {
  variant?: 'light' | 'dark'
}

const T_LIGHT = 'rgba(0,0,0,0.50)'
const T_DARK  = 'rgba(255,255,255,0.65)'

export function PersonalNav({ variant = 'light' }: PersonalNavProps) {
  const isDark = variant === 'dark'

  return (
    <nav className={`navbar${isDark ? ' navbar--dark' : ''}`}>
      {/* Left: name */}
      <a
        href="/"
        className="logo"
        style={{ color: isDark ? '#ffffff' : '#111', textDecoration: 'none' }}
      >
        Cristobal
      </a>

      {/* Center: empty to maintain 3-col grid */}
      <div />

      {/* Right: LinkedIn + Book a Call */}
      <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 8 }}>
        <a
          href="https://www.linkedin.com/in/cristoballemoine"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: isDark ? T_DARK : T_LIGHT,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            padding: '8px 14px',
            borderRadius: 9999,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'}`,
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = isDark ? '#ffffff' : '#111'
            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = isDark ? T_DARK : T_LIGHT
            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'
          }}
        >
          LinkedIn
        </a>

        <CtaButton
          href="https://cal.com/cris-y-caro-uxbs-zuy29e/30min"
          data-cal-link="cris-y-caro-uxbs-zuy29e/30min"
          data-cal-namespace="30min"
          data-cal-config='{"layout":"month_view","theme":"dark"}'
          variant="primary"
          gaLabel="book_a_call_nav"
        >
          Book a Call
        </CtaButton>
      </div>
    </nav>
  )
}
