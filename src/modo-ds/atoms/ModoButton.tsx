import React from 'react'
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
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      height: 56,
      borderRadius: RADIUS.button,
      background: disabled ? 'rgba(18,18,18,0.05)' : COLOR.green,
      color: disabled ? '#717171' : '#fff',
      transition: 'background 0.25s ease, color 0.25s ease',
    },
    ghost: {
      height: 40,
      background: 'transparent',
      color: '#fff',
    },
    overlay: {
      height: 44,
      borderRadius: RADIUS.button,
      background: COLOR.overlay,
      color: '#fff',
    },
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {icon && icon}
      {children}
    </button>
  )
}
