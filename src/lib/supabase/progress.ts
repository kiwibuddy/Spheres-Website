import { TOTAL_DEVOTIONS, DEVOTIONS_PER_SPHERE } from '@/lib/constants'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Overall progress: completedCount / 416 * 100. Always use 416.
 */
export async function getOverallProgress(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true)
  if (error) throw error
  return Math.round(((count ?? 0) / TOTAL_DEVOTIONS) * 100)
}

/**
 * Completed count (video watched ≥90%).
 */
export async function getCompletedCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true)
  if (error) throw error
  return count ?? 0
}

/**
 * Responses completed count (all reflection questions answered for that devotion).
 */
export async function getResponsesCompletedCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('responses_completed_at', 'is', null)
  if (error) throw error
  return count ?? 0
}

/**
 * Progress per devotion for a list of devotion IDs (e.g. for sphere page cards).
 * Returns map of devotionId -> { completed, watch_percentage }.
 */
export async function getProgressByDevotionIds(
  supabase: SupabaseClient,
  userId: string,
  devotionIds: number[]
): Promise<Record<number, { completed: boolean; watch_percentage: number; responses_completed: boolean }>> {
  if (devotionIds.length === 0) return {}
  const { data, error } = await supabase
    .from('user_progress')
    .select('devotion_id, completed, watch_percentage, responses_completed_at')
    .eq('user_id', userId)
    .in('devotion_id', devotionIds)
  if (error) throw error
  const map: Record<number, { completed: boolean; watch_percentage: number; responses_completed: boolean }> = {}
  for (const row of data ?? []) {
    map[row.devotion_id] = {
      completed: row.completed ?? false,
      watch_percentage: row.watch_percentage ?? 0,
      responses_completed: !!row.responses_completed_at,
    }
  }
  return map
}

/**
 * Per-sphere progress: watched count and responses-completed count. Always use 52.
 */
export async function getSphereProgress(
  supabase: SupabaseClient,
  userId: string,
  sphereId: number
): Promise<{ completed: number; percentage: number; responsesCompleted: number; responsesPercentage: number }> {
  const { data: devotions } = await supabase
    .from('devotions')
    .select('id')
    .eq('sphere_id', sphereId)
  const devotionIds = (devotions ?? []).map((d) => d.id)
  if (devotionIds.length === 0) return { completed: 0, percentage: 0, responsesCompleted: 0, responsesPercentage: 0 }
  const { count, error } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true)
    .in('devotion_id', devotionIds)
  if (error) throw error
  const completed = count ?? 0
  const { count: responsesCount, error: err2 } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('responses_completed_at', 'is', null)
    .in('devotion_id', devotionIds)
  const responsesCompleted = err2 ? 0 : (responsesCount ?? 0)
  const percentage = Math.round((completed / DEVOTIONS_PER_SPHERE) * 100)
  const responsesPercentage = Math.round((responsesCompleted / DEVOTIONS_PER_SPHERE) * 100)
  return { completed, percentage, responsesCompleted, responsesPercentage }
}

/** Distinct calendar dates (YYYY-MM-DD) when user had any completion (watched or reflections). */
function getActiveDates(rows: { completed_at?: string | null; responses_completed_at?: string | null }[]): string[] {
  const dates = new Set<string>()
  for (const row of rows) {
    if (row.completed_at) dates.add(row.completed_at.slice(0, 10))
    if (row.responses_completed_at) dates.add(row.responses_completed_at.slice(0, 10))
  }
  return [...dates].sort().reverse()
}

/** Current streak: consecutive days with at least one completion, ending today (or yesterday). */
export async function getStreak(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('completed_at, responses_completed_at')
    .eq('user_id', userId)
    .or('completed_at.not.is.null,responses_completed_at.not.is.null')
  if (error) return 0
  const dates = getActiveDates(data ?? [])
  if (dates.length === 0) return 0
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
  if (dates[0] !== today && dates[0] !== yesterday) return 0
  let streak = 0
  let expect = dates[0]
  for (const d of dates) {
    if (d !== expect) break
    streak++
    expect = new Date(new Date(d).getTime() - 864e5).toISOString().slice(0, 10)
  }
  return streak
}

/** Count distinct devotions watched and reflections completed in the last 7 days. */
export async function getWeeklySummary(
  supabase: SupabaseClient,
  userId: string
): Promise<{ watchedThisWeek: number; reflectionsThisWeek: number }> {
  const since = new Date(Date.now() - 7 * 864e5).toISOString()
  const { data: watchedRows, error: e1 } = await supabase
    .from('user_progress')
    .select('devotion_id')
    .eq('user_id', userId)
    .gte('last_watched_at', since)
  const { data: reflectionRows, error: e2 } = await supabase
    .from('user_progress')
    .select('devotion_id')
    .eq('user_id', userId)
    .not('responses_completed_at', 'is', null)
    .gte('responses_completed_at', since)
  const watchedSet = new Set((watchedRows ?? []).map((r) => r.devotion_id))
  const reflectionSet = new Set((reflectionRows ?? []).map((r) => r.devotion_id))
  return {
    watchedThisWeek: e1 ? 0 : watchedSet.size,
    reflectionsThisWeek: e2 ? 0 : reflectionSet.size,
  }
}

/** Next suggested devotion: finish reflections on one already watched, or next unwatched. */
export async function getNextDevotion(
  supabase: SupabaseClient,
  userId: string
): Promise<{ devotionId: number; slug: string; title: string; code: string; type: 'reflections' | 'watch' } | null> {
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('devotion_id, completed, responses_completed_at')
    .eq('user_id', userId)
  const byDevotion = new Map<number, { completed: boolean; responses_completed: boolean }>()
  for (const r of progressRows ?? []) {
    byDevotion.set(r.devotion_id, {
      completed: r.completed ?? false,
      responses_completed: !!r.responses_completed_at,
    })
  }
  const { data: devotions } = await supabase
    .from('devotions')
    .select('id, sphere_id, order_in_sphere, title, code')
    .order('sphere_id')
    .order('order_in_sphere')
  if (!devotions?.length) return null
  let needReflections: (typeof devotions)[0] | null = null
  let needWatch: (typeof devotions)[0] | null = null
  for (const d of devotions) {
    const p = byDevotion.get(d.id)
    if (p?.completed && !p?.responses_completed && !needReflections) needReflections = d
    if (!p?.completed && !needWatch) needWatch = d
  }
  if (needReflections) {
    const { data: sphere } = await supabase.from('spheres').select('slug').eq('id', needReflections.sphere_id).single()
    return {
      devotionId: needReflections.id,
      slug: sphere?.slug ?? 'foundational',
      title: needReflections.title,
      code: needReflections.code ?? '',
      type: 'reflections',
    }
  }
  if (needWatch) {
    const { data: sphere } = await supabase.from('spheres').select('slug').eq('id', needWatch.sphere_id).single()
    return {
      devotionId: needWatch.id,
      slug: sphere?.slug ?? 'foundational',
      title: needWatch.title,
      code: needWatch.code ?? '',
      type: 'watch',
    }
  }
  return null
}
