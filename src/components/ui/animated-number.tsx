import { useEffect, useRef, useState } from 'react'

export function AnimatedNumber({ value, style }: { value: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimating(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      <span className={`t-digit-group${animating ? ' is-animating' : ''}`} style={style}>
        {value.split('').map((char, i) => (
          <span key={i} className="t-digit" {...(i > 0 ? { 'data-stagger': String(i) } : {})}>
            {char}
          </span>
        ))}
      </span>
    </div>
  )
}
