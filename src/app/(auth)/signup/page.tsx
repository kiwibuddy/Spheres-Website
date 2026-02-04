'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const schema = z
  .object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({ email: data.email, password: data.password })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      setSuccess(true)
      router.push('/dashboard')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-3xl border border-white/20 bg-white/70 p-8 text-center shadow-glass">
          <p className="text-text-primary">Check your email to confirm your account.</p>
          <Link href="/login" className="mt-4 inline-block font-medium text-education hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/70 p-8 shadow-glass">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Create account</h1>
        <p className="mt-1 text-sm text-text-secondary">Start your journey through 416 devotions</p>
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
              autoComplete="new-password"
              className="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-text-primary shadow-sm focus:border-education focus:ring-1 focus:ring-education"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-text-primary shadow-sm focus:border-education focus:ring-1 focus:ring-education"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-text-primary py-3 font-semibold text-cream transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-education hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
