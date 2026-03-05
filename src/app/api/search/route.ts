import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const MAX_QUERY_LENGTH = 500
const DEFAULT_LIMIT = 20
const RATE_LIMIT_PER_MINUTE = 30
const RATE_LIMIT_WINDOW_MS = 60_000

// In-memory rate limiter (resets on server restart). Keyed by IP.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_PER_MINUTE) return false
  entry.count++
  return true
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ip = getClientIp(request)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many searches. Please try again in a minute.' }, { status: 429 })
  }

  const q = searchParams.get('q')?.trim()
  if (!q || q.length === 0) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 })
  }
  if (q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: `Query too long (max ${MAX_QUERY_LENGTH} chars)` }, { status: 400 })
  }

  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    return NextResponse.json(
      { error: 'Search not configured (OPENAI_API_KEY missing)' },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in to search' }, { status: 401 })
  }

  try {
    const openai = new OpenAI({ apiKey: openaiKey })
    const embedResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: q,
    })
    const data = (embedResponse as { data?: Array<{ embedding?: number[] }> }).data
    const embedding = data?.[0]?.embedding
    if (!embedding) {
      console.error('OpenAI embedding: no embedding in response')
      return NextResponse.json(
        { error: 'Failed to process query' },
        { status: 500 }
      )
    }

    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '', 10) || DEFAULT_LIMIT))
    const { data: rows, error: rpcError } = await supabase.rpc('match_devotions', {
      query_embedding: embedding,
      match_count: limit,
    })

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    const results = (rows || []).map((r: { id: number; slug: string; title: string; scripture_reference: string; code: string; sphere_name: string; similarity?: number }) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      scripture_reference: r.scripture_reference,
      code: r.code,
      sphere_name: r.sphere_name,
      similarity: r.similarity,
    }))

    return NextResponse.json({ results })
  } catch (e) {
    console.error('Search API error:', e)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
