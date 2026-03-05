import { notFound } from 'next/navigation'
import { getSphereBySlug } from '@/lib/constants'
import { getDevotionsBySphereSlug } from '@/lib/devotions-data'
import type { StaticDevotion } from '@/lib/devotions-data'
import { DEVOTIONS_PER_SPHERE } from '@/lib/constants'
import { SphereDevotionList } from '@/components/features/SphereDevotionList'

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
  const idsParam = devotions.map((d) => d.id).join(',')

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

        <SphereDevotionList slug={params.slug} byCategory={byCategory} idsParam={idsParam} />
      </div>
    </div>
  )
}
