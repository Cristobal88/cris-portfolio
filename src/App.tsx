import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'

const Home       = lazy(() => import('./pages/home'))
const CaseStudy  = lazy(() => import('./pages/use-case'))
const Resume     = lazy(() => import('./pages/resume'))
const PropiDemo  = lazy(() => import('./pages/propi-demo'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    // Move focus to main content so keyboard/screen-reader users land on the new page
    const main = document.getElementById('main-content') ?? document.querySelector('main')
    if (main) {
      main.setAttribute('tabindex', '-1')
      main.focus({ preventScroll: true })
    }
  }, [pathname])
  return null
}

// Intercepts light<->dark route transitions and plays a circular clip-path reveal.
// capture:true fires before any child stopPropagation. getBoundingClientRect()
// forces the browser to commit the initial clip-path before the transition starts.
// Chunks are pre-loaded so the new page renders under the overlay in time.
const REVEAL_DURATION = 480 // ms

// Track where the pointer went down so we can ignore click events that are
// the tail end of a drag rather than a true tap.
let _downX = 0
let _downY = 0

function NavTransition() {
  const navigate = useNavigate()

  useEffect(() => {
    // Pre-load main route chunks so they are ready when the user first navigates
    import('./pages/use-case').catch(() => {})
    import('./pages/home').catch(() => {})
  }, [])

  useEffect(() => {
    const trackDown = (e: PointerEvent) => {
      _downX = e.clientX
      _downY = e.clientY
    }

    const handleClick = (e: MouseEvent) => {
      // If the pointer moved more than 6px between down and click it was a drag — skip
      const dragDist = Math.hypot(e.clientX - _downX, e.clientY - _downY)
      if (dragDist > 6) return
      const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || anchor.target === '_blank') return

      const goingToDark   = href.startsWith('/work/')
      const currentlyDark = window.location.pathname.startsWith('/work/')
      if (goingToDark === currentlyDark) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      e.preventDefault()
      e.stopPropagation()

      const x = e.clientX
      const y = e.clientY
      const color = goingToDark ? '#050505' : '#ffffff'

      const overlay = document.createElement('div')
      overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99999',
        `background:${color}`,
        `clip-path:circle(0% at ${x}px ${y}px)`,
        'pointer-events:none',
        'will-change:clip-path',
      ].join(';')
      document.body.appendChild(overlay)

      // getBoundingClientRect forces a synchronous layout so the browser registers
      // clip-path:circle(0%) before we set the animated end value
      overlay.getBoundingClientRect()
      overlay.style.transition = `clip-path ${REVEAL_DURATION}ms cubic-bezier(0.4,0,0.2,1)`
      overlay.style.clipPath = `circle(150% at ${x}px ${y}px)`

      // Navigate early — new page renders under the overlay
      setTimeout(() => navigate(href), 80)

      // Remove overlay after expand — destination bg matches overlay colour, no flash
      setTimeout(() => overlay.remove(), REVEAL_DURATION + 80)
    }

    document.addEventListener('pointerdown', trackDown, true)
    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('pointerdown', trackDown, true)
      document.removeEventListener('click', handleClick, true)
    }
  }, [navigate])

  return null
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <NavTransition />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/work/:slug"  element={<CaseStudy />} />
          <Route path="/resume"      element={<Resume />} />
          <Route path="/demo/propi"  element={<PropiDemo />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
