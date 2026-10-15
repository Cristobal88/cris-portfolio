// ── Chime engine — Web Audio API, no files, desktop only ─────────────────────

let _ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!_ctx) _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

interface ToneOpts {
  freq:    number
  type?:   OscillatorType
  gain?:   number
  attack?: number
  decay?:  number
  delay?:  number
}

function tone({ freq, type = 'sine', gain = 0.14, attack = 0.005, decay = 0.35, delay = 0 }: ToneOpts) {
  const ctx = getCtx()
  const g   = ctx.createGain()
  const o   = ctx.createOscillator()
  o.type            = type
  o.frequency.value = freq
  const t = ctx.currentTime + delay
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  o.connect(g)
  g.connect(ctx.destination)
  o.start(t)
  o.stop(t + attack + decay + 0.05)
}

function isDesktop() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
}

// Throttle card hover so it doesn't fire on every micro-movement
let _lastCardHover = 0

export const chime = {
  /** Work button — thumbnails spread open */
  workHover: () => {
    if (!isDesktop()) return
    tone({ freq: 523.25, gain: 0.07, decay: 0.22, delay: 0    })
    tone({ freq: 659.25, gain: 0.06, decay: 0.28, delay: 0.08 })
  },

  /** Click a project thumbnail in the dock */
  thumbClick: () => {
    if (!isDesktop()) return
    tone({ freq: 659.25, gain: 0.09, decay: 0.30 })
  },

  /** Book a Call CTA */
  bookCall: () => {
    if (!isDesktop()) return
    tone({ freq: 783.99,               gain: 0.08, decay: 0.25, delay: 0    })
    tone({ freq: 1046.5, type: 'triangle', gain: 0.06, decay: 0.40, delay: 0.10 })
  },

  /** Press E — email copied */
  emailCopy: () => {
    if (!isDesktop()) return
    tone({ freq: 880, gain: 0.10, decay: 0.55, delay: 0    })
    tone({ freq: 880, type: 'triangle', gain: 0.04, decay: 0.90, delay: 0.02 })
  },

  /** CV download button */
  cvDownload: () => {
    if (!isDesktop()) return
    tone({ freq: 1046.5, gain: 0.08, decay: 0.20, delay: 0    })
    tone({ freq: 783.99, gain: 0.06, decay: 0.30, delay: 0.09 })
  },

  /** Project card hover on home — throttled to once per 800 ms */
  cardHover: () => {
    if (!isDesktop()) return
    const now = Date.now()
    if (now - _lastCardHover < 800) return
    _lastCardHover = now
    tone({ freq: 587.33, gain: 0.04, decay: 0.18 })
  },
}
