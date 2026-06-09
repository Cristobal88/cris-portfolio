export function PersonalFooter() {
  const linkStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.35)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    fontSize: 13,
  }

  const handleEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = 'rgba(255,255,255,0.80)'
  }
  const handleLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
  }

  return (
    <footer style={{
      background: '#0d0d0d',
      padding: '28px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16,
      fontFamily: 'Barlow, sans-serif',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
        © 2026 Cristobal Lemoine
      </span>
      <div style={{ display: 'flex', gap: 24 }}>
        <a
          href="https://www.linkedin.com/in/cristoballemoine"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/Cristobal88"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}
