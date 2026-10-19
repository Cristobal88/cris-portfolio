import React from 'react'
import { FONT, COLOR } from '../tokens'

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
}

export default function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div style={{
      height: 72,
      borderBottom: `0.5px solid #ececec`,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <div style={{ padding: '12px 8px', flexShrink: 0 }}>{icon}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <p style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 400,
          color: COLOR.textSecondary,
          fontFamily: FONT.body,
          lineHeight: '19px',
        }}>
          {label}
        </p>
        <p style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 500,
          color: COLOR.textDark,
          fontFamily: FONT.body,
          lineHeight: '22px',
        }}>
          {value}
        </p>
      </div>
    </div>
  )
}
