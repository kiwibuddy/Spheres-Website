import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Progress is not configured' },
        { status: 503 }
      )
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { devotionId, watchPercentage, completed } = body as {
      devotionId: number
      watchPercentage: number
      completed?: boolean
    }
    if (typeof devotionId !== 'number' || typeof watchPercentage !== 'number') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const now = new Date().toISOString()
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id, completed_at')
      .eq('user_id', user.id)
      .eq('devotion_id', devotionId)
      .single()
    const completedAt = completed && !existing?.completed_at ? now : existing?.completed_at ?? null
    const { error } = await supabase.from('user_progress').upsert(
      {
        user_id: user.id,
        devotion_id: devotionId,
        watch_percentage: Math.min(100, Math.max(0, watchPercentage)),
        completed: completed ?? false,
        completed_at: completedAt,
        last_watched_at: now,
      },
      { onConflict: 'user_id,devotion_id' }
    )
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Progress API error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to save progress' },
      { status: 500 }
    )
  }
}
