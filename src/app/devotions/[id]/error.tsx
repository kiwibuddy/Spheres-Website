'use client'

import { useEffect } from 'react'
import Link from 'next/link'

const LOG_PREFIX = '[DevotionPage Error]'

export default function DevotionError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(LOG_PREFIX, 'Caught error:', error?.message)
    console.error(LOG_PREFIX, 'Error name:', error?.name)
    console.error(LOG_PREFIX, 'Digest:', (error as Error & { digest?: string })?.digest)
    console.error(LOG_PREFIX, 'Full error object:', error)
    console.error(LOG_PREFIX, 'Stack:', error?.stack)
  }, [error])

  return (
    <div className="min-h-screen px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-[600px] rounded-2xl border border-red-200 bg-red-50/80 p-8 shadow-lg">
        <h1 className="font-heading text-xl font-bold text-red-800">Something went wrong</h1>
        <p className="mt-2 text-red-700">
          This devotion page couldn’t load. Check the browser console (and terminal if you ran the dev server) for
          detailed logs.
        </p>
        <p className="mt-3 font-mono text-sm text-red-600 break-all" aria-live="polite">
          {error?.message ?? 'Unknown error'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
