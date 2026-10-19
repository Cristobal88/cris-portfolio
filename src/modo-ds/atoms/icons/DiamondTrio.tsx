import React from 'react'

// Three faceted diamond gems — from Figma file tek8EvNLmnDD5W2nEdKttz, node 77199-86917
// Center gem is upright and large; side gems are smaller with ±11° tilt + skew (Figma perspective effect)
export default function DiamondTrio() {
  // Shared gem paths (same shape used for all 3 instances via SVG transforms)
  const outerPath = "M10.0738 0.0616325C11.5948 0.0517727 14.8755 0.205168 15.6056 0.250169C16.5119 0.306487 17.0795 0.923948 17.6786 1.51777C18.4733 2.30622 19.2763 3.08774 20.0333 3.91048C20.6387 4.56882 20.625 5.61084 20.135 6.35716C19.4511 7.3989 17.2559 9.84344 16.6285 10.6017C16.1328 11.2009 13.2498 14.5496 11.8996 15.8322C11.4742 16.2367 11.0002 16.4504 10.5014 16.4466L10.3507 16.4457C9.85194 16.4435 9.37282 16.2242 8.93655 15.8146C7.55319 14.5157 4.58373 11.1323 4.07255 10.5271C3.42552 9.76129 1.16721 7.29029 0.456406 6.24027C-0.0528493 5.48802 -0.0933371 4.44568 0.495265 3.79442C1.23166 2.98056 2.01516 2.20846 2.78967 1.42933C3.37318 0.842533 3.92504 0.231723 4.82965 0.186161C5.55867 0.149827 8.8363 0.0353873 10.3574 0.0633175L10.0738 0.0616325Z"

  // Inner facet helper — renders the 6 colored facets at whatever parent transform is applied
  const GemFacets = () => (
    <>
      <path d={outerPath} fill="#FBAF5D"/>
      {/* Left upper crown */}
      <path d="M0.0606786 4.74746C0.0965233 4.38417 0.230209 4.04005 0.478992 3.76486C1.21987 2.94503 2.00904 2.16808 2.78873 1.38363C3.37612 0.792409 3.93167 0.177432 4.84227 0.13194C5.21749 0.113063 6.26497 0.0737544 7.40249 0.043662L5.36097 5.43753L0.0606786 4.74746Z" fill="#FFC84A"/>
      {/* Right upper crown */}
      <g transform="translate(13.4726, 0.07)">
        <path d="M2.40465 5.36641L1.25254e-05 0C1.03302 0.041188 1.95255 0.0870677 2.29897 0.108098C3.20885 0.164649 3.77983 0.785271 4.38111 1.38214C5.17923 2.1741 5.98576 2.95826 6.74605 3.78466C6.95564 4.01241 7.09096 4.28552 7.15848 4.57639L2.43782 5.36661L2.40465 5.36641Z" fill="#FFC84A"/>
      </g>
      {/* Center top crown */}
      <g transform="translate(4.96, 0)">
        <path d="M8.27175 0.108986C7.15451 0.0649506 5.91234 0.0261956 5.08134 0.0273425C4.31599 0.0182329 3.20211 0.0395206 2.15756 0.0679576L0.0633327 5.60072L10.7261 5.62197L8.27175 0.108986Z" fill="#FFDD66"/>
      </g>
      {/* Left dark pavilion */}
      <g transform="translate(0, 5.11)">
        <path d="M9.13356 0.0485034C8.96982 0.0759845 4.58694 0.814582 4.55577 0.814417L4.55495 0.814412L0.127494 11.3456C0.379005 11.2455 0.620891 11.0919 0.847718 10.8755C2.15757 9.62783 4.95615 6.37082 5.43724 5.788C6.04618 5.05053 8.17671 2.67282 8.84039 1.65972C9.15287 1.18302 9.25976 0.585035 9.13356 0.0485034Z" fill="#FFA708"/>
      </g>
      {/* Right dark pavilion */}
      <g transform="translate(11.253, 5.24)">
        <path d="M0.0134475 9.41929e-05C-0.0372988 0.486011 0.0898003 1.00527 0.376038 1.43022C1.06385 2.45188 3.25203 4.85579 3.87877 5.60044C4.37391 6.18924 7.25085 9.48127 8.59089 10.7443C8.84336 10.9824 9.11183 11.1453 9.38903 11.2456L5.11781 0.664031L0.0134475 9.41929e-05Z" fill="#FFA708"/>
      </g>
      {/* Center bottom pavilion */}
      <g transform="translate(5.18, 5.66)">
        <path d="M4.32732 10.7121C4.51437 10.7789 4.70642 10.8134 4.90139 10.8141L5.04948 10.815C5.26768 10.8166 5.48122 10.7759 5.68805 10.6945L10.1599 0.0576078L0.000352638 0.0281902L4.32732 10.7121Z" fill="#F8C500"/>
      </g>
    </>
  )

  // Canvas: 62×36 viewBox. Gem natural center is at (10.3, 8.25).
  // Center gem (scale 1.6) spans x 14→47. Side gems tuck tightly underneath —
  // only ~7px of each side gem peeks out beyond the center gem's edges.
  const cTx = "translate(14, 4) scale(1.6)"
  const lTx = "translate(18, 19) rotate(-11) skewX(8) scale(0.95) translate(-10.3, -8.25)"
  const rTx = "translate(44, 19) rotate(11) skewX(-8) scale(0.95) translate(-10.3, -8.25)"

  return (
    <svg width={62} height={36} viewBox="0 0 62 36" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <clipPath id="dt-left"><path transform={lTx} d={outerPath}/></clipPath>
        <clipPath id="dt-right"><path transform={rTx} d={outerPath}/></clipPath>
        <clipPath id="dt-center"><path transform={cTx} d={outerPath}/></clipPath>
      </defs>
      {/* Left gem — behind center */}
      <g clipPath="url(#dt-left)"><g transform={lTx}><GemFacets /></g></g>
      {/* Right gem — behind center */}
      <g clipPath="url(#dt-right)"><g transform={rTx}><GemFacets /></g></g>
      {/* Center gem — on top */}
      <g clipPath="url(#dt-center)"><g transform={cTx}><GemFacets /></g></g>
    </svg>
  )
}
