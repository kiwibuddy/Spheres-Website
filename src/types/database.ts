/**
 * Database types (Supabase). Match cursorrules.txt schema.
 */

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Sphere {
  id: number
  slug: string
  name: string
  description: string
  color_primary: string
  icon_svg: string | null
  total_devotions: number
  order_index: number
}

export interface Devotion {
  id: number
  sphere_id: number
  code: string
  title: string
  scripture_reference: string
  youtube_url: string
  duration_seconds: number | null
  transcript: string | null
  order_in_sphere: number
  reflection_q1?: string | null
  reflection_q2?: string | null
  reflection_q3?: string | null
  reflection_q4?: string | null
  call_to_action?: string | null
}

export interface UserProgress {
  id: string
  user_id: string
  devotion_id: number
  completed: boolean
  watch_percentage: number
  completed_at: string | null
  last_watched_at: string
}
