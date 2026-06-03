import { NextResponse, type NextRequest } from 'next/server'
import { hasSupabaseAuthCookie } from '@/lib/auth-cookies'

/**
 * Lightweight route guard — cookie check only, no Supabase client.
 * Calling Supabase from Edge middleware caused MIDDLEWARE_INVOCATION_TIMEOUT on Vercel.
 * Login/signup are excluded from the matcher so sign-in pages always load instantly.
 * Dashboard and devotion pages still enforce auth via server components (getUser).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!hasSupabaseAuthCookie(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/devotions/:path*'],
}
