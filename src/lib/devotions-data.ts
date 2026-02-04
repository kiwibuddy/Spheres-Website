/**
 * Static devotions data (from generate-devotions.mjs). Used for Phase 2 static pages
 * and as fallback; Phase 4 will prefer Supabase.
 */

import type { Devotion } from '@/types/database'
import { SPHERES, getSphereBySlug } from './constants'
import devotionsJson from './devotions-static.json'

export interface StaticDevotion extends Devotion {
  slug: string
  code: string
  category_title?: string | null
}

const devotions = devotionsJson as StaticDevotion[]

export function getAllDevotions(): StaticDevotion[] {
  return devotions
}

export function getDevotionsBySphereSlug(slug: string): StaticDevotion[] {
  return devotions.filter((d) => d.slug === slug).sort((a, b) => a.order_in_sphere - b.order_in_sphere)
}

export function getDevotionById(id: number): StaticDevotion | undefined {
  return devotions.find((d) => d.id === id)
}

export function getDevotionByCode(sphereSlug: string, code: string): StaticDevotion | undefined {
  return devotions.find((d) => d.slug === sphereSlug && d.code === code)
}

export { SPHERES, getSphereBySlug }
