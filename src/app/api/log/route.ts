import { NextRequest } from 'next/server'

/**
 * Dev-only: receive client-side logs and print them to the terminal.
 * This lets Cursor's terminal show errors that occur in the browser.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response(null, { status: 204 })
  }
  try {
    const body = await request.json()
    const prefix = (body.prefix as string) || '[Client]'
    const lines = Array.isArray(body.lines) ? body.lines : [body.message ?? JSON.stringify(body)]
    for (const line of lines) {
      console.log(`${prefix} ${line}`)
    }
  } catch {
    // ignore
  }
  return new Response(null, { status: 204 })
}
