import type { NextRequest } from 'next/server'

/** Detect Supabase session cookies without any network call (safe for Edge middleware). */
export function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
  )
}
