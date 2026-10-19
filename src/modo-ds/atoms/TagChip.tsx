import React from 'react'
import { FONT } from '../tokens'

interface TagChipProps {
  label: string
  value?: string
  valueColor?: string
  trailingIcon?: React.ReactNode
  onClick?: () => void
}

export default function TagChip({
  label,
  value,
  valueColor = '#0049c4',
  trailingIcon,
  onClick,
}: TagChipProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: '#fff',
        border: '1px solid #ececec',
        borderRadius: 100,
        padding: '6px 12px',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
      }}
    >
      {label && (
        <span style={{
          fontSize: 14,
          fontWeight: 500,
          color: '#121212',
          fontFamily: FONT.body,
          lineHeight: '20px',
        }}>
          {label}
        </span>
      )}
      {value && (
        <span style={{
          fontSize: 14,
          fontWeight: 500,
          color: valueColor,
          fontFamily: FONT.body,
          lineHeight: '20px',
        }}>
          {value}
        </span>
      )}
      {trailingIcon && trailingIcon}
    </div>
  )
}
