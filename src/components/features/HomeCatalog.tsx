'use client'

import Link from 'next/link'
import {
  ACHIEVEMENT_BADGES,
  DEVOTIONS_PER_SPHERE,
  FULL_COMPLETION_BADGES,
  SPHERES,
  SPHERE_INTROS,
} from '@/lib/constants'
import { useDashboardSnapshot } from '@/components/features/useDashboardSnapshot'

const GRID_CLASSES = [
  'lg:col-span-6',
  'lg:col-span-6',
  'lg:col-span-4 lg:row-span-2',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-6',
  'lg:col-span-3',
  'lg:col-span-3',
]

export function HomeCatalog() {
  const { completedCount, responsesCompletedCount, spheres } = useDashboardSnapshot()
  const completedBySlug = new Map(spheres.map((sphere) => [sphere.slug, sphere.completed]))
  const isBadgeEarned = (threshold: number) => completedCount >= threshold
  const isFullBadgeEarned = (threshold: number) => responsesCompletedCount >= threshold

  return (
    <>
      <section id="spheres" className="mx-auto max-w-[1400px] px-6 pb-24 pt-16 sm:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight text-text-primary">
            Foundational Worldview + 7 Spheres
          </h2>
          <div className="mx-auto mt-4 max-w-[900px] space-y-6 text-xl leading-relaxed text-text-secondary">
            <p>
              Begin your journey by grounding yourself in the Foundational 52 devotions, designed to establish a robust biblical Christian worldview.
            </p>
            <p>
              Then continue with 7 tracks (Spheres of Society), each with {DEVOTIONS_PER_SPHERE} devotions that dig into how the kingdom of God reshapes our view of family, work, culture, and public life.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[300px_300px_300px]">
          {SPHERES.map((sphere, i) => {
            const completed = completedBySlug.get(sphere.slug) ?? 0
            const progressPct = Math.round((completed / DEVOTIONS_PER_SPHERE) * 100)
            const intro = SPHERE_INTROS[sphere.slug]
            const short = intro?.short ?? sphere.description
            return (
              <Link
                key={sphere.slug}
                href={`/spheres/${sphere.slug}`}
                className={`group flex flex-col justify-between rounded-[28px] border border-white/20 bg-white/70 p-8 text-left shadow-glass transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_30px_60px_rgba(31,38,135,0.25)] ${GRID_CLASSES[i] ?? 'lg:col-span-3'}`}
              >
                <div>
                  <div
                    className="mb-4 flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                    style={{ backgroundColor: `${sphere.color_primary}15` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/sphere-icons/${sphere.icon}`}
                      alt=""
                      width={72}
                      height={72}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-text-primary">{sphere.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{short}</p>
                </div>
                <div>
                  <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%`, backgroundColor: sphere.color_primary }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    {completed} of 52 completed
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section id="achievements" className="mx-auto max-w-[1400px] px-6 pb-24 text-center sm:px-8" aria-labelledby="achievements-heading">
        <h2 id="achievements-heading" className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold text-text-primary">
          Achievements
        </h2>
        <p className="mx-auto mt-2 max-w-[500px] text-text-secondary">Earn badges as you watch and fully complete devotions</p>
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Watched</h3>
          <div className="mt-4 flex flex-wrap justify-center gap-6">
            {ACHIEVEMENT_BADGES.map((badge) => {
              const earned = isBadgeEarned(badge.threshold)
              return (
                <div
                  key={badge.id}
                  className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 bg-white/70 text-3xl shadow-glass transition-all duration-300 hover:-translate-y-3 hover:shadow-lg ${
                    earned ? 'border-education' : 'border-white/20 opacity-70 grayscale'
                  }`}
                  title={`${badge.name}: ${badge.threshold} watched${earned ? ' (earned)' : ''}`}
                >
                  <span>{badge.emoji}</span>
                  <span className="mt-1 text-xs font-medium text-text-secondary">{badge.name}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Full completion (video + reflections)</h3>
          <div className="mt-4 flex flex-wrap justify-center gap-6">
            {FULL_COMPLETION_BADGES.map((badge) => {
              const earned = isFullBadgeEarned(badge.threshold)
              return (
                <div
                  key={badge.id}
                  className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 bg-white/70 text-3xl shadow-glass transition-all duration-300 hover:-translate-y-3 hover:shadow-lg ${
                    earned ? 'border-education' : 'border-white/20 opacity-70 grayscale'
                  }`}
                  title={`${badge.name}: ${badge.threshold} full completions${earned ? ' (earned)' : ''}`}
                >
                  <span>{badge.emoji}</span>
                  <span className="mt-1 text-xs font-medium text-text-secondary">{badge.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
