import React, { useState } from 'react'
import { COLOR, FONT, RADIUS } from '../tokens'

interface ModoButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'overlay'
  icon?: React.ReactNode
  width?: number | string
  disabled?: boolean
  style?: React.CSSProperties
}

export default function ModoButton({
  children,
  onClick,
  variant = 'primary',
  icon,
  width = '100%',
  disabled = false,
  style,
}: ModoButtonProps) {
  const [pressed, setPressed] = useState(false)

  const base: React.CSSProperties = {
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: FONT.body,
    fontSize: 16,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width,
    WebkitTapHighlightColor: 'transparent',
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      height: 56,
      borderRadius: RADIUS.button,
      background: disabled ? 'rgba(18,18,18,0.05)' : pressed ? '#00471b' : COLOR.green,
      color: disabled ? '#717171' : '#fff',
      transition: pressed ? 'none' : 'background 0.2s ease',
    },
    ghost: {
      height: 40,
      background: pressed ? 'rgba(255,255,255,0.1)' : 'transparent',
      color: '#fff',
      transition: pressed ? 'none' : 'background 0.2s ease',
    },
    overlay: {
      height: 44,
      borderRadius: RADIUS.button,
      background: pressed ? 'rgba(255,255,255,0.28)' : COLOR.overlay,
      color: '#fff',
      transition: pressed ? 'none' : 'background 0.2s ease',
    },
  }

  const pressHandlers = disabled ? {} : {
    onMouseDown:  () => setPressed(true),
    onMouseUp:    () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    onTouchStart: () => setPressed(true),
    onTouchEnd:   () => setPressed(false),
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      {...pressHandlers}
    >
      {icon && icon}
      {children}
    </button>
  )
}
