'use client'

import { useEffect, useState } from 'react'
import type { StaticDevotion } from '@/lib/devotions-data'
import { DevotionCard } from '@/components/features/DevotionCard'

export interface CategoryGroup {
  categoryTitle: string
  devotions: StaticDevotion[]
}

interface SphereDevotionListProps {
  slug: string
  byCategory: CategoryGroup[]
  /** Comma-separated devotion IDs for progress fetch (stable string from server). */
  idsParam: string
}

type ProgressMap = Record<
  number,
  { completed: boolean; watch_percentage: number; responses_completed: boolean }
>

export function SphereDevotionList({ slug, byCategory, idsParam }: SphereDevotionListProps) {
  const [progress, setProgress] = useState<ProgressMap | null>(null)

  useEffect(() => {
    if (!idsParam.trim()) {
      setProgress({})
      return
    }
    fetch(`/api/progress?ids=${encodeURIComponent(idsParam)}`)
      .then((res) => res.json())
      .then((data: { progress?: ProgressMap }) => {
        setProgress(data.progress ?? {})
      })
      .catch(() => setProgress({}))
  }, [idsParam])

  return (
    <div className="mt-12 space-y-12" aria-label="Devotions in this sphere">
      {byCategory.map(({ categoryTitle, devotions: categoryDevotions }, idx) => (
        <section key={idx} aria-labelledby={`category-${slug}-${idx}`}>
          <h2
            id={`category-${slug}-${idx}`}
            className="font-heading text-xl font-semibold text-text-primary border-b border-white/30 pb-2 mb-6"
          >
            {categoryTitle}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {categoryDevotions.map((d) => (
              <DevotionCard
                key={d.id}
                devotion={d}
                progress={
                  progress
                    ? progress[d.id]
                      ? {
                          completed: progress[d.id].completed,
                          watch_percentage: progress[d.id].watch_percentage,
                          responses_completed: progress[d.id].responses_completed,
                        }
                      : null
                    : undefined
                }
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
