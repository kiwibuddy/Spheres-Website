/** Supabase session cookies, including chunked names like `sb-…-auth-token.0`. */
export function isSupabaseAuthCookieName(name: string): boolean {
  return name.startsWith('sb-') && name.includes('auth-token')
}
