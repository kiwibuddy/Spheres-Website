import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { isSupabaseAuthCookieName } from '@/lib/auth-cookies'
import { buildDashboardSnapshot, type ProgressRow } from '@/lib/build-dashboard-snapshot'
import { EMPTY_DASHBOARD } from '@/lib/dashboard-types'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'private, no-store' }

/**
 * Progress for the dashboard and home page.
 * Anonymous requests return immediately. A signed-in request is one progress read,
 * not a round trip per sphere.
 */
export async function GET() {
  const cookieStore = await cookies()
  if (!cookieStore.getAll().some((cookie) => isSupabaseAuthCookieName(cookie.name))) {
    return NextResponse.json(EMPTY_DASHBOARD, { headers: noStore })
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json(EMPTY_DASHBOARD, { headers: noStore })
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json(EMPTY_DASHBOARD, { headers: noStore })
  }

  const { data, error } = await supabase
    .from('user_progress')
    .select('devotion_id, completed, completed_at, responses_completed_at, last_watched_at')
    .eq('user_id', userId)

  if (error || !data) {
    return NextResponse.json(EMPTY_DASHBOARD, { headers: noStore })
  }

  return NextResponse.json(buildDashboardSnapshot(data as ProgressRow[]), { headers: noStore })
}
