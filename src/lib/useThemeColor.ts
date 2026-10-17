import { useEffect } from 'react'

/**
 * Sets <meta name="theme-color"> for the duration the component is mounted.
 * Restores the previous value on unmount so navigating back works correctly.
 */
export function useThemeColor(color: string) {
  useEffect(() => {
    let tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const prev = tag?.getAttribute('content') ?? '#ffffff'

    if (!tag) {
      tag = document.createElement('meta')
      tag.name = 'theme-color'
      document.head.appendChild(tag)
    }

    tag.setAttribute('content', color)

    return () => {
      tag!.setAttribute('content', prev)
    }
  }, [color])
}
