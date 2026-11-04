import { DEVOTIONS_PER_SPHERE, SPHERES } from '@/lib/constants'
import type { DashboardSnapshot } from '@/lib/dashboard-types'
import { getAllDevotions } from '@/lib/devotions-data'

export type ProgressRow = {
  devotion_id: number
  completed: boolean | null
  completed_at: string | null
  responses_completed_at: string | null
  last_watched_at: string | null
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

function previousDay(day: string): string {
  return new Date(new Date(day).getTime() - 864e5).toISOString().slice(0, 10)
}

function streakFrom(rows: ProgressRow[]): number {
  const dates = new Set<string>()
  for (const row of rows) {
    if (row.completed_at) dates.add(dayKey(row.completed_at))
    if (row.responses_completed_at) dates.add(dayKey(row.responses_completed_at))
  }
  const sorted = Array.from(dates).sort().reverse()
  if (sorted.length === 0) return 0
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = previousDay(today)
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0
  let streak = 0
  let expect = sorted[0]
  for (const day of sorted) {
    if (day !== expect) break
    streak++
    expect = previousDay(day)
  }
  return streak
}

/** Turn one user_progress read into the dashboard numbers. Devotion metadata stays local. */
export function buildDashboardSnapshot(rows: ProgressRow[]): DashboardSnapshot {
  const devotions = getAllDevotions()
  const byId = new Map(devotions.map((devotion) => [devotion.id, devotion]))
  const since = Date.now() - 7 * 864e5

  let completedCount = 0
  let responsesCompletedCount = 0
  const watchedThisWeek = new Set<number>()
  const reflectionsThisWeek = new Set<number>()
  const sphereCompleted = new Map<string, number>()
  const sphereResponses = new Map<string, number>()
  const progressById = new Map<number, { completed: boolean; responses: boolean }>()

  for (const row of rows) {
    const slug = byId.get(row.devotion_id)?.slug
    const completed = !!row.completed
    const responses = !!row.responses_completed_at
    progressById.set(row.devotion_id, { completed, responses })
    if (completed) {
      completedCount++
      if (slug) sphereCompleted.set(slug, (sphereCompleted.get(slug) ?? 0) + 1)
    }
    if (responses) {
      responsesCompletedCount++
      if (slug) sphereResponses.set(slug, (sphereResponses.get(slug) ?? 0) + 1)
      if (row.responses_completed_at && new Date(row.responses_completed_at).getTime() >= since) {
        reflectionsThisWeek.add(row.devotion_id)
      }
    }
    if (row.last_watched_at && new Date(row.last_watched_at).getTime() >= since) {
      watchedThisWeek.add(row.devotion_id)
    }
  }

  const ordered = [...devotions].sort((a, b) => {
    if (a.sphere_id !== b.sphere_id) return a.sphere_id - b.sphere_id
    return a.order_in_sphere - b.order_in_sphere
  })

  let nextDevotion: DashboardSnapshot['nextDevotion'] = null
  for (const devotion of ordered) {
    const progress = progressById.get(devotion.id)
    if (progress?.completed && !progress.responses) {
      nextDevotion = {
        devotionId: devotion.id,
        slug: devotion.slug,
        title: devotion.title,
        code: devotion.code,
        type: 'reflections',
      }
      break
    }
  }
  if (!nextDevotion) {
    for (const devotion of ordered) {
      if (!progressById.get(devotion.id)?.completed) {
        nextDevotion = {
          devotionId: devotion.id,
          slug: devotion.slug,
          title: devotion.title,
          code: devotion.code,
          type: 'watch',
        }
        break
      }
    }
  }

  return {
    signedIn: true,
    completedCount,
    responsesCompletedCount,
    streak: streakFrom(rows),
    watchedThisWeek: watchedThisWeek.size,
    reflectionsThisWeek: reflectionsThisWeek.size,
    nextDevotion,
    spheres: SPHERES.map((sphere) => {
      const completed = sphereCompleted.get(sphere.slug) ?? 0
      const responsesCompleted = sphereResponses.get(sphere.slug) ?? 0
      return {
        slug: sphere.slug,
        name: sphere.name,
        color_primary: sphere.color_primary,
        icon: sphere.icon,
        completed,
        percentage: Math.round((completed / DEVOTIONS_PER_SPHERE) * 100),
        responsesCompleted,
        responsesPercentage: Math.round((responsesCompleted / DEVOTIONS_PER_SPHERE) * 100),
      }
    }),
  }
}
