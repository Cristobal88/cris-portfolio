import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types/content'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDetailRow(cs: any, stats: any[], insights: any[], steps: any[], visuals: any[], decisions: any[], results: any[]): Project {
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
    stats:           stats.map(s => ({ value: s.value ?? '', label: s.label ?? '' })),
    problemHeadline: cs.problem_headline ?? undefined,
    problemExpanded: cs.problem_expanded ?? '',
    problemInsights: insights.length > 0
      ? insights.map(i => ({ title: i.title ?? '', desc: i.description ?? '' }))
      : undefined,
    context:         cs.context          ?? undefined,
    contextTitle:    cs.context_title    ?? undefined,
    ourRole:         cs.our_role         ?? '',
    approachTitle:   cs.approach_title   ?? undefined,
    approachSteps:   steps.length > 0
      ? steps.map(s => ({ num: s.num ?? '', title: s.title ?? '', desc: s.description ?? '' }))
      : undefined,
    designTitle:     cs.design_title     ?? undefined,
    decisionTitle:   cs.decision_title   ?? undefined,
    proofTitle:      cs.proof_title      ?? undefined,
    workVisuals:     visuals.map(v => ({ title: v.title ?? undefined, image: v.image ?? '', caption: v.caption ?? '' })),
    keyDecisions:    decisions.map(d => ({ challenge: d.challenge ?? '', solution: d.solution ?? '' })),
    results:         results.map(r => ({ value: r.value ?? '', label: r.label ?? '', context: r.context ?? '' })),
    resultsParagraph: cs.results_paragraph ?? '',
    nextSlug:        cs.next_slug        ?? '',
  }
}

export function useCaseStudy(slug: string | undefined) {
  const [data,        setData]        = useState<Project | null>(null)
  const [nextProject, setNextProject] = useState<{ slug: string; problem: string } | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setData(null)
    setNextProject(null)
    setNotFound(false)

    supabase
      .from('case_studies')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
      .then(async ({ data: cs, error: err }) => {
        if (err || !cs) {
          setNotFound(true)
          setLoading(false)
          return
        }

        const [
          { data: stats    },
          { data: insights },
          { data: steps    },
          { data: visuals  },
          { data: decisions },
          { data: results  },
          { data: nextCs   },
        ] = await Promise.all([
          supabase.from('case_study_stats').select('*').eq('case_study_id', cs.id).order('sort_order'),
          supabase.from('case_study_problem_insights').select('*').eq('case_study_id', cs.id).order('sort_order'),
          supabase.from('case_study_approach_steps').select('*').eq('case_study_id', cs.id).order('sort_order'),
          supabase.from('case_study_work_visuals').select('*').eq('case_study_id', cs.id).order('sort_order'),
          supabase.from('case_study_key_decisions').select('*').eq('case_study_id', cs.id).order('sort_order'),
          supabase.from('case_study_results').select('*').eq('case_study_id', cs.id).order('sort_order'),
          supabase.from('case_studies').select('slug, problem').eq('slug', cs.next_slug).eq('is_published', true).maybeSingle(),
        ])

        setData(mapDetailRow(cs, stats ?? [], insights ?? [], steps ?? [], visuals ?? [], decisions ?? [], results ?? []))
        if (nextCs) setNextProject({ slug: nextCs.slug, problem: nextCs.problem })
        setLoading(false)
      })
  }, [slug])

  return { data, nextProject, loading, notFound }
}
