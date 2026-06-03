import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return response

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Read session from cookies only — avoids 3× getUser() network calls that caused
  // MIDDLEWARE_INVOCATION_TIMEOUT on Vercel. Server pages still use getUser() where needed.
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const { pathname } = request.nextUrl
  const isAuthRoute = pathname === '/login' || pathname === '/signup'
  const isDashboard = pathname.startsWith('/dashboard')
  const isDevotionPage = pathname.startsWith('/devotions/')

  if ((isDashboard || isDevotionPage) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/devotions/:path*', '/login', '/signup'],
}
