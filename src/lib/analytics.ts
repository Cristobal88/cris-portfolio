declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

export function trackEvent(name: string, params?: Record<string, string | number>) {
  send(name, params)
}

function send(name: string, params?: Record<string, string | number>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}

export function trackCtaClick(label: string) {
  send('cta_click', { cta_label: label })
}

export function trackSectionView(section: string) {
  send('section_view', { section_name: section })
}

export function trackScrollDepth(percent: number) {
  send('scroll_depth', { percent })
}
