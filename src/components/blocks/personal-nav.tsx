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
