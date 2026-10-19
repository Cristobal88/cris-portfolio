import React from 'react'
import { FONT, COLOR } from '../tokens'

interface AmountDisplayProps {
  value: string
  showCaret?: boolean
  emptyColor?: string
  filledColor?: string
}

export default function AmountDisplay({
  value,
  showCaret = true,
  emptyColor = COLOR.placeholder,
  filledColor = COLOR.textDark,
}: AmountDisplayProps) {
  const isEmpty = !value

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0 }}>
      {isEmpty ? (
        <>
          <span style={{
            color: emptyColor,
            fontSize: 22,
            fontWeight: 700,
            lineHeight: '28px',
            fontFamily: FONT.body,
          }}>$</span>
          {showCaret && (
            <div className="input-caret" style={{
              width: 2,
              height: 32,
              background: emptyColor,
              borderRadius: 1,
              margin: '0 2px',
              alignSelf: 'center',
            }} />
          )}
          <span style={{
            color: emptyColor,
            fontSize: 40,
            fontWeight: 500,
            lineHeight: '56px',
            fontFamily: FONT.body,
          }}>0</span>
        </>
      ) : (
        <>
          <span style={{
            color: filledColor,
            fontSize: 22,
            fontWeight: 700,
            lineHeight: '28px',
            fontFamily: FONT.body,
          }}>$</span>
          <span style={{
            color: filledColor,
            fontSize: 40,
            fontWeight: 500,
            lineHeight: '56px',
            fontFamily: FONT.body,
          }}>{value}</span>
          {showCaret && (
            <div className="input-caret" style={{
              width: 2,
              height: 32,
              background: COLOR.green,
              borderRadius: 1,
              margin: '0 1px',
              alignSelf: 'center',
            }} />
          )}
        </>
      )}
    </div>
  )
}
