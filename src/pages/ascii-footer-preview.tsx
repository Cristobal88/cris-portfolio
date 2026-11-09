import React, { useEffect, useRef, useState } from 'react'
import { useControls, folder, button, Leva } from 'leva'
import { SCENE_DEFAULTS, mountScene } from './ascii-footer-scene'
import type { SceneCfg } from './ascii-footer-scene'

// ─── Live-tweak preview (browser-only, dev only) ─────────────────────────────
// Visit /preview/ascii-footer — not linked from the live portfolio.
// Space to pause, A to toggle ASCII mode.

const D = SCENE_DEFAULTS

export default function AsciiFooterPreview() {
  const mountRef   = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | undefined>(undefined)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isFirst    = useRef(true)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setRef = useRef<(values: Record<string, any>) => void>(() => {})

  // ── Scene controls (any change triggers debounced rebuild) ────────────────
  const [values, set] = useControls(() => ({
    Camera: folder({
      camFov:  { value: D.camFov,  min: 20,  max: 100, step: 1,   label: 'FOV' },
      camY:    { value: D.camY,    min: 1,   max: 30,  step: 0.5, label: 'Y height' },
      camZ:    { value: D.camZ,    min: -20, max: 0,   step: 0.5, label: 'Z forward' },
      targetY: { value: D.targetY, min: -10, max: 20,  step: 0.5, label: 'Horizon tilt' },
      targetZ: { value: D.targetZ, min: 20,  max: 80,  step: 1,   label: 'Target Z' },
      'Reset Camera': button(() => setRef.current({
        camFov: D.camFov, camY: D.camY, camZ: D.camZ, targetY: D.targetY, targetZ: D.targetZ,
      })),
    }),

    Sky: folder({
      skyExpand:    { value: D.skyExpand,    min: 0,    max: 2,    step: 0.05, label: 'Sky expand (no tilt)' },
      colSkyLow:    { value: D.colSkyLow,    label: 'Color low' },
      colSkyHigh:   { value: D.colSkyHigh,   label: 'Color high' },
      skyFadeStart: { value: D.skyFadeStart, min: 0, max: 1, step: 0.01, label: 'Fade start' },
      skyFadeEnd:   { value: D.skyFadeEnd,   min: 0, max: 1, step: 0.01, label: 'Fade end' },
      inkMulSky:    { value: D.inkMulSky,    min: 0.5, max: 2,   step: 0.01, label: 'Ink density' },
      bgMulSky:     { value: D.bgMulSky,     min: 0.3, max: 1.5, step: 0.01, label: 'BG brightness' },
      cloudAmt:       { value: D.cloudAmt,       min: 0, max: 1,    step: 0.01, label: 'Cloud amount' },
      cloudThreshold: { value: D.cloudThreshold, min: 0, max: 0.85, step: 0.01, label: 'Cloud threshold' },
      cloudScaleX:    { value: D.cloudScaleX,    min: 0.3, max: 6,  step: 0.1,  label: 'Cloud scale X' },
      cloudScaleY:    { value: D.cloudScaleY,    min: 0.5, max: 12, step: 0.1,  label: 'Cloud scale Y' },
      cloudSpeed:     { value: D.cloudSpeed,     min: 0, max: 0.05, step: 0.001, label: 'Cloud speed' },
      cloudYLow:      { value: D.cloudYLow,      min: 0, max: 1,    step: 0.01, label: 'Cloud band bottom' },
      cloudYHigh:     { value: D.cloudYHigh,     min: 0, max: 1,    step: 0.01, label: 'Cloud band top' },
      colCloud:       { value: D.colCloud,        label: 'Cloud color' },
      'Reset Sky': button(() => setRef.current({
        skyExpand: D.skyExpand, colSkyLow: D.colSkyLow, colSkyHigh: D.colSkyHigh,
        skyFadeStart: D.skyFadeStart, skyFadeEnd: D.skyFadeEnd,
        inkMulSky: D.inkMulSky, bgMulSky: D.bgMulSky,
        cloudAmt: D.cloudAmt, cloudThreshold: D.cloudThreshold,
        cloudScaleX: D.cloudScaleX, cloudScaleY: D.cloudScaleY, cloudSpeed: D.cloudSpeed,
        cloudYLow: D.cloudYLow, cloudYHigh: D.cloudYHigh, colCloud: D.colCloud,
      })),
    }),

    Water: folder({
      colWaterShallow:  { value: D.colWaterShallow,  label: 'Shallow color' },
      colWaterMid:      { value: D.colWaterMid,      label: 'Mid color' },
      colWaterDeep:     { value: D.colWaterDeep,     label: 'Deep color' },
      waterDepthNear:   { value: D.waterDepthNear,   min: 0.5, max: 10,   step: 0.5,  label: 'Depth: shallow end' },
      waterDepthFar:    { value: D.waterDepthFar,    min: 3,   max: 40,   step: 1,    label: 'Depth: deep start' },
      waterWaveSpeed:   { value: D.waterWaveSpeed,   min: 0,   max: 4,    step: 0.05, label: 'Wave speed' },
      waterWaveScale:   { value: D.waterWaveScale,   min: 0.5, max: 20,   step: 0.1,  label: 'Wave frequency' },
      waterWaveNoise:   { value: D.waterWaveNoise,   min: 0,   max: 8,    step: 0.1,  label: 'Wave distortion' },
      waterNoiseScale:  { value: D.waterNoiseScale,  min: 0.05,max: 1.0,  step: 0.01, label: 'Noise scale' },
      waterFoamWidth:   { value: D.waterFoamWidth,   min: 0.02,max: 0.6,  step: 0.01, label: 'Foam crest width' },
      waterFoamAmt:     { value: D.waterFoamAmt,     min: 0.3, max: 0.9,  step: 0.01, label: 'Foam amount' },
      waterFoamRange:   { value: D.waterFoamRange,   min: 1,   max: 20,   step: 0.5,  label: 'Foam range' },
      waterSparkle:     { value: D.waterSparkle,     min: 0,   max: 3,    step: 0.05, label: 'Sun sparkle' },
      'Reset Water': button(() => setRef.current({
        colWaterShallow: D.colWaterShallow, colWaterMid: D.colWaterMid, colWaterDeep: D.colWaterDeep,
        waterDepthNear: D.waterDepthNear, waterDepthFar: D.waterDepthFar,
        waterWaveSpeed: D.waterWaveSpeed, waterWaveScale: D.waterWaveScale,
        waterWaveNoise: D.waterWaveNoise, waterNoiseScale: D.waterNoiseScale,
        waterFoamWidth: D.waterFoamWidth, waterFoamAmt: D.waterFoamAmt,
        waterFoamRange: D.waterFoamRange, waterSparkle: D.waterSparkle,
      })),
    }),

    Terrain: folder({
      shoreZ:       { value: D.shoreZ,       min: 2,     max: 25,    step: 0.5,  label: 'Shore Z' },
      waterFar:     { value: D.waterFar,     min: 40,    max: 120,   step: 2,    label: 'Water far' },
      vegDensity:   { value: D.vegDensity,   min: 5000,  max: 80000, step: 1000, label: 'Veg density' },
      vegClusters:  { value: D.vegClusters,  min: 10,    max: 200,   step: 5,    label: 'Veg clusters' },
      vegClusterGap:{ value: D.vegClusterGap,min: 1,     max: 20,    step: 0.5,  label: 'Cluster spacing' },
      vegSizeVar:   { value: D.vegSizeVar,   min: 0,     max: 1,     step: 0.05, label: 'Size variation' },
      pathOffsetZ: { value: D.pathOffsetZ, min: 0,     max: 14,   step: 0.1,   label: 'Path depth (Z)' },
      pathAngle:   { value: D.pathAngle,   min: 0,     max: 0.08, step: 0.001, label: 'Path frequency' },
      pathCurve:   { value: D.pathCurve,   min: 0,     max: 6,    step: 0.1,   label: 'Path wave' },
      'Reset Terrain': button(() => setRef.current({
        shoreZ: D.shoreZ, waterFar: D.waterFar,
        vegDensity: D.vegDensity, vegClusters: D.vegClusters,
        vegClusterGap: D.vegClusterGap, vegSizeVar: D.vegSizeVar,
        pathOffsetZ: D.pathOffsetZ, pathAngle: D.pathAngle, pathCurve: D.pathCurve,
      })),
    }),

    Mountains: folder({
      showMountains:  { value: D.showMountains, label: 'Show mountains' },
      mtnNearZ:       { value: D.mtnNearZ,       min: 25,  max: 60,  step: 1,    label: 'Near Z' },
      mtnFarZ:        { value: D.mtnFarZ,         min: 40,  max: 80,  step: 1,    label: 'Far Z' },
      mtnNearH:       { value: D.mtnNearH,        min: 4,   max: 30,  step: 0.5,  label: 'Near height' },
      mtnFarH:        { value: D.mtnFarH,         min: 4,   max: 40,  step: 0.5,  label: 'Far height' },
      mtnNearSnow:    { value: D.mtnNearSnow,     min: 0,   max: 1,   step: 0.01, label: 'Near snow' },
      mtnFarSnow:     { value: D.mtnFarSnow,      min: 0,   max: 1,   step: 0.01, label: 'Far snow' },
      mtnWaviness:    { value: D.mtnWaviness,     min: 0,   max: 2.5, step: 0.05, label: 'Ridge waviness' },
      mtnLightDir:    { value: D.mtnLightDir,     min: -1,  max: 1,   step: 0.05, label: 'Light direction' },
      mtnShadowDepth: { value: D.mtnShadowDepth,  min: 0,   max: 1,   step: 0.01, label: 'Shadow depth' },
      mtnCouloirs:    { value: D.mtnCouloirs,      min: 0,   max: 1,   step: 0.01, label: 'Couloirs' },
      'Reset Mountains': button(() => setRef.current({
        showMountains: D.showMountains,
        mtnNearZ: D.mtnNearZ, mtnFarZ: D.mtnFarZ,
        mtnNearH: D.mtnNearH, mtnFarH: D.mtnFarH,
        mtnNearSnow: D.mtnNearSnow, mtnFarSnow: D.mtnFarSnow,
        mtnWaviness: D.mtnWaviness, mtnLightDir: D.mtnLightDir, mtnShadowDepth: D.mtnShadowDepth,
        mtnCouloirs: D.mtnCouloirs,
      })),
    }),

    ASCII: folder({
      H:             { value: D.H,             min: 300, max: 900, step: 10,   label: 'Canvas height (px)' },
      cols:          { value: D.cols,          min: 60,  max: 320, step: 2,    label: 'Columns' },
      rows:          { value: D.rows,          min: 20,  max: 120, step: 1,    label: 'Rows' },
      inkMulDefault: { value: D.inkMulDefault, min: 0.5, max: 2,   step: 0.01, label: 'Ink (other)' },
      inkMulMtn:     { value: D.inkMulMtn,     min: 0.5, max: 2.5, step: 0.01, label: 'Ink mountains' },
      inkMulSnow:    { value: D.inkMulSnow,    min: 0.5, max: 2,   step: 0.01, label: 'Ink snow' },
      bgMulDefault:  { value: D.bgMulDefault,  min: 0.3, max: 1.5, step: 0.01, label: 'BG (other)' },
      bgMulMtn:      { value: D.bgMulMtn,      min: 0.3, max: 1.5, step: 0.01, label: 'BG mountains' },
      bgMulSnow:     { value: D.bgMulSnow,     min: 0.3, max: 1.5, step: 0.01, label: 'BG snow' },
      'Reset ASCII': button(() => setRef.current({
        H: D.H, cols: D.cols, rows: D.rows,
        inkMulDefault: D.inkMulDefault, inkMulMtn: D.inkMulMtn, inkMulSnow: D.inkMulSnow,
        bgMulDefault: D.bgMulDefault, bgMulMtn: D.bgMulMtn, bgMulSnow: D.bgMulSnow,
      })),
    }),

    Colors: folder({
      colGround:        { value: D.colGround,        label: 'Ground' },
      colMtnNear:       { value: D.colMtnNear,       label: 'Mtn near (lit)' },
      colMtnNearBase:   { value: D.colMtnNearBase,   label: 'Mtn near base' },
      colMtnNearShadow: { value: D.colMtnNearShadow, label: 'Mtn near shadow' },
      colMtnFar:        { value: D.colMtnFar,        label: 'Mtn far (lit)' },
      colMtnFarBase:    { value: D.colMtnFarBase,    label: 'Mtn far base' },
      colMtnFarShadow:  { value: D.colMtnFarShadow,  label: 'Mtn far shadow' },
      colSnow:          { value: D.colSnow,          label: 'Snow' },
      'Reset Colors': button(() => setRef.current({
        colGround: D.colGround,
        colMtnNear: D.colMtnNear, colMtnNearBase: D.colMtnNearBase, colMtnNearShadow: D.colMtnNearShadow,
        colMtnFar: D.colMtnFar,   colMtnFarBase: D.colMtnFarBase,   colMtnFarShadow: D.colMtnFarShadow,
        colSnow: D.colSnow,
      })),
    }, { collapsed: true }),
  }))

  setRef.current = set

  // ── Vignette controls (pure CSS — no scene rebuild) ──────────────────────
  const [vig, setVig] = useControls(() => ({
    Vignette: folder({
      previewWidth: { value: 700, min: 300, max: 1440, step: 10, label: 'Preview width (px)' },
      vigCorner: { value: 24, min: 0, max: 120, step: 2,  label: 'Corner radius (px)' },
      vigEdge:   { value: 16, min: 0, max: 80,  step: 1,  label: 'Edge softness (px)' },
      vigTop:    { value: 20, min: 0, max: 60,  step: 1,  label: 'Top fade %' },
      vigBottom: { value: 14, min: 0, max: 60,  step: 1,  label: 'Bottom fade %' },
      vigSides:  { value: 8,  min: 0, max: 40,  step: 1,  label: 'Side fade %' },
      'Reset Vignette': button(() => setVig({ previewWidth: 700, vigCorner: 24, vigEdge: 16, vigTop: 20, vigBottom: 14, vigSides: 8 })),
    }),
  }))

  // border-radius clips the canvas to rounded corners; the gradient overlay
  // then fades all four edges inward on top of the clipped content.
  const wrapStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: vig.previewWidth,
    borderRadius: `${vig.vigCorner}px`,
    overflow: 'hidden',
  }
  const r = vig.vigCorner
  const overlayStyle: React.CSSProperties = {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    boxShadow: vig.vigEdge > 0 ? `inset 0 0 ${vig.vigEdge}px 0px white` : 'none',
    background: [
      // Radial gradients at each corner: solid white up to the border-radius,
      // then a 3px fade to transparent. This covers the 1px aliasing artifact
      // that overflow:hidden + border-radius leaves behind in every browser/GPU.
      ...(r > 0 ? [
        `radial-gradient(circle at 0px 0px,         white ${r - 1}px, transparent ${r + 2}px)`,
        `radial-gradient(circle at 100% 0px,        white ${r - 1}px, transparent ${r + 2}px)`,
        `radial-gradient(circle at 0px 100%,        white ${r - 1}px, transparent ${r + 2}px)`,
        `radial-gradient(circle at 100% 100%,       white ${r - 1}px, transparent ${r + 2}px)`,
      ] : []),
      // Edge fades
      `linear-gradient(to bottom, white 0%, transparent ${vig.vigTop}%)`,
      `linear-gradient(to top,    white 0%, transparent ${vig.vigBottom}%)`,
      `linear-gradient(to right,  white 0%, transparent ${vig.vigSides}%)`,
      `linear-gradient(to left,   white 0%, transparent ${vig.vigSides}%)`,
    ].join(', '),
  }

  // Leva returns { r,g,b } objects for hex color inputs — convert back
  function toHex(v: unknown): string {
    if (typeof v === 'string') return v
    if (v && typeof v === 'object') {
      const c = v as { r: number; g: number; b: number }
      const h = (n: number) => Math.round(n).toString(16).padStart(2, '0')
      return `#${h(c.r)}${h(c.g)}${h(c.b)}`
    }
    return '#000000'
  }

  const toCfg = (v: typeof values): SceneCfg => ({
    W: D.W, H: v.H,
    camFov: v.camFov, camY: v.camY, camZ: v.camZ,
    targetY: v.targetY, targetZ: v.targetZ, skyExpand: v.skyExpand,
    shoreZ: v.shoreZ, waterFar: v.waterFar,
    waterWaveSpeed: v.waterWaveSpeed, waterWaveScale: v.waterWaveScale, waterWaveNoise: v.waterWaveNoise,
    waterNoiseScale: v.waterNoiseScale, waterFoamWidth: v.waterFoamWidth, waterFoamAmt: v.waterFoamAmt,
    waterFoamRange: v.waterFoamRange, waterSparkle: v.waterSparkle,
    waterDepthNear: v.waterDepthNear, waterDepthFar: v.waterDepthFar,
    vegDensity: v.vegDensity, vegClusters: v.vegClusters,
    vegClusterGap: v.vegClusterGap, vegSizeVar: v.vegSizeVar,
    pathOffsetZ: v.pathOffsetZ, pathAngle: v.pathAngle, pathCurve: v.pathCurve,
    showMountains: v.showMountains,
    mtnNearZ: v.mtnNearZ, mtnFarZ: v.mtnFarZ,
    mtnNearH: v.mtnNearH, mtnFarH: v.mtnFarH,
    mtnNearSnow: v.mtnNearSnow, mtnFarSnow: v.mtnFarSnow,
    mtnWaviness: v.mtnWaviness, mtnLightDir: v.mtnLightDir, mtnShadowDepth: v.mtnShadowDepth, mtnCouloirs: v.mtnCouloirs,
    cols: v.cols, rows: v.rows,
    skyFadeStart: v.skyFadeStart, skyFadeEnd: v.skyFadeEnd,
    inkMulSky: v.inkMulSky, inkMulDefault: v.inkMulDefault, inkMulMtn: v.inkMulMtn, inkMulSnow: v.inkMulSnow,
    bgMulSky: v.bgMulSky, bgMulDefault: v.bgMulDefault, bgMulMtn: v.bgMulMtn, bgMulSnow: v.bgMulSnow,
    colWaterShallow:  toHex(v.colWaterShallow),
    colWaterMid:      toHex(v.colWaterMid),
    colWaterDeep:     toHex(v.colWaterDeep),
    colGround:        toHex(v.colGround),
    colMtnNear:       toHex(v.colMtnNear),
    colMtnNearBase:   toHex(v.colMtnNearBase),
    colMtnNearShadow: toHex(v.colMtnNearShadow),
    colMtnFar:        toHex(v.colMtnFar),
    colMtnFarBase:    toHex(v.colMtnFarBase),
    colMtnFarShadow:  toHex(v.colMtnFarShadow),
    colSnow:          toHex(v.colSnow),
    colSkyLow:        toHex(v.colSkyLow),
    colSkyHigh:       toHex(v.colSkyHigh),
    cloudAmt: v.cloudAmt, cloudThreshold: v.cloudThreshold,
    cloudScaleX: v.cloudScaleX, cloudScaleY: v.cloudScaleY, cloudSpeed: v.cloudSpeed,
    cloudYLow: v.cloudYLow, cloudYHigh: v.cloudYHigh,
    colCloud: toHex(v.colCloud),
  })

  // Initial mount
  useEffect(() => {
    if (!mountRef.current) return
    cleanupRef.current?.()
    cleanupRef.current = mountScene(mountRef.current, toCfg(values))
    return () => {
      if (timerRef.current !== undefined) clearTimeout(timerRef.current)
      cleanupRef.current?.()
      cleanupRef.current = undefined
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced rebuild on any scene control change
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    if (timerRef.current !== undefined) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!mountRef.current) return
      cleanupRef.current?.()
      cleanupRef.current = mountScene(mountRef.current, toCfg(values))
    }, 200)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)])

  function copyConfig() {
    const cfg = toCfg(values)
    // Format as the body of SCENE_DEFAULTS so it can be pasted directly
    const lines = [
      `  W: ${cfg.W}, H: ${cfg.H}, cols: ${cfg.cols}, rows: ${cfg.rows},`,
      `  camFov: ${cfg.camFov}, camY: ${cfg.camY}, camZ: ${cfg.camZ}, targetY: ${cfg.targetY}, targetZ: ${cfg.targetZ}, skyExpand: ${cfg.skyExpand},`,
      `  vegDensity: ${cfg.vegDensity}, vegClusters: ${cfg.vegClusters}, vegClusterGap: ${cfg.vegClusterGap}, vegSizeVar: ${cfg.vegSizeVar},`,
      `  shoreZ: ${cfg.shoreZ}, waterFar: ${cfg.waterFar},`,
      `  waterWaveSpeed: ${cfg.waterWaveSpeed}, waterWaveScale: ${cfg.waterWaveScale}, waterWaveNoise: ${cfg.waterWaveNoise},`,
      `  waterNoiseScale: ${cfg.waterNoiseScale}, waterFoamWidth: ${cfg.waterFoamWidth}, waterFoamAmt: ${cfg.waterFoamAmt},`,
      `  waterFoamRange: ${cfg.waterFoamRange}, waterSparkle: ${cfg.waterSparkle}, waterDepthNear: ${cfg.waterDepthNear}, waterDepthFar: ${cfg.waterDepthFar},`,
      `  pathOffsetZ: ${cfg.pathOffsetZ}, pathAngle: ${cfg.pathAngle}, pathCurve: ${cfg.pathCurve},`,
      `  mtnNearZ: ${cfg.mtnNearZ}, mtnFarZ: ${cfg.mtnFarZ},`,
      `  mtnNearH: ${cfg.mtnNearH}, mtnFarH: ${cfg.mtnFarH},`,
      `  mtnNearSnow: ${cfg.mtnNearSnow}, mtnFarSnow: ${cfg.mtnFarSnow},`,
      `  showMountains: ${cfg.showMountains},`,
      `  mtnWaviness: ${cfg.mtnWaviness}, mtnLightDir: ${cfg.mtnLightDir}, mtnShadowDepth: ${cfg.mtnShadowDepth}, mtnCouloirs: ${cfg.mtnCouloirs},`,
      `  colMtnNearShadow: '${cfg.colMtnNearShadow}', colMtnFarShadow: '${cfg.colMtnFarShadow}',`,
      `  colMtnNear: '${cfg.colMtnNear}', colMtnNearBase: '${cfg.colMtnNearBase}',`,
      `  colMtnFar: '${cfg.colMtnFar}', colMtnFarBase: '${cfg.colMtnFarBase}',`,
      `  colSnow: '${cfg.colSnow}',`,
      `  colWaterShallow: '${cfg.colWaterShallow}', colWaterMid: '${cfg.colWaterMid}', colWaterDeep: '${cfg.colWaterDeep}',`,
      `  colGround: '${cfg.colGround}',`,
      `  colSkyLow: '${cfg.colSkyLow}', colSkyHigh: '${cfg.colSkyHigh}',`,
      `  cloudAmt: ${cfg.cloudAmt}, cloudThreshold: ${cfg.cloudThreshold},`,
      `  cloudScaleX: ${cfg.cloudScaleX}, cloudScaleY: ${cfg.cloudScaleY}, cloudSpeed: ${cfg.cloudSpeed},`,
      `  cloudYLow: ${cfg.cloudYLow}, cloudYHigh: ${cfg.cloudYHigh}, colCloud: '${cfg.colCloud}',`,
      `  skyFadeStart: ${cfg.skyFadeStart}, skyFadeEnd: ${cfg.skyFadeEnd},`,
      `  inkMulSky: ${cfg.inkMulSky}, inkMulDefault: ${cfg.inkMulDefault}, inkMulMtn: ${cfg.inkMulMtn}, inkMulSnow: ${cfg.inkMulSnow},`,
      `  bgMulSky: ${cfg.bgMulSky}, bgMulDefault: ${cfg.bgMulDefault}, bgMulMtn: ${cfg.bgMulMtn}, bgMulSnow: ${cfg.bgMulSnow},`,
    ]
    navigator.clipboard.writeText(lines.join('\n'))
      .then(() => setCopied(true))
      .catch(() => { /* ignore */ })
    setTimeout(() => setCopied(false), 2000)
  }

  const [copied, setCopied] = useState(false)

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '40px 320px 0 0' }}>
      <Leva titleBar={{ title: 'ASCII Scene' }} />
      <p style={{ color: 'rgba(0,0,0,0.3)', fontFamily: 'monospace', fontSize: 13, marginBottom: 16 }}>
        ascii-footer preview — space to pause, A to toggle ASCII
      </p>
      <div style={wrapStyle}>
        <div ref={mountRef} />
        <div style={overlayStyle} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <button onClick={copyConfig} style={{
          padding: '7px 18px', border: '1px solid rgba(0,0,0,0.18)',
          borderRadius: 6, background: copied ? '#e8f7f0' : '#fff',
          color: copied ? '#008859' : 'rgba(0,0,0,0.6)',
          fontFamily: 'monospace', fontSize: 12, cursor: 'pointer',
          transition: 'all 0.15s',
        }}>
          {copied ? 'Copied!' : 'Copy config'}
        </button>
        <span style={{ color: 'rgba(0,0,0,0.3)', fontFamily: 'monospace', fontSize: 11 }}>
          paste into SCENE_DEFAULTS in ascii-footer-scene.ts
        </span>
      </div>
      <div style={{
        width: '100%', maxWidth: 1440,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 32px 28px',
        color: 'rgba(0,0,0,0.35)', fontFamily: 'Barlow, sans-serif', fontSize: 13,
      }}>
        <span>2025 Cristobal Lemoine</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="https://www.linkedin.com/in/cristoballemoine" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(0,0,0,0.35)', textDecoration: 'none' }}>LinkedIn</a>
          <a href="https://github.com/Cristobal88" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(0,0,0,0.35)', textDecoration: 'none' }}>GitHub</a>
        </div>
      </div>
    </div>
  )
}
