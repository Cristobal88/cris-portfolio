import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

const Home      = lazy(() => import('./pages/home'))
const CaseStudy = lazy(() => import('./pages/use-case'))
const Resume    = lazy(() => import('./pages/resume'))
const PropiDemo = lazy(() => import('./pages/propi-demo'))

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

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
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
