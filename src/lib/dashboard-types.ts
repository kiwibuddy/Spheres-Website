import { SPHERES } from '@/lib/constants'

export type NextDevotion = {
  devotionId: number
  slug: string
  title: string
  code: string
  type: 'reflections' | 'watch'
}

export type SphereStat = {
  slug: string
  name: string
  color_primary: string
  icon: string
  completed: number
  percentage: number
  responsesCompleted: number
  responsesPercentage: number
}

export type DashboardSnapshot = {
  signedIn: boolean
  completedCount: number
  responsesCompletedCount: number
  streak: number
  watchedThisWeek: number
  reflectionsThisWeek: number
  nextDevotion: NextDevotion | null
  spheres: SphereStat[]
}

export const EMPTY_DASHBOARD: DashboardSnapshot = {
  signedIn: false,
  completedCount: 0,
  responsesCompletedCount: 0,
  streak: 0,
  watchedThisWeek: 0,
  reflectionsThisWeek: 0,
  nextDevotion: null,
  spheres: SPHERES.map((sphere) => ({
    slug: sphere.slug,
    name: sphere.name,
    color_primary: sphere.color_primary,
    icon: sphere.icon,
    completed: 0,
    percentage: 0,
    responsesCompleted: 0,
    responsesPercentage: 0,
  })),
}
