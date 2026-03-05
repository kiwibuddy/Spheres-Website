'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      const supabase = createClient()
      if (!supabase) {
        setError('Sign-in is not configured. Please add Supabase env vars.')
        return
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
      if (signInError) {
        setError(signInError.message)
        return
      }
      router.push(redirectTo.startsWith('/') ? redirectTo : '/dashboard')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/70 p-8 shadow-glass">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Sign in</h1>
        <p className="mt-1 text-sm text-text-secondary">Access your progress and devotions</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-text-primary shadow-sm focus:border-education focus:ring-1 focus:ring-education"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-text-primary shadow-sm focus:border-education focus:ring-1 focus:ring-education"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-text-primary py-3 font-semibold text-cream transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          No account?{' '}
          <Link href="/signup" className="font-medium text-education hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/70 p-8 shadow-glass">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-4 w-64 rounded bg-gray-200" />
            <div className="h-12 rounded bg-gray-200" />
            <div className="h-12 rounded bg-gray-200" />
            <div className="h-12 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
