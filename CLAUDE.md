# MODO DS — Portfolio Prototype Reference

This file keeps Claude anchored to the real MODO Design System tokens so values never drift between sessions.

## Project context
Portfolio at https://ux-cris-portfolio.vercel.app — React 18 + TypeScript + Vite + Framer Motion v11 + Tailwind v3 + Supabase.
Routes: `/` (home), `/work/:slug` (case study), `/resume`.
DS prototypes live as new case study pages or standalone route pages.

---

## MODO DS — Figma file
URL: https://www.figma.com/design/YJRNxzC6gM1qDPXGyFUIyF/Slider%20-%20MODO%20DS
Access: Figma Desktop Bridge (figma-console MCP). REST token expired — use WebSocket tools only.

---

## Color tokens (extracted from DS)

```
/* Brand */
--modo-green:        #008859   /* Primary/default — main brand green */
--modo-teal:         #00b6ab   /* SDK accent */
--modo-green-medium: #33a07a   /* Primary/light */
--modo-green-light:  #cce7de   /* Primary/default10–20 range */

/* Text */
--text-dark:         #121212   /* Text/text_dark */
--text-secondary:    #414141   /* Text/text_gray */
--text-placeholder:  #929292   /* Grays/gray60 */

/* Surfaces */
--bg-light:          #f8f8f8   /* Background/background_light */
--bg-white:          #ffffff
--border:            #d0d0d0   /* Grays/gray20 */
--separator:         #eeeeee   /* Grays/gray08 */

/* System */
--system-error:      #e42c2c
```

## Typography

**App font: Red Hat Display** (Google Fonts)
- Regular (400) — body, descriptions
- Medium (500) — labels, card text, UI elements
- Bold (700) — amounts, key figures

**Promo accent: Quicksand Bold** — used on promo cards only

```css
font-family: 'Red Hat Display', sans-serif;
```

## Breakpoints (from DS variables)

| Name    | Width | Height | Margin |
|---------|-------|--------|--------|
| Small   | 320px | 640px  | 16px   |
| Regular | 375px | 667px  | 20px   |
| Medium  | 390px | 844px  | 24px   |
| Large   | 414px | 896px  | 24px   |

Mobile-first. Design target: 390×844 (iPhone 14 standard).

## Spacing scale (MODO convention)
XXXS=4 · XXS=8 · XS=12 · S=16 · R=20 · M=24 · L=32 · XL=48 · XXL=64 · XXXL=80

## Border radius
- S: 8px · M: 12px · L: 16px · XL: 24px · Button: 100px (pill)

---

## SDK Slider — 32 bank themes
The Slider component has a `#SDK Slider` variable collection with one mode per bank.
Each bank overrides `Primary/default` and related color tokens.
Known banks: MODO, Galicia, BBVA, BNA, Brubank, Naranja X, Uala, HSBC, Macro,
Supervielle, Credicoop, Bancor, Hipotecario, Banco Ciudad, ICBC, Comafi, Columbia,
Galicia Mas, Banco del Sol, Buepp, Revolut, SUBE, Patagonia, YOY, Banco Entre Ríos,
Banco San Juan, Banco Corrientes, Banco Santa Cruz, Banco Santa Fe, ICBC 2,
Banco Fantasia Light, Banco Fantasia Dark.

When building the bank-switcher demo, use the actual bank brand colors — do not invent them.

---

## Component naming (DS convention)
- `[E-XX]` Elements/Essentials (Buttons, Slider, Avatar)
- `[C-XX]` Cards
- `[N-XX]` Navigation
- `[TF-XX]` Text Fields
- `[B-XX]` Banners
- `[S-XX]` Selectors
- `[FS-XX]` Feedback / Status
- `[I-XX]` Informative
- `[ES-XX]` Empty States + Loaders
- `[F-XX]` Feed

---

## Workflow: screen-by-screen builds

Each prototype is built one screen at a time:
1. Fetch only the Figma nodes needed for that screen (screenshot + structure)
2. Build the React + Framer Motion component using tokens above
3. No global component library — each prototype is self-contained

**Do not invent color values. Always use the tokens above.**
**Do not use Tailwind color utilities for brand colors — use CSS custom properties or inline styles with the hex values above.**

---

## Copy conventions

- **No em dashes** (`—`). Use a period, a comma, or rewrite the sentence. Em dashes are never acceptable in any copy, labels, captions, or strings in this project.
- **No curly/smart quotes** in JSX strings. Use straight quotes or rewrite.

---

## Motion conventions (Framer Motion v11)
- Entry animations: `initial={{ opacity: 0, y: 16 }}` → `animate={{ opacity: 1, y: 0 }}`
- Stagger children: `staggerChildren: 0.06`
- Spring defaults: `type: 'spring', stiffness: 400, damping: 30`
- Drag (Slider): `drag="y"` with `dragConstraints`, fill progress tied to `y` motion value
- Reduced motion: always respect `useReducedMotion()`
