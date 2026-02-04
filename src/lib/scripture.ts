/**
 * Fetches scripture text from bible-api.com (World English Bible, public domain).
 * Used to display key passage text on devotion pages without royalty concerns.
 */

export interface ScriptureResult {
  reference: string
  text: string
  translation_name: string
  translation_note: string
}

/**
 * Normalize reference for bible-api.com (e.g. strip verse suffixes like 16b, 28a).
 */
function normalizeReference(ref: string): string {
  return ref.replace(/(\d)([ab])\b/gi, '$1').trim()
}

const BIBLE_API_BASE = 'https://bible-api.com'

export async function getScriptureText(reference: string | null | undefined): Promise<ScriptureResult | null> {
  const ref = normalizeReference(reference ?? '')
  if (!ref) return null

  try {
    const url = `${BIBLE_API_BASE}/${encodeURIComponent(ref)}`
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // cache 24h
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      reference?: string
      text?: string
      translation_name?: string
      translation_note?: string
    }
    if (!data?.text) return null
    return {
      reference: data.reference ?? ref,
      text: data.text.trim(),
      translation_name: data.translation_name ?? 'World English Bible',
      translation_note: data.translation_note ?? 'Public Domain',
    }
  } catch {
    return null
  }
}
