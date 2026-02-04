'use client'

import { useEffect } from 'react'
import { sendLogToTerminal } from '@/lib/send-log-to-terminal'

console.log('[ClientErrorLogger] module loaded')

const LOG_PREFIX = '[ClientErrorLogger]'

/**
 * Sets up global error handlers to log webpack/module errors.
 * In dev, also sends to /api/log so logs appear in the Cursor terminal.
 */
export function ClientErrorLogger() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error(LOG_PREFIX, 'window.onerror:', event.message)
      console.error(LOG_PREFIX, 'filename:', event.filename)
      console.error(LOG_PREFIX, 'lineno:', event.lineno, 'colno:', event.colno)
      console.error(LOG_PREFIX, 'error:', event.error)
      if (event.error?.stack) console.error(LOG_PREFIX, 'stack:', event.error.stack)
      sendLogToTerminal(LOG_PREFIX,
        `window.onerror: ${event.message}`,
        `file: ${event.filename ?? ''}:${event.lineno ?? ''}:${event.colno ?? ''}`,
        event.error?.stack ?? String(event.error))
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error(LOG_PREFIX, 'unhandledrejection:', event.reason)
      sendLogToTerminal(LOG_PREFIX, 'unhandledrejection:', String(event.reason))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    console.log(LOG_PREFIX, 'error handlers installed')

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
