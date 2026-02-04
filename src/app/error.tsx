'use client'

import { useEffect } from 'react'
import { sendLogToTerminal } from '@/lib/send-log-to-terminal'

const LOG_PREFIX = '[App Error Boundary]'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(LOG_PREFIX, '=== CAUGHT ERROR ===')
    const earlyLog = typeof window !== 'undefined' ? (window as unknown as { __SPHERES_ERROR_LOG?: string[] }).__SPHERES_ERROR_LOG : undefined
    if (Array.isArray(earlyLog) && earlyLog.length > 0) {
      console.error(LOG_PREFIX, 'Early errors (before React):', earlyLog)
      sendLogToTerminal(LOG_PREFIX, 'Early errors (before React):', ...earlyLog)
    }
    console.error(LOG_PREFIX, 'message:', error?.message)
    console.error(LOG_PREFIX, 'name:', error?.name)
    console.error(LOG_PREFIX, 'digest:', (error as Error & { digest?: string })?.digest)
    console.error(LOG_PREFIX, 'stack:', error?.stack)
    console.error(LOG_PREFIX, 'full error:', error)
    sendLogToTerminal(LOG_PREFIX,
      '=== CAUGHT ERROR ===',
      `message: ${error?.message ?? ''}`,
      `name: ${error?.name ?? ''}`,
      `stack: ${error?.stack ?? ''}`)
    if (error && typeof error === 'object') {
      try {
        console.error(LOG_PREFIX, 'error keys:', Object.keys(error))
        console.error(LOG_PREFIX, 'error.constructor:', error.constructor?.name)
      } catch (e) {
        console.error(LOG_PREFIX, 'could not inspect error:', e)
      }
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafaf9]">
      <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-red-800">Something went wrong</h1>
        <p className="mt-2 text-red-700">
          Check the browser console for detailed logs (look for <code className="bg-red-100 px-1 rounded">[App Error Boundary]</code>).
        </p>
        <p className="mt-3 font-mono text-sm text-red-600 break-all">{error?.message ?? 'Unknown error'}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
