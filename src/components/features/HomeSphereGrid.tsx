'use client'

import { SPHERES } from '@/lib/constants'
import { SphereCardWithModal } from './SphereCardWithModal'
import { DEVOTIONS_PER_SPHERE } from '@/lib/constants'

export interface HomeSphereGridProps {
  sphereCompleted: number[]
}

const gridClasses: string[] = [
  'lg:col-span-6',
  'lg:col-span-6',
  'lg:col-span-4 lg:row-span-2',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-6',
  'lg:col-span-3',
  'lg:col-span-3',
]

export function HomeSphereGrid({ sphereCompleted }: HomeSphereGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[300px_300px_300px]">
      {SPHERES.map((sphere, i) => {
        const completed = sphereCompleted[i] ?? 0
        const progressPct = Math.round((completed / DEVOTIONS_PER_SPHERE) * 100)
        return (
          <SphereCardWithModal
            key={sphere.slug}
            sphere={sphere}
            completed={completed}
            progressPct={progressPct}
            gridClass={gridClasses[i] ?? 'lg:col-span-3'}
          />
        )
      })}
    </div>
  )
}
