// Lago Argentino ASCII footer scene
// V3: fully cfg-driven — all params injectable via SceneCfg for live tweaking.
//
// Press A to toggle ASCII on/off. Space to pause.
//
import * as THREE from 'three'

// ─── Math helpers (pure, module-level) ───────────────────────────────────────
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const fract = (x: number) => x - Math.floor(x)
const hash2 = (x: number, y: number) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453)
function vnoise(x: number, y: number) {
  const i = Math.floor(x), j = Math.floor(y), f = x - i, g = y - j
  const u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g)
  return (hash2(i, j) * (1 - u) + hash2(i + 1, j) * u) * (1 - v) +
         (hash2(i, j + 1) * (1 - u) + hash2(i + 1, j + 1) * u) * v
}
const fbm = (x: number, y: number) =>
  vnoise(x, y) * .5 + vnoise(x * 2.1 + 3, y * 2.1) * .28 +
  vnoise(x * 4.3, y * 4.3 + 5) * .15 + vnoise(x * 8.7, y * 8.7) * .07

// ─── Surface classes ──────────────────────────────────────────────────────────
const CLS = { sky: 0, water: 1, foam: 2, ground: 3, grass: 4, mtnNear: 5, mtnFar: 6, snow: 7 }

// ─── Material class-tag injection ─────────────────────────────────────────────
function tag(
  mat: THREE.Material,
  cls: number,
  hook?: (s: THREE.WebGLProgramParametersWithUniforms) => void
) {
  mat.onBeforeCompile = s => {
    hook?.(s)
    s.fragmentShader = s.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>\n gl_FragColor.a = ${(cls / 16).toFixed(4)};`
    )
  }
  mat.customProgramCacheKey = () => `cls${cls}${hook ? 1 : 0}`
  return mat
}

// ─── Glyph atlas ─────────────────────────────────────────────────────────────
const GLYPHS = " .'`,:;-~=+*oO$%&#@/\\|_^\u2014"
const GI: Record<string, number> = Object.fromEntries([...GLYPHS].map((c, i) => [c, i]))
const gg = (c: string) => (GI[c] ?? 0).toFixed(1)

function buildAtlas(): THREE.CanvasTexture {
  const tw = 64, th = 120
  const c = document.createElement('canvas')
  c.width = tw * GLYPHS.length; c.height = th
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.font = 'bold 100px Menlo, Monaco, Courier New, monospace'
  ;[...GLYPHS].forEach((ch, i) => {
    if (ch === '\u2014') ctx.fillRect(i * tw, th * 0.44, tw, th * 0.12)
    else ctx.fillText(ch, (i + 0.5) * tw, th * 0.52)
  })
  const t = new THREE.CanvasTexture(c)
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter
  t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.flipY = false
  return t
}

// ─── Scene config ─────────────────────────────────────────────────────────────
export interface SceneCfg {
  // Canvas
  W: number; H: number; cols: number; rows: number
  // Camera
  camFov: number; camY: number; camZ: number
  targetY: number; targetZ: number
  skyExpand: number    // 0 = standard frustum; >0 = extend top only (adds sky without tilting)
  // Vegetation
  vegDensity: number      // total blade instances
  vegClusters: number     // number of cluster centres
  vegClusterGap: number   // min world-units between cluster centres (Poisson spacing)
  vegSizeVar: number      // 0–1: scale variation (0 = all same size, 1 = max range)
  // Layout
  shoreZ: number
  pathOffsetZ: number   // depth (Z) where the path sits in the scene
  pathAngle: number     // sine frequency across X — how often it curves
  pathCurve: number     // sine amplitude in Z — how much it curves in/out
  mtnNearZ: number; mtnFarZ: number
  mtnNearH: number; mtnFarH: number
  mtnNearSnow: number; mtnFarSnow: number
  waterFar: number
  // Mountain visibility + shading
  showMountains: boolean
  mtnWaviness: number       // 0–2: FBM detail on ridge (0 = smooth, 2 = very jagged)
  mtnLightDir: number       // –1=light from left, 0=flat, 1=light from right
  mtnShadowDepth: number    // 0–1: how dark the shadow faces get
  mtnCouloirs: number       // 0–1: strength of vertical couloir/channel striations
  colMtnNearShadow: string  // shadow-face color for near mountains
  colMtnFarShadow: string   // shadow-face color for far mountains
  // Water dynamics
  waterWaveSpeed: number   // wave travel speed
  waterWaveScale: number   // wave frequency (cycles per world unit of depth)
  waterWaveNoise: number   // FBM distortion of wave pattern (0=straight, 8=chaotic)
  waterNoiseScale: number  // FBM spatial scale (smaller = larger noise features)
  waterFoamWidth: number   // wave crest width (saw-wave trail end, 0.05–0.6)
  waterFoamAmt: number     // foam lace density (threshold: lower = more foam)
  waterFoamRange: number   // max world-units from shore where foam appears
  waterSparkle: number     // sun glint intensity (0=none)
  waterDepthNear: number   // distance where shallow blends into mid
  waterDepthFar: number    // distance where mid blends into deep
  // Colors (hex strings — THREE.Color parses these directly)
  colWaterShallow: string; colWaterMid: string; colWaterDeep: string
  colGround: string
  colMtnNear: string; colMtnNearBase: string
  colMtnFar: string;  colMtnFarBase: string
  colSnow: string
  colSkyLow: string; colSkyHigh: string
  // Clouds
  cloudAmt: number       // 0–1 overall opacity/density
  cloudThreshold: number // FBM cutoff — lower = more cloud coverage
  cloudScaleX: number    // horizontal noise scale
  cloudScaleY: number    // vertical noise scale (higher = thinner wisps)
  cloudSpeed: number     // drift speed
  cloudYLow: number      // sky-gradient t where cloud layer starts (0–1)
  cloudYHigh: number     // sky-gradient t where cloud layer peaks (0–1)
  colCloud: string
  // ASCII tuning
  skyFadeStart: number; skyFadeEnd: number
  inkMulSky: number; inkMulDefault: number; inkMulSnow: number
  bgMulSky: number; bgMulDefault: number; bgMulSnow: number
}

// hex() converts [0-1] rgb triple → hex string for DEFAULTS table
const _h = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => Math.round(clamp(v) * 255).toString(16).padStart(2, '0')).join('')

export const SCENE_DEFAULTS: SceneCfg = {
  W: 1440, H: 580, cols: 200, rows: 60,
  vegDensity: 28000, vegClusters: 70, vegClusterGap: 5.5, vegSizeVar: 0.75,
  camFov: 52, camY: 7, camZ: -6, targetY: 0, targetZ: 36, skyExpand: 0.0,
  shoreZ: 10,
  waterWaveSpeed: 0.85, waterWaveScale: 5.2, waterWaveNoise: 3.0,
  waterNoiseScale: 0.26, waterFoamWidth: 0.30, waterFoamAmt: 0.60,
  waterFoamRange: 5.0, waterSparkle: 1.0, waterDepthNear: 3.0, waterDepthFar: 12.0,
  pathOffsetZ: 5.5, pathAngle: 0.018, pathCurve: 1.8,
  mtnNearZ: 40, mtnFarZ: 58,
  mtnNearH: 14, mtnFarH: 20,
  mtnNearSnow: 0.22, mtnFarSnow: 0.55,
  waterFar: 80,
  showMountains: true,
  mtnWaviness: 1.0,
  mtnLightDir: 0.6,
  mtnShadowDepth: 0.42,
  mtnCouloirs: 0.55,
  colMtnNearShadow: _h(0.04, 0.05, 0.10),
  colMtnFarShadow:  _h(0.18, 0.26, 0.38),
  colWaterShallow: _h(0.08, 0.80, 0.82),
  colWaterMid:     _h(0.04, 0.58, 0.72),
  colWaterDeep:    _h(0.02, 0.30, 0.52),
  colGround:       _h(0.60, 0.44, 0.20),
  colMtnNear:      _h(0.12, 0.16, 0.28),
  colMtnNearBase:  _h(0.04, 0.18, 0.38),  // blends into deep water
  colMtnFar:       _h(0.40, 0.55, 0.72),
  colMtnFarBase:   _h(0.20, 0.42, 0.64),  // blends into mid water / sky low
  colSnow:         _h(0.90, 0.94, 0.98),
  colSkyLow:       _h(0.56, 0.76, 0.94),
  colSkyHigh:      _h(0.24, 0.50, 0.84),
  cloudAmt: 0.70, cloudThreshold: 0.50,
  cloudScaleX: 1.6, cloudScaleY: 4.0,
  cloudSpeed: 0.008,
  cloudYLow: 0.30, cloudYHigh: 0.72,
  colCloud: _h(0.92, 0.96, 1.00),
  skyFadeStart: 0.55, skyFadeEnd: 0.90,
  inkMulSky: 1.04, inkMulDefault: 1.18, inkMulSnow: 1.02,
  bgMulSky: 0.78, bgMulDefault: 0.68, bgMulSnow: 0.88,
}

// ─── Mount ───────────────────────────────────────────────────────────────────
export function mountScene(
  container: HTMLElement,
  cfg: SceneCfg = SCENE_DEFAULTS
): () => void {
  // Parse hex colors to THREE.Color once
  const C = {
    waterShallow: new THREE.Color(cfg.colWaterShallow),
    waterMid:     new THREE.Color(cfg.colWaterMid),
    waterDeep:    new THREE.Color(cfg.colWaterDeep),
    ground:       new THREE.Color(cfg.colGround),
    mtnNear:      new THREE.Color(cfg.colMtnNear),
    mtnNearBase:  new THREE.Color(cfg.colMtnNearBase),
    mtnFar:       new THREE.Color(cfg.colMtnFar),
    mtnFarBase:   new THREE.Color(cfg.colMtnFarBase),
    snow:         new THREE.Color(cfg.colSnow),
    skyLow:       new THREE.Color(cfg.colSkyLow),
    skyHigh:      new THREE.Color(cfg.colSkyHigh),
  }

  // Deterministic RNG — reset each mount so rebuilds are identical
  let seed = 42
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // Animated time uniform (local so each scene instance is independent)
  const uTime = { value: 0 }

  // Wind animation hook for grass blades
  function bladeWind(s: THREE.WebGLProgramParametersWithUniforms) {
    s.uniforms.uT = uTime
    s.vertexShader = 'uniform float uT;\n' + s.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float ph = instanceMatrix[3].x * .28 + instanceMatrix[3].z * .18;
      float gust = sin(uT * .55 - ph) * .5 + .5;
      transformed.x += (sin(uT * 1.3 + ph * 2.) * .35 + gust * .5) * .3 * position.y * position.y;
      transformed.z += sin(uT * .85 + ph) * .06 * position.y;`
    )
  }

  // ── Terrain helpers ──────────────────────────────────────────────────────
  function shoreZ(x: number): number {
    return cfg.shoreZ
      + Math.sin(x * 0.038 + 1.2) * 1.6
      + fbm(x * 0.055, 3.1) * 1.2 - 0.4
  }
  // Path runs left-right (X axis). pathZat(x) gives the depth (Z) of the
  // path centre at a given X position — a gentle sine creates a natural curve.
  function pathZat(x: number): number {
    return Math.sin(x * cfg.pathAngle) * cfg.pathCurve + cfg.pathOffsetZ
  }
  function isPath(x: number, z: number): boolean {
    const w = 1.8 + fbm(x * 0.12, z * 0.08 + 7) * 1.2
    return Math.abs(z - pathZat(x)) < w
  }
  function gndH(x: number, z: number): number {
    const sz = shoreZ(x)
    if (z >= sz) return -0.3
    const slope = (sz - z) / 28 * 2.2
    return Math.max(0.05, slope + (fbm(x * 0.07, z * 0.07) - 0.5) * 1.6)
  }

  // ── Mountain silhouette (panoramic, guaranteed continuous ridge) ─────────
  function mtnH(x: number, seed2: number): number {
    const w1 = (0.5 + 0.5 * Math.sin(x * 0.020 + seed2 * 0.7)) * 0.32
    const w2 = (0.5 + 0.5 * Math.sin(x * 0.042 + seed2 + 1.1)) * 0.22
    const w3 = (0.5 + 0.5 * Math.sin(x * 0.068 + seed2 * 1.5 + 2.3)) * 0.15
    const p1 = Math.pow(Math.max(0, Math.sin(x * 0.112 + seed2 * 2.1)), 3.0) * 0.16
    const p2 = Math.pow(Math.max(0, Math.sin(x * 0.148 + seed2 * 1.3 + 3.5)), 3.0) * 0.12
    const detail = fbm(x * 0.040 + seed2 * 0.38, seed2 * 0.65 + 1.4) * 0.18 * cfg.mtnWaviness - 0.04
    return clamp(0.22 + w1 + w2 + w3 + p1 + p2 + detail, 0, 1)
  }

  // ── Builders ─────────────────────────────────────────────────────────────
  function buildGround(scene: THREE.Scene) {
    const W = 220
    const D = cfg.shoreZ - cfg.camZ + 4
    const segs = 120
    const g = new THREE.PlaneGeometry(W, D, segs, segs)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const offset = D / 2 + cfg.camZ

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i) + offset
      pos.setY(i, gndH(x, z))

      const sz = shoreZ(x)
      const nearShore = clamp(1.0 - (sz - z) / 3.5, 0.0, 1.0)
      const noise = fbm(x * 0.10, z * 0.10)
      let r: number, gr: number, b: number
      if (isPath(x, z)) {
        r = 0.72 + noise * 0.06; gr = 0.62 + noise * 0.04; b = 0.36 + noise * 0.04
      } else {
        r  = 0.55 + noise * 0.10 + nearShore * 0.14
        gr = 0.40 + noise * 0.07 + nearShore * 0.18
        b  = 0.16 + noise * 0.05 + nearShore * 0.16
      }
      colors[i * 3] = r; colors[i * 3 + 1] = gr; colors[i * 3 + 2] = b
    }

    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    const mesh = new THREE.Mesh(g, tag(new THREE.MeshBasicMaterial({ vertexColors: true }), CLS.ground))
    mesh.position.z = offset
    scene.add(mesh)
  }

  function buildWater(scene: THREE.Scene) {
    const waterD = cfg.waterFar - cfg.shoreZ
    const sh = C.waterShallow, mi = C.waterMid, dp = C.waterDeep
    const mat = new THREE.ShaderMaterial({
      uniforms: { uT: uTime },
      vertexShader: `varying vec3 vW; void main(){ vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
      fragmentShader: /* glsl */`
        uniform float uT; varying vec3 vW;
        float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
        float fbm(vec2 p){ return vn(p)*.55+vn(p*2.1+3.1)*.3+vn(p*4.3+7.7)*.15; }
        void main(){
          float dist = max(0., vW.z - ${cfg.shoreZ.toFixed(2)});
          float n = fbm(vW.xz * ${cfg.waterNoiseScale.toFixed(3)} + vec2(uT*.06, uT*.04));
          float ph = dist * ${cfg.waterWaveScale.toFixed(2)} + uT * ${cfg.waterWaveSpeed.toFixed(3)} + n * ${cfg.waterWaveNoise.toFixed(2)};
          float saw = fract(ph/6.2832);
          float lace = smoothstep(.32, ${cfg.waterFoamAmt.toFixed(3)}, fbm(vW.xz*1.0 + vec2(uT*.16,-uT*.08)));
          float range = smoothstep(${cfg.waterFoamRange.toFixed(2)},1.5,dist)*smoothstep(0.,.4,dist);
          float trail = smoothstep(0.,.04,saw)*(1.-smoothstep(.04,${cfg.waterFoamWidth.toFixed(3)},saw));
          float foam = trail*range*mix(.2,.9,lace);
          vec3 s=vec3(${sh.r.toFixed(3)},${sh.g.toFixed(3)},${sh.b.toFixed(3)});
          vec3 m=vec3(${mi.r.toFixed(3)},${mi.g.toFixed(3)},${mi.b.toFixed(3)});
          vec3 d=vec3(${dp.r.toFixed(3)},${dp.g.toFixed(3)},${dp.b.toFixed(3)});
          vec3 c = mix(s,m,smoothstep(0.,${cfg.waterDepthNear.toFixed(2)},dist));
          c = mix(c,d,smoothstep(${cfg.waterDepthNear.toFixed(2)},${cfg.waterDepthFar.toFixed(2)},dist));
          c *= .85+.28*vn(vW.xz*vec2(.7,.35)+uT*vec2(.18,.26));
          float sp=smoothstep(.78,.92,vn(vW.xz*vec2(1.3,3.0)+uT*vec2(.26,.4)));
          c += vec3(.38,.48,.42)*sp*smoothstep(1.5,4.,dist)*${cfg.waterSparkle.toFixed(3)};
          float cls=1.; if(foam>.25){ c=mix(c,vec3(1.06,1.08,1.04),clamp(foam*1.5,0.,1.)); cls=2.; }
          gl_FragColor = vec4(c, cls/16.);
        }`,
    })
    const geo = new THREE.PlaneGeometry(220, waterD, 1, 1)
    geo.rotateX(-Math.PI / 2)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(0, -0.08, cfg.shoreZ + waterD / 2)
    scene.add(mesh)
  }

  function buildMtnRange(
    scene: THREE.Scene,
    zPos: number, peakH: number, seed2: number,
    bodyColor: THREE.Color, shadowColor: THREE.Color, baseColor: THREE.Color,
    snowFraction: number, cls: number
  ) {
    const W = 280, segs = 300
    // vSegs: vertical subdivision count — gives enough rows for couloir striations
    const vSegs = 12
    const bodyVerts: number[] = [], bodyColors: number[] = [], bodyIdx: number[] = []
    const snowVerts: number[] = [], snowIdx: number[] = []

    // Pre-compute heights for slope calculation
    const heights: number[] = []
    for (let i = 0; i <= segs; i++) {
      heights.push(mtnH(-W / 2 + W * i / segs, seed2) * peakH)
    }

    const lerpC = (a: number, b: number, t: number) => a * (1 - t) + b * t

    for (let i = 0; i <= segs; i++) {
      const x  = -W / 2 + W * i / segs
      const h  = heights[i]
      const hf = clamp(h / peakH, 0, 1)

      // Horizontal slope → slope shadow (same as before)
      const hPrev = heights[Math.max(0, i - 1)]
      const hNext = heights[Math.min(segs, i + 1)]
      const slope = (hNext - hPrev) / (W / segs * 2)
      const slopeT = clamp(slope * cfg.mtnLightDir * cfg.mtnShadowDepth * 2.8, 0, 1)

      for (let j = 0; j <= vSegs; j++) {
        const t  = j / vSegs      // 0 = base, 1 = peak
        const y  = -2 + (h + 2) * t

        if (j === 0) {
          // Base vertex: blend toward baseColor so the foot merges with water
          bodyVerts.push(x, y, zPos)
          bodyColors.push(
            lerpC(lerpC(baseColor.r, bodyColor.r * 0.62, 0.3), shadowColor.r, slopeT * 0.5),
            lerpC(lerpC(baseColor.g, bodyColor.g * 0.65, 0.3), shadowColor.g, slopeT * 0.5),
            lerpC(lerpC(baseColor.b, bodyColor.b * 0.70, 0.3), shadowColor.b, slopeT * 0.5),
          )
          continue
        }

        // ── Couloir (vertical channel) modulation ──────────────────────────
        // Noise is high-frequency horizontally (narrow channels) and low-frequency
        // vertically (channels run most of the height). Seed shifts pattern per range.
        const cNoise = fbm(
          x * 0.28 + seed2 * 1.7,
          t  * 1.4 + seed2 * 0.9 + 4.1
        )
        // coulT: 0 = dark channel floor, 1 = lit rock face
        const coulT = clamp((cNoise - 0.38) / 0.28, 0, 1)

        // Couloir effect fades at the base (talus) and above the snowline
        const snowLineNorm = 1.0 - snowFraction * 0.85
        const baseFade  = clamp(t  * 5.0, 0, 1)
        const snowFade  = clamp((snowLineNorm - t) / (snowFraction * 0.4 + 0.08), 0, 1)
        const couloirAmt = baseFade * snowFade * cfg.mtnCouloirs

        // Channel walls: add a secondary brightening on the sunlit lip of a couloir
        // (the transition edge toward coulT=1) to simulate glancing light on rock edges
        const edgeLit = clamp((coulT - 0.4) / 0.3, 0, 1) * (1 - clamp((coulT - 0.75) / 0.25, 0, 1))
        const edgeBright = edgeLit * couloirAmt * 0.18 * clamp(1 - slopeT * 0.8, 0, 1)

        // Combined shadow: slope shadow + channel darkness
        const channelDark = (1.0 - coulT) * couloirAmt * 0.65
        const totalShadow = clamp(slopeT + channelDark, 0, 1)

        // Height brightening on lit faces
        const tb = 0.80 + hf * 0.24

        bodyVerts.push(x, y, zPos)
        bodyColors.push(
          lerpC(Math.min(1, bodyColor.r * tb + edgeBright), shadowColor.r, totalShadow),
          lerpC(Math.min(1, bodyColor.g * tb * 1.02 + edgeBright), shadowColor.g, totalShadow),
          lerpC(Math.min(1, bodyColor.b * tb * 1.05 + edgeBright * 0.8), shadowColor.b, totalShadow),
        )
      }
    }

    // Build grid indices: (segs) × (vSegs) quads
    for (let i = 0; i < segs; i++) {
      for (let j = 0; j < vSegs; j++) {
        const a = i * (vSegs + 1) + j
        const b = a + 1
        const c = (i + 1) * (vSegs + 1) + j
        const d = c + 1
        bodyIdx.push(a, b, c, b, d, c)
      }
    }

    // Snow strip (unchanged — 2 verts per x, sits atop body mesh)
    for (let i = 0; i <= segs; i++) {
      const x  = -W / 2 + W * i / segs
      const h  = heights[i]
      const sv = fbm(x * 0.08 + seed2 * 1.1, seed2 * 0.6 + 2.0) * 0.55 + 0.45
      snowVerts.push(x, h * (1 - snowFraction * sv), zPos, x, h, zPos)
    }
    for (let i = 0; i < segs; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3
      snowIdx.push(a, b, c, b, d, c)
    }

    const bg = new THREE.BufferGeometry()
    bg.setAttribute('position', new THREE.Float32BufferAttribute(bodyVerts, 3))
    bg.setAttribute('color',    new THREE.Float32BufferAttribute(bodyColors, 3))
    bg.setIndex(bodyIdx); bg.computeVertexNormals()
    scene.add(new THREE.Mesh(bg, tag(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }), cls)))

    const sg = new THREE.BufferGeometry()
    sg.setAttribute('position', new THREE.Float32BufferAttribute(snowVerts, 3))
    sg.setIndex(snowIdx); sg.computeVertexNormals()
    scene.add(new THREE.Mesh(sg, tag(new THREE.MeshBasicMaterial({ color: C.snow, side: THREE.DoubleSide }), CLS.snow)))
  }

  function buildSky(scene: THREE.Scene) {
    const lo = C.skyLow, hi = C.skyHigh
    const cc = new THREE.Color(cfg.colCloud)
    const mat = new THREE.ShaderMaterial({
      depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uT: uTime },
      vertexShader: `
        varying float vY; varying vec2 vUv;
        void main(){ vY=position.y; vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: /* glsl */`
        uniform float uT;
        varying float vY; varying vec2 vUv;

        float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float vn(vec2 p){
          vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);
        }
        float fbm(vec2 p){ return vn(p)*.50+vn(p*2.1+3.3)*.28+vn(p*4.3+7.1)*.14+vn(p*8.9)*.08; }

        void main(){
          float t = clamp(vY / 48.0, 0.0, 1.0);
          vec3 lo  = vec3(${lo.r.toFixed(3)},${lo.g.toFixed(3)},${lo.b.toFixed(3)});
          vec3 hi  = vec3(${hi.r.toFixed(3)},${hi.g.toFixed(3)},${hi.b.toFixed(3)});
          vec3 col = mix(lo, hi, t*t);

          // Cloud band: active between cloudYLow and cloudYHigh in sky-t space
          float band = smoothstep(${cfg.cloudYLow.toFixed(3)}, ${(cfg.cloudYLow+0.12).toFixed(3)}, t)
                     * smoothstep(${cfg.cloudYHigh.toFixed(3)}, ${(cfg.cloudYHigh-0.12).toFixed(3)}, t);

          // Stretched FBM — drift in X over time
          vec2 cuv = vec2(vUv.x * ${cfg.cloudScaleX.toFixed(2)} + uT * ${cfg.cloudSpeed.toFixed(4)},
                          vUv.y * ${cfg.cloudScaleY.toFixed(2)});
          float n = fbm(cuv);
          float cloud = smoothstep(${cfg.cloudThreshold.toFixed(3)}, ${Math.min(cfg.cloudThreshold + 0.28, 1).toFixed(3)}, n);
          cloud *= band * ${cfg.cloudAmt.toFixed(3)};

          vec3 cloudCol = vec3(${cc.r.toFixed(3)},${cc.g.toFixed(3)},${cc.b.toFixed(3)});
          gl_FragColor = vec4(mix(col, cloudCol, cloud), 0.0);
        }`,
    })
    // Sky plane spans y = -65 to +135 (center 35, height 200).
    // At standard camera: visible UV range ≈ 0.15–0.47 → cloud band (0.30–0.72)
    // is in the upper viewport. skyExpand extends the top view to reveal more UV.
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(300, 200), mat)
    mesh.renderOrder = -1
    mesh.position.set(0, 35, 58)
    scene.add(mesh)
  }

  function buildVegetation(scene: THREE.Scene) {
    const bladeGeo = new THREE.BufferGeometry()
    bladeGeo.setAttribute('position', new THREE.Float32BufferAttribute([
      -0.07, 0, 0,  0.07, 0, 0,  0.02, 0.65, 0,
      -0.07, 0, 0,  0.02, 0.65, 0,  0, 1, 0,
    ], 3))
    bladeGeo.setAttribute('normal', new THREE.Float32BufferAttribute(
      [0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1], 3
    ))

    type CType = 'tussock' | 'shrub'
    const clusters: { x: number; z: number; r: number; type: CType }[] = []
    const maxTries = cfg.vegClusters * 18
    const gap = cfg.vegClusterGap

    for (let tries = 0; tries < maxTries && clusters.length < cfg.vegClusters; tries++) {
      const x = -98 + rnd() * 196
      const z = 1.5 + rnd() * (cfg.shoreZ - 3.5)
      if (z >= shoreZ(x) - 0.8) continue
      if (isPath(x, z)) continue
      // Poisson-style minimum spacing — keeps clusters from mushing together
      const tooClose = clusters.some(c => {
        const dx = c.x - x, dz = c.z - z
        return dx * dx + dz * dz < gap * gap
      })
      if (tooClose) continue
      const type: CType = rnd() < 0.62 ? 'tussock' : 'shrub'
      clusters.push({ x, z, r: type === 'tussock' ? 1.8 + rnd() * 2.8 : 1.2 + rnd() * 2.2, type })
    }
    if (!clusters.length) return

    const N = cfg.vegDensity
    const sv = cfg.vegSizeVar  // 0–1 size variation
    const im = new THREE.InstancedMesh(
      bladeGeo,
      tag(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CLS.grass, bladeWind),
      N
    )
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    let count = 0, guard = 0

    while (count < N && guard++ < 4e6) {
      const cl = clusters[Math.floor(rnd() * clusters.length)]
      const angle = rnd() * Math.PI * 2
      // Thin-ring distribution: concentrates blades near cluster edge, leaving centre airier
      const dist = (0.3 + rnd() * 0.7) * cl.r
      const bx = cl.x + Math.cos(angle) * dist
      const bz = cl.z + Math.sin(angle) * dist
      if (bz < 1.5 || bz >= shoreZ(bx) - 0.5 || bx < -110 || bx > 110) continue
      if (isPath(bx, bz)) continue
      const y = gndH(bx, bz)
      if (y < 0.05) continue

      o.position.set(bx, y - 0.04, bz)
      o.rotation.y = rnd() * Math.PI * 2

      // Wider height variation controlled by vegSizeVar
      const sBase = (1.0 - sv * 0.5) + rnd() * sv * 1.4
      if (cl.type === 'tussock') {
        o.scale.set(1.5, sBase, 1.5)
      } else {
        // Shrubs: wider, shorter — distinctive silhouette vs tussocks
        const spread = 1.8 + rnd() * sv * 1.2
        o.scale.set(spread, sBase * 0.5, spread)
      }
      o.updateMatrix()
      im.setMatrixAt(count, o.matrix)

      const tone = fbm(bx * 0.13 + 5, bz * 0.13) * 0.40 + 0.60
      if (cl.type === 'tussock') {
        const warm = 0.55 + rnd() * 0.45
        col.setRGB(
          Math.min(1, (0.70 + warm * 0.18) * tone),
          Math.min(1, (0.48 + warm * 0.14) * tone),
          (0.02 + rnd() * 0.04) * tone
        )
      } else {
        const v = rnd()
        col.setRGB((0.20 + v * 0.12) * tone, (0.28 + v * 0.14) * tone, (0.06 + v * 0.07) * tone)
      }
      im.setColorAt(count++, col)
    }
    im.count = count
    if (im.instanceColor) im.instanceColor.needsUpdate = true
    scene.add(im)
  }

  function buildRocks(scene: THREE.Scene) {
    const g = new THREE.IcosahedronGeometry(1, 1)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i)
      const k = 0.72 + fbm(v.x * 1.8 + 4, v.y * 1.6 + v.z) * 0.55
      pos.setXYZ(i, v.x * k, v.y * k * 0.52, v.z * k)
    }
    g.computeVertexNormals()
    const mat = tag(new THREE.MeshLambertMaterial({ color: new THREE.Color(0.48, 0.44, 0.36) }), CLS.ground)
    const im = new THREE.InstancedMesh(g, mat, 80)
    const o = new THREE.Object3D()
    for (let i = 0; i < 80; i++) {
      const x = -105 + rnd() * 210
      const z = shoreZ(x) - 1.8 + (rnd() - 0.5) * 5.0
      const y = Math.max(0, gndH(x, z))
      const r = 0.18 + rnd() * rnd() * 1.0
      o.position.set(x, y + r * 0.1, z)
      o.rotation.y = rnd() * 6; o.scale.setScalar(r)
      o.updateMatrix(); im.setMatrixAt(i, o.matrix)
    }
    im.castShadow = true
    scene.add(im)
  }

  // ── ASCII fragment shader (cfg-parameterised template literal) ───────────
  const asciiFrag = /* glsl */`
precision highp float;
uniform sampler2D uScene, uAtlas;
uniform vec2 uGrid;
uniform float uTime, uN;
in vec2 vUv; out vec4 outColor;

float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
float lum(vec3 c){ return dot(c,vec3(.25,.6,.15)); }
vec3 grade(vec3 c){
  c=max(c,0.); c=c/(1.+c*.08); c=pow(c,vec3(1./2.2));
  float l=lum(c); c=mix(vec3(l),c,1.30); return clamp(c*1.08,0.,1.);
}

void main(){
  vec2 g = vUv*uGrid, cell=floor(g), cuv=(cell+.5)/uGrid;
  ivec2 sz=textureSize(uScene,0);
  float lodC=log2(float(sz.x)/uGrid.x)+.05;
  vec4 s=textureLod(uScene,cuv,lodC);
  vec3 col=grade(s.rgb);
  float cls=floor(s.a*16.+.5);
  float L=lum(col);

  vec2 e=1./uGrid;
  float lx0=lum(grade(textureLod(uScene,cuv-vec2(e.x,0),lodC).rgb));
  float lx1=lum(grade(textureLod(uScene,cuv+vec2(e.x,0),lodC).rgb));
  float ly0=lum(grade(textureLod(uScene,cuv-vec2(0,e.y),lodC).rgb));
  float ly1=lum(grade(textureLod(uScene,cuv+vec2(0,e.y),lodC).rgb));
  vec2 grad=vec2(lx1-lx0,(ly1-ly0)*.55); float mag=length(grad);
  float a4=mod(atan(grad.y,grad.x)+.3927,3.14159)/.7854;
  float edgeG=a4<1.? ${gg('|')} :a4<2.? ${gg('\\')} :a4<3.? ${gg('\u2014')} : ${gg('/')};

  float jit=(h21(cell*vec2(1.37,2.83))-.5)*.14;
  float w=vn(cell*vec2(.05,.09)+vec2(-uTime*.20,uTime*.06))*2.-1.;
  float gl=${gg('.')};

  if(cls<.5){
    float lj=L+jit*.5;
    gl=lj<.28? ${gg(' ')} :lj<.50? ${gg('.')} :lj<.72? ${gg(':')} : ${gg(';')};
  } else if(cls<1.5){
    gl=L<.20? ${gg('-')} :L<.44?(w>.0? ${gg('~')} : ${gg('-')}) :L<.70? ${gg('~')} : ${gg('=')};
  } else if(cls<2.5){
    gl=L<.52? ${gg('*')} :L<.76? ${gg('%')} : ${gg('#')};
  } else if(cls<3.5){
    float lj=L+jit;
    gl=lj<.18? ${gg(',')} :lj<.38? ${gg(';')} :lj<.62? ${gg('=')} : ${gg('#')};
    if(mag>.10) gl=edgeG;
  } else if(cls<4.5){
    float lj=L+jit*.6;
    float wd=h21(cell+vec2(5.5,7.7))*2.-1.;
    gl=lj<.10? ${gg('.')} :lj<.22? ${gg(',')} :(wd<-.22? ${gg('\\')} :wd>.22? ${gg('/')} : ${gg('|')});
  } else if(cls<5.5){
    float lj=L+jit;
    gl=lj<.16? ${gg(':')} :lj<.36? ${gg('=')} :lj<.58? ${gg('%')} : ${gg('#')};
    if(mag>.10) gl=edgeG;
  } else if(cls<6.5){
    float lj=L+jit;
    gl=lj<.20? ${gg('.')} :lj<.40? ${gg(':')} :lj<.60? ${gg('=')} : ${gg('%')};
    if(mag>.12) gl=edgeG;
  } else {
    float lj=L+jit*.4;
    gl=lj<.52? ${gg('.')} :lj<.76? ${gg(':')} : ${gg('=')};
  }

  vec2 gv=g-cell, dx=dFdx(g), dy=dFdy(g);
  float ink=smoothstep(.10,.82,textureGrad(uAtlas,vec2((gl+gv.x)/uN,1.-gv.y),dx/uN,dy).r);

  float inkMul = cls<.5 ? ${cfg.inkMulSky.toFixed(2)} : (cls>6.5 ? ${cfg.inkMulSnow.toFixed(2)} : ${cfg.inkMulDefault.toFixed(2)});
  vec3 inkCol  = clamp(s.rgb * inkMul, 0., 1.);
  float bgMul  = cls<.5 ? ${cfg.bgMulSky.toFixed(2)} : (cls>6.5 ? ${cfg.bgMulSnow.toFixed(2)} : ${cfg.bgMulDefault.toFixed(2)});
  vec3 bgCol   = s.rgb * bgMul;
  vec3 mixed   = mix(bgCol, inkCol, ink);

  float skyAlpha = cls<.5 ? (1.0-smoothstep(${cfg.skyFadeStart.toFixed(2)},${cfg.skyFadeEnd.toFixed(2)},vUv.y)) : 1.0;
  outColor = vec4(mixed, skyAlpha);
}
`

  // ── Renderer ─────────────────────────────────────────────────────────────
  const { W, cols, rows } = cfg
  const H = cfg.H  // base scene height — used for horizontal FOV calculation
  // skyExpand grows the canvas taller from the top.
  // asymmetric frustum (topNew > topStd, bottom fixed) matches the extra pixels
  // so the bottom of the scene stays at the same absolute pixel row.
  const H_render = cfg.skyExpand > 0
    ? Math.round(H * (1 + cfg.skyExpand * 0.5))
    : H

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(1)
  renderer.setSize(W, H_render)
  renderer.setClearColor(0x000000, 0)

  const canvas = renderer.domElement
  canvas.style.width = '100%'; canvas.style.height = 'auto'; canvas.style.display = 'block'
  container.appendChild(canvas)

  const scene = new THREE.Scene()
  const sun = new THREE.DirectionalLight(0xffe4b0, 3.6)
  sun.position.set(-30, 55, 65); sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 70, bottom: -30, near: 1, far: 200 })
  sun.shadow.bias = -0.0005
  scene.add(sun, sun.target)
  scene.add(new THREE.HemisphereLight(0xd8eeff, 0x8a7a40, 1.2))

  const camera = new THREE.PerspectiveCamera(cfg.camFov, W / H_render, 0.3, 400)
  camera.position.set(0, cfg.camY, cfg.camZ)
  camera.lookAt(0, cfg.targetY, cfg.targetZ)
  camera.updateMatrixWorld()

  // Asymmetric frustum: extend only the top frustum plane to reveal more sky.
  // H_render is sized to match the extended vertical range so the bottom of the
  // scene (foreground, water) stays at the same pixel row from the canvas bottom.
  // right uses original H so horizontal FOV is unchanged.
  if (cfg.skyExpand > 0) {
    const NEAR = 0.3, FAR = 400
    const topStd = NEAR * Math.tan(THREE.MathUtils.degToRad(cfg.camFov) * 0.5)
    const right   = topStd * (W / H)        // original H → same horizontal FOV
    const topNew  = topStd * (1 + cfg.skyExpand)  // extend top only
    camera.projectionMatrix.makePerspective(-right, right, topNew, -topStd, NEAR, FAR)
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
  }

  buildSky(scene)
  if (cfg.showMountains) {
    buildMtnRange(scene, cfg.mtnFarZ,  cfg.mtnFarH,  2.1, C.mtnFar,  new THREE.Color(cfg.colMtnFarShadow),  C.mtnFarBase,  cfg.mtnFarSnow,  CLS.mtnFar)
    buildMtnRange(scene, cfg.mtnNearZ, cfg.mtnNearH, 0.8, C.mtnNear, new THREE.Color(cfg.colMtnNearShadow), C.mtnNearBase, cfg.mtnNearSnow, CLS.mtnNear)
  }
  buildWater(scene)
  buildGround(scene)
  buildRocks(scene)
  buildVegetation(scene)

  const rt = new THREE.WebGLRenderTarget(W, H_render, {
    type: THREE.HalfFloatType,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
  })

  const atlas = buildAtlas()
  const vtx = `in vec3 position; in vec2 uv; out vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`
  const asciiMat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, transparent: true,
    vertexShader: vtx, fragmentShader: asciiFrag,
    depthTest: false, depthWrite: false,
    uniforms: {
      uScene: { value: rt.texture },
      uAtlas: { value: atlas },
      uGrid:  { value: new THREE.Vector2(cols, rows) },
      uTime:  uTime,
      uN:     { value: GLYPHS.length },
    },
  })

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), asciiMat)
  quad.frustumCulled = false
  const postScene = new THREE.Scene()
  postScene.add(quad)
  const postCam = new THREE.Camera()

  let paused = false, clock = 0, last = performance.now(), rafId = 0
  let asciiOn = true

  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'Space') { paused = !paused; e.preventDefault() }
    if (e.code === 'KeyA')  { asciiOn = !asciiOn }
  }
  window.addEventListener('keydown', onKey)

  const loop = (now: number) => {
    rafId = requestAnimationFrame(loop)
    if (!paused) clock += Math.min(0.1, (now - last) / 1000)
    last = now; uTime.value = clock

    if (asciiOn) {
      renderer.setRenderTarget(rt)
      renderer.setClearColor(0x000000, 0); renderer.clear()
      renderer.render(scene, camera)
      renderer.setRenderTarget(null)
      renderer.setClearColor(0x000000, 0); renderer.clear()
      renderer.render(postScene, postCam)
    } else {
      renderer.setRenderTarget(null)
      renderer.setClearColor(0x000000, 0); renderer.clear()
      renderer.render(scene, camera)
    }
  }
  rafId = requestAnimationFrame(loop)

  const ro = new ResizeObserver(() => {
    const w = container.clientWidth
    if (w > 0) canvas.style.height = `${Math.round(w * H_render / W)}px`
  })
  ro.observe(container)

  return () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('keydown', onKey)
    ro.disconnect()
    atlas.dispose()
    rt.dispose()
    renderer.dispose()
    if (canvas.parentNode === container) container.removeChild(canvas)
  }
}
