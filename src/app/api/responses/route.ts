import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MAX_WORDS = 500

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const devotionId = searchParams.get('devotionId')
    if (!devotionId) return NextResponse.json({ error: 'Missing devotionId' }, { status: 400 })
    const id = parseInt(devotionId, 10)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid devotionId' }, { status: 400 })

    const { data, error } = await supabase
      .from('user_devotion_responses')
      .select('question_key, response_text, updated_at')
      .eq('user_id', user.id)
      .eq('devotion_id', id)

    if (error) throw error
    const byKey: Record<string, { response_text: string; updated_at: string }> = {}
    for (const row of data ?? []) {
      byKey[row.question_key] = { response_text: row.response_text ?? '', updated_at: row.updated_at }
    }
    return NextResponse.json({ responses: byKey })
  } catch (e) {
    console.error('Responses GET error:', e)
    return NextResponse.json({ error: 'Failed to load responses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { devotionId, questionKey, responseText } = body as {
      devotionId: number
      questionKey: string
      responseText: string
    }
    if (typeof devotionId !== 'number' || !questionKey || typeof responseText !== 'string') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    if (!['q1', 'q2', 'q3', 'q4'].includes(questionKey)) {
      return NextResponse.json({ error: 'Invalid questionKey' }, { status: 400 })
    }
    const words = wordCount(responseText)
    if (words > MAX_WORDS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_WORDS} words per response. You have ${words}.` },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const { error: upsertError } = await supabase.from('user_devotion_responses').upsert(
      {
        user_id: user.id,
        devotion_id: devotionId,
        question_key: questionKey,
        response_text: responseText.slice(0, 4000),
        updated_at: now,
      },
      { onConflict: 'user_id,devotion_id,question_key' }
    )
    if (upsertError) throw upsertError

    let allCompleted = false
    // If this devotion has q1..q4 in devotions, check if we now have responses for all that exist.
    const { data: devotion } = await supabase
      .from('devotions')
      .select('reflection_q1, reflection_q2, reflection_q3, reflection_q4')
      .eq('id', devotionId)
      .single()
    const keysNeeded: string[] = []
    if (devotion?.reflection_q1) keysNeeded.push('q1')
    if (devotion?.reflection_q2) keysNeeded.push('q2')
    if (devotion?.reflection_q3) keysNeeded.push('q3')
    if (devotion?.reflection_q4) keysNeeded.push('q4')
    if (keysNeeded.length > 0) {
      const { data: existing } = await supabase
        .from('user_devotion_responses')
        .select('question_key, response_text')
        .eq('user_id', user.id)
        .eq('devotion_id', devotionId)
      const hasResponse = (key: string) =>
        key === questionKey
          ? responseText.trim().length > 0
          : (existing ?? []).some((r) => r.question_key === key && (r.response_text ?? '').trim().length > 0)
      const allDone = keysNeeded.every((k) => hasResponse(k))
      if (allDone) {
        const { data: prog } = await supabase
          .from('user_progress')
          .select('watch_percentage, completed, completed_at, last_watched_at')
          .eq('user_id', user.id)
          .eq('devotion_id', devotionId)
          .single()
        await supabase.from('user_progress').upsert(
          {
            user_id: user.id,
            devotion_id: devotionId,
            watch_percentage: prog?.watch_percentage ?? 0,
            completed: prog?.completed ?? false,
            completed_at: prog?.completed_at ?? null,
            last_watched_at: prog?.last_watched_at ?? now,
            responses_completed_at: now,
          },
          { onConflict: 'user_id,devotion_id' }
        )
        allCompleted = true
      }
    }

    return NextResponse.json({ success: true, allCompleted })
  } catch (e) {
    console.error('Responses POST error:', e)
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
  }
}
