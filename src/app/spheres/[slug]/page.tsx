import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProgressByDevotionIds } from '@/lib/supabase/progress'
import { getSphereBySlug } from '@/lib/constants'
import { getDevotionsBySphereSlug } from '@/lib/devotions-data'
import type { StaticDevotion } from '@/lib/devotions-data'
import { DEVOTIONS_PER_SPHERE } from '@/lib/constants'
import { DevotionCard } from '@/components/features/DevotionCard'

interface PageProps {
  params: { slug: string }
}

function groupByCategory(devotions: StaticDevotion[]): { categoryTitle: string; devotions: StaticDevotion[] }[] {
  const groups: { categoryTitle: string; devotions: StaticDevotion[] }[] = []
  let currentCategory: string | null = null
  let currentGroup: StaticDevotion[] = []

  for (const d of devotions) {
    const cat = d.category_title?.trim() || null
    if (cat !== currentCategory) {
      if (currentGroup.length > 0) {
        groups.push({
          categoryTitle: currentCategory || 'Key Passages',
          devotions: [...currentGroup],
        })
      }
      currentCategory = cat
      currentGroup = []
    }
    currentGroup.push(d)
  }
  if (currentGroup.length > 0) {
    groups.push({
      categoryTitle: currentCategory || 'Key Passages',
      devotions: currentGroup,
    })
  }
  return groups
}

export default async function SpherePage({ params }: PageProps) {
  const sphere = getSphereBySlug(params.slug)
  if (!sphere) notFound()

  const devotions = getDevotionsBySphereSlug(params.slug)
  const byCategory = groupByCategory(devotions)

  let progressByDevotionId: Record<number, { completed: boolean; watch_percentage: number }> = {}
  const supabase = await createClient()
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      try {
        progressByDevotionId = await getProgressByDevotionIds(
          supabase,
          user.id,
          devotions.map((d) => d.id)
        )
      } catch {
        // keep empty map
      }
    }
  }

  return (
    <div className="min-h-screen px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-8 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl overflow-hidden" style={{ backgroundColor: `${sphere.color_primary}15` }}>
          <img
            src={`/sphere-icons/${sphere.icon}`}
            alt=""
            width={80}
            height={80}
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="font-heading text-4xl font-bold text-text-primary">{sphere.name}</h1>
        <p className="mt-2 text-lg text-text-secondary">{sphere.description}</p>
        <p className="mt-4 text-sm text-text-secondary">
          {DEVOTIONS_PER_SPHERE} devotions · 1 per week
        </p>

        <div className="mt-12 space-y-12" aria-label={`Devotions in ${sphere.name}`}>
          {byCategory.map(({ categoryTitle, devotions: categoryDevotions }, idx) => (
            <section key={idx} aria-labelledby={`category-${params.slug}-${idx}`}>
              <h2
                id={`category-${params.slug}-${idx}`}
                className="font-heading text-xl font-semibold text-text-primary border-b border-white/30 pb-2 mb-6"
              >
                {categoryTitle}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {categoryDevotions.map((d) => (
                  <DevotionCard
                    key={d.id}
                    devotion={d}
                    progress={progressByDevotionId[d.id] ?? null}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
