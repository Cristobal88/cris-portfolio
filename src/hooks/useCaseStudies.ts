import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types/content'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(cs: any): Project {
  return {
    slug:            cs.slug             ?? '',
    label:           cs.label            ?? '',
    metric:          cs.metric           ?? '',
    metricLabel:     cs.metric_label     ?? '',
    problem:         cs.problem          ?? '',
    challenge:       cs.challenge        ?? '',
    tier:            cs.tier             ?? '',
    duration:        cs.duration         ?? '',
    deliverables:    cs.deliverables     ?? [],
    image:           cs.image            ?? '',
    scopePill:       cs.scope_pill       ?? '',
    outcomeHeadline: cs.outcome_headline ?? '',
    headlineAccent:  cs.headline_accent  ?? undefined,
    heroImage:       cs.hero_image       ?? '',
    cardImage:       cs.card_image       ?? undefined,
    locked:          cs.slug === 'ai-legal-copilot',
    stats:           [],
    problemHeadline: cs.problem_headline ?? undefined,
    problemExpanded: cs.problem_expanded ?? '',
    context:         cs.context          ?? undefined,
    contextTitle:    cs.context_title    ?? undefined,
    ourRole:         cs.our_role         ?? '',
    approachTitle:   cs.approach_title   ?? undefined,
    designTitle:     cs.design_title     ?? undefined,
    decisionTitle:   cs.decision_title   ?? undefined,
    proofTitle:      cs.proof_title      ?? undefined,
    workVisuals:     [],
    keyDecisions:    [],
    results:         [],
    resultsParagraph: cs.results_paragraph ?? '',
    nextSlug:        cs.next_slug        ?? '',
  }
}

export function useCaseStudies() {
  const [data,    setData]    = useState<Project[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('case_studies')
      .select('*')
      .eq('is_published', true)
      .order('sort_order')
      .then(({ data: rows, error: err }) => {
        if (err) {
          setError(err.message)
        } else {
          setData((rows ?? []).map(mapRow))
        }
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
