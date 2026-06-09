export interface WorkVisual {
  title?: string
  image: string
  caption: string
}

export interface KeyDecision {
  challenge: string
  solution: string
}

export interface ResultStat {
  value: string
  label: string
  context: string
}

export interface ApproachStep {
  num: string
  title: string
  desc: string
}

export interface Project {
  slug: string
  label: string
  metric: string
  metricLabel: string
  problem: string
  challenge: string
  tier: string
  duration: string
  deliverables: string[]
  image: string
  scopePill: string
  outcomeHeadline: string
  headlineAccent?: string
  heroImage: string
  cardImage?: string
  locked?: boolean
  stats: { value: string; label: string }[]
  problemHeadline?: string
  problemExpanded: string
  problemInsights?: { title: string; desc: string }[]
  context?: string
  contextTitle?: string
  ourRole: string
  approachTitle?: string
  approachSteps?: ApproachStep[]
  designTitle?: string
  decisionTitle?: string
  proofTitle?: string
  workVisuals: WorkVisual[]
  keyDecisions: KeyDecision[]
  results: ResultStat[]
  resultsParagraph: string
  nextSlug: string
}
