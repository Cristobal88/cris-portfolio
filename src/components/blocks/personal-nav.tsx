import { CtaButton } from '@/components/ui/cta-button'

interface PersonalNavProps {
  variant?: 'light' | 'dark'
}

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
        Cris
      </a>

      {/* Center: empty to maintain 3-col grid */}
      <div />

      {/* Right: Book a Call */}
      <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 8 }}>

        <CtaButton
          href="https://calendar.app.google/q37dZacRGpmM2wgy7"
          variant="primary"
        >
          Book a Call
        </CtaButton>
      </div>
    </nav>
  )
}
