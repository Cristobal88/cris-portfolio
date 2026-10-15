// Slow-drifting coloured glow orbs at the top of the page.
// Pure CSS — no JS, no libraries. The hue-rotate on the wrapper
// cycles all blobs through the full colour spectrum slowly.

export function AuroraGlow() {
  return (
    <div className="aurora-wrap" aria-hidden="true">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
    </div>
  )
}
