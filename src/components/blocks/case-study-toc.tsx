import React, { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export type TOCItem = {
  id: string
  label: string
  /** Optional icon element shown before the label */
  icon?: React.ReactNode
  /** If true, this item is a non-link group header (renders uppercase + collapsible) */
  group?: boolean
  /** Where to align the element in the viewport when scrolling. Defaults to 'start'. */
  scrollBlock?: ScrollLogicalPosition
  children?: TOCItem[]
}

const T1     = '#ffffff'
const T2     = 'rgba(255,255,255,0.78)'
const T3     = 'rgba(255,255,255,0.55)'
const T4     = 'rgba(255,255,255,0.40)'
const BORDER = 'rgba(255,255,255,0.08)'

function flattenIds(items: TOCItem[]): string[] {
  return items.flatMap(item => [
    ...(item.group ? [] : [item.id]),
    ...flattenIds(item.children ?? []),
  ])
}

export function CaseStudyTOC({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId]   = useState<string>('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [hovered, setHovered]     = useState<string | null>(null)

  // Scroll-based active tracking: the last section whose top is at or above the
  // threshold (130 px from viewport top — below the fixed dock) becomes active.
  useEffect(() => {
    const ids = flattenIds(items)

    const update = () => {
      let current = ids[0] ?? ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= 130) current = id
      }
      setActiveId(current)
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [items])

  const scrollTo = (item: TOCItem) => {
    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: item.scrollBlock ?? 'start' })
  }

  const toggle = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const renderItem = (item: TOCItem, depth = 0): React.ReactNode => {
    const isActive   = !item.group && activeId === item.id
    const isHovered  = hovered === item.id
    const hasChildren = (item.children?.length ?? 0) > 0
    const isCollapsed = collapsed[item.id]

    // Group header: uppercase label, not an anchor, only collapses
    if (item.group) {
      return (
        <div key={item.id}>
          <div
            onClick={() => hasChildren && toggle(item.id)}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px 4px',
              cursor: hasChildren ? 'pointer' : 'default',
              userSelect: 'none',
            }}
          >
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: T4,
              textTransform: 'uppercase',
            }}>
              {item.label}
            </span>
            {hasChildren && (
              isCollapsed
                ? <ChevronRight size={10} color={T4} style={{ flexShrink: 0 }} />
                : <ChevronDown  size={10} color={T4} style={{ flexShrink: 0 }} />
            )}
          </div>
          {!isCollapsed && hasChildren && (
            <div>
              {item.children!.map(child => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    // Regular item
    return (
      <div key={item.id}>
        <div
          onClick={() => hasChildren ? toggle(item.id) : scrollTo(item)}
          onMouseEnter={() => setHovered(item.id)}
          onMouseLeave={() => setHovered(null)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: depth === 0
              ? '7px 10px'
              : `6px 10px 6px ${10 + depth * 14}px`,
            borderRadius: 8,
            background: isActive
              ? 'rgba(255,255,255,0.10)'
              : isHovered
                ? 'rgba(255,255,255,0.05)'
                : 'transparent',
            color: isActive ? T1 : isHovered ? T2 : T2,
            fontSize: depth === 0 ? '0.8125rem' : '0.75rem',
            fontWeight: isActive ? 600 : 400,
            lineHeight: 1.4,
            cursor: 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease',
            userSelect: 'none',
          }}
        >
          {/* Vertical connector line for nested items */}
          {depth > 0 && (
            <span style={{
              position: 'absolute',
              left: 10 + (depth - 1) * 14 + 6,
              top: 0,
              bottom: 0,
              width: 1,
              background: BORDER,
            }} />
          )}

          {/* Optional icon */}
          {item.icon && (
            <span style={{ flexShrink: 0, color: T3, display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </span>
          )}

          <span style={{ flex: 1 }}>{item.label}</span>

          {/* Expand/collapse chevron for items with children */}
          {hasChildren && (
            isCollapsed
              ? <ChevronRight size={11} color={T4} style={{ flexShrink: 0 }} />
              : <ChevronDown  size={11} color={T4} style={{ flexShrink: 0 }} />
          )}
        </div>

        {/* Children */}
        {hasChildren && !isCollapsed && (
          <div>
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav
      className="cs-toc"
      aria-label="On this page"
      style={{
        position: 'fixed',
        top: 160,
        right: 72,
        width: 104,
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        fontFamily: 'Barlow, sans-serif',
        zIndex: 80,
      }}
    >
      {/* Header */}
      <p style={{
        fontSize: '0.875rem',
        fontWeight: 400,
        letterSpacing: '0.01em',
        color: T4,
        margin: '0 0 12px',
        padding: '0 10px',
      }}>
        On this case
      </p>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map(item => renderItem(item))}
      </div>
    </nav>
  )
}
