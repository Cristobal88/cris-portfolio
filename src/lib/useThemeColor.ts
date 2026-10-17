import { useEffect } from 'react'

/**
 * Sets <meta name="theme-color"> for the duration the component is mounted.
 * Removes and reinserts the tag on each change to force iOS Safari to re-read it
 * (setAttribute alone is not always picked up on SPA navigation).
 */
export function useThemeColor(color: string) {
  useEffect(() => {
    const existing = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const prev = existing?.getAttribute('content') ?? '#ffffff'
    existing?.remove()

    const tag = document.createElement('meta')
    tag.name = 'theme-color'
    tag.setAttribute('content', color)
    document.head.appendChild(tag)

    return () => {
      tag.remove()
      const restore = document.createElement('meta')
      restore.name = 'theme-color'
      restore.setAttribute('content', prev)
      document.head.appendChild(restore)
    }
  }, [color])
}
