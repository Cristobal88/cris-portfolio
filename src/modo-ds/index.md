# MODO DS Component Library

Quick reference for all components extracted from `src/pages/propi-demo.tsx`.

Import from `../../modo-ds` (or `../modo-ds` depending on depth).

---

## Tokens (`tokens.ts`)

```ts
import { COLOR, RADIUS, SPACE, FONT } from '../../modo-ds'
```

| Export | Keys |
|--------|------|
| `COLOR` | `green`, `greenMedium`, `greenLight`, `teal`, `textDark`, `textSecondary`, `placeholder`, `bgLight`, `bgWhite`, `border`, `separator`, `error`, `overlay`, `gold` |
| `RADIUS` | `s=8`, `m=12`, `l=16`, `xl=24`, `button=20`, `pill=100` |
| `SPACE` | `xxxs=4`, `xxs=8`, `xs=12`, `s=16`, `r=20`, `m=24`, `l=32`, `xl=48`, `xxl=64` |
| `FONT` | `body` (Red Hat Display), `promo` (Quicksand) |

---

## Atoms — Icons

All icons are pure SVG, no token imports.

| Component | Props | Notes |
|-----------|-------|-------|
| `BackArrowIcon` | none | Dark chevron+line arrow, from Figma node 172:19330 |
| `ReceiptIcon` | none | White receipt outline, 36×36, used in "Comprobante" button |
| `ComprobanteIcon` | none | White receipt outline, 22×22, used in success screen button |
| `MoneyIcon` | none | White banknote icon, 36×36, used in "Propina" button |
| `RewardsGemIcon` | `size?=32`, `gemSize?=20` | Yellow circle + faceted gem |
| `DiamondTrio` | none | Three faceted diamonds (62×36), success screen merchant row |

---

## Atoms — UI

| Component | Key Props | Notes |
|-----------|-----------|-------|
| `ModoButton` | `variant?='primary'\|'ghost'\|'overlay'`, `icon?`, `width?`, `disabled?` | primary=56h green; ghost=40h transparent white; overlay=44h rgba white |
| `TagChip` | `label`, `value?`, `valueColor?='#0049c4'`, `trailingIcon?`, `onClick?` | Pill chip, white bg, 1px #ececec border |
| `TooltipBubble` | `text`, `visible`, `offsetY?=4` | Animated white bubble with downward arrow, `position:absolute` — parent needs `position:relative` |

---

## Molecules

| Component | Key Props | Notes |
|-----------|-----------|-------|
| `BankLogo` | `bank: 'galicia'\|'santafe'`, `size?=36` | Inline SVG bank logos |
| `BankRow` | `logo`, `label`, `sublabel?`, `borderColor?`, `height?=60` | Bordered row for bank account display |
| `AmountDisplay` | `value`, `showCaret?=true`, `emptyColor?`, `filledColor?` | $ + large number + blinking caret |
| `SuccessCheckmark` | `size?=48`, `color?`, `playhead?`, `segStart?`, `segEnd?`, `ckSegStart?`, `ckSegEnd?`, `autoPlay?`, `delay?` | Circle + checkmark draw-on. Driven by `playhead` MotionValue or self-animates when `autoPlay=true` |
| `InfoRow` | `icon`, `label`, `value` | Icon + label/value column, 72px tall, used in verify screen |

---

## Organisms

| Component | Key Props | Notes |
|-----------|-----------|-------|
| `ConfirmSlider` | `complete`, `onComplete` | MODO DS vertical swipe slider with pulse ring and animated track |
| `PlayerControls` | `playhead`, `isPlaying`, `isDone`, `onPlay`, `onPause`, `onReplay`, `onSeek` | Fixed bottom-right scrubber + play/pause/replay controls |

---

## Source

All components extracted from `src/pages/propi-demo.tsx`.
