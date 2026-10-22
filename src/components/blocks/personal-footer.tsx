import { useState, useEffect } from 'react'

const WMO_DESC: Record<number, string> = {
  0: 'clear', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'foggy', 48: 'foggy',
  51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain',
  71: 'light snow', 73: 'snow', 75: 'heavy snow',
  80: 'showers', 81: 'showers', 82: 'heavy showers',
  95: 'thunderstorm', 96: 'thunderstorm', 99: 'thunderstorm',
}

function wmoDesc(code: number): string {
  return WMO_DESC[code] ?? 'cloudy'
}

function getBATime(): string {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase()
}

function useBATime() {
  const [time, setTime] = useState(getBATime)
  useEffect(() => {
    const id = setInterval(() => setTime(getBATime()), 15_000)
    return () => clearInterval(id)
  }, [])
  return time
}

function useBAWeather() {
  const [weather, setWeather] = useState<string | null>(null)
  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-34.6037&longitude=-58.3816&current=temperature_2m,weather_code&temperature_unit=fahrenheit&forecast_days=1'
    )
      .then(r => r.json())
      .then(data => {
        const temp = Math.round(data.current.temperature_2m)
        const desc = wmoDesc(data.current.weather_code)
        setWeather(`${temp}°f ${desc}`)
      })
      .catch(() => { /* silent fail */ })
  }, [])
  return weather
}

export function PersonalFooter() {
  const time = useBATime()
  const weather = useBAWeather()

  const linkStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.35)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    fontSize: '0.8125rem',
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
      fontFamily: 'Barlow, sans-serif',
    }}>
      {/* bobby.so-style location bar */}
      <div style={{
        padding: '20px 32px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.75rem' }}>
          designed in buenos aires, argentina
        </span>
        {(time || weather) && (
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.75rem' }}>
            {time}{weather ? ` · ${weather}` : ''}
          </span>
        )}
      </div>

      {/* Main footer row */}
      <div style={{
        padding: '20px 32px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8125rem' }}>
          © 2025 — 2026 Cristobal Lemoine
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
      </div>
    </footer>
  )
}
