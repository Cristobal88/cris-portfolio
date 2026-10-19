import React from 'react'
import { RADIUS, FONT } from '../tokens'

interface BankRowProps {
  logo: React.ReactNode
  label: string
  sublabel?: string
  borderColor?: string
  height?: number
}

export default function BankRow({
  logo,
  label,
  sublabel,
  borderColor = 'rgba(245,245,245,0.7)',
  height = 60,
}: BankRowProps) {
  return (
    <div style={{
      border: `0.5px solid ${borderColor}`,
      borderRadius: RADIUS.button,
      display: 'flex',
      alignItems: 'center',
      height,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 24 }}>
        <div style={{ flexShrink: 0 }}>{logo}</div>
        <div>
          <p style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 500,
            color: '#fff',
            lineHeight: '22px',
            fontFamily: FONT.body,
          }}>
            {label}
          </p>
          {sublabel && (
            <p style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: '19px',
              fontFamily: FONT.body,
            }}>
              {sublabel}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
