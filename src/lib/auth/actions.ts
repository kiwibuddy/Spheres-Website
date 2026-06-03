'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export type AuthActionResult = { error?: string; success?: boolean; message?: string; url?: string }

export async function signInWithPasswordAction(
  email: string,
  password: string,
  redirectTo = '/dashboard'
): Promise<AuthActionResult> {
  const supabase = await createClient()
  if (!supabase) {
    return {
      error:
        'Sign-in is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.',
    }
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sign-in failed'
    return {
      error:
        message === 'Load failed' || message === 'Failed to fetch'
          ? 'Could not reach the auth server. Check your connection, or try “Continue with Google”.'
          : message,
    }
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo.startsWith('/') ? redirectTo : '/dashboard')
}

export async function signUpWithPasswordAction(
  email: string,
  password: string
): Promise<AuthActionResult> {
  const supabase = await createClient()
  if (!supabase) {
    return {
      error:
        'Sign-up is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.',
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (data.session) {
      revalidatePath('/', 'layout')
      redirect('/dashboard')
    }
    return { success: true, message: 'Check your email to confirm your account, then sign in.' }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sign-up failed'
    return {
      error:
        message === 'Load failed' || message === 'Failed to fetch'
          ? 'Could not reach the auth server. Check your connection, or try “Continue with Google”.'
          : message,
    }
  }
}

export async function getGoogleSignInUrl(redirectTo = '/dashboard'): Promise<AuthActionResult> {
  const supabase = await createClient()
  if (!supabase) {
    return { error: 'Google sign-in is not configured yet.' }
  }

  const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/dashboard'
  const callbackUrl = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeRedirect)}`

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        skipBrowserRedirect: true,
      },
    })
    if (error) return { error: error.message }
    if (!data.url) return { error: 'Google sign-in is not enabled. Enable Google in Supabase → Authentication → Providers.' }
    return { url: data.url }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Google sign-in failed'
    return { error: message }
  }
}
