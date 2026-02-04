/**
 * In development, send log lines to /api/log so they appear in the Cursor/terminal.
 * Fire-and-forget; never throws.
 */
export function sendLogToTerminal(prefix: string, ...lines: (string | unknown)[]): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return
  const payload = {
    prefix,
    lines: lines.map((l) => (typeof l === 'string' ? l : String(l))),
  }
  fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}
