'use client'

import { useCallback, useEffect, useState } from 'react'

const MAX_WORDS = 500

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export interface ReflectionResponsesProps {
  devotionId: number
  questions: { key: 'q1' | 'q2' | 'q3' | 'q4'; text: string }[]
}

export function ReflectionResponses({ devotionId, questions }: ReflectionResponsesProps) {
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Record<string, string>>({})
  const [showToast, setShowToast] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/responses?devotionId=${devotionId}`)
      if (!res.ok) return
      const data = await res.json()
      const next: Record<string, string> = {}
      for (const k of ['q1', 'q2', 'q3', 'q4']) {
        next[k] = data.responses?.[k]?.response_text ?? ''
      }
      setResponses(next)
    } finally {
      setLoaded(true)
    }
  }, [devotionId])

  useEffect(() => {
    load()
  }, [load])

  const save = useCallback(
    async (questionKey: string, text: string) => {
      const words = wordCount(text)
      if (words > MAX_WORDS) return
      setSaving(questionKey)
      try {
        const res = await fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            devotionId,
            questionKey,
            responseText: text,
          }),
        })
        if (res.ok) {
          setSavedAt((prev) => ({ ...prev, [questionKey]: new Date().toISOString() }))
          const data = await res.json()
          if (data.allCompleted) setShowToast(true)
        }
      } finally {
        setSaving(null)
      }
    },
    [devotionId]
  )

  if (questions.length === 0) return null

  return (
    <div className="mt-6 space-y-6">
      <p className="text-sm font-medium text-text-secondary">
        Write your reflections below (up to {MAX_WORDS} words per question). Your answers are saved privately.
      </p>
      {!loaded ? (
        <p className="text-text-secondary">Loading…</p>
      ) : (
        <ul className="space-y-6">
          {questions.map(({ key, text }) => {
            const value = responses[key] ?? ''
            const words = wordCount(value)
            const atLimit = words >= MAX_WORDS
            return (
              <li key={key} className="rounded-xl border border-white/20 bg-white/50 p-4">
                <p className="mb-2 font-medium text-text-primary">{text}</p>
                <textarea
                  value={value}
                  onChange={(e) => setResponses((prev) => ({ ...prev, [key]: e.target.value }))}
                  onBlur={() => value.trim() && save(key, value)}
                  placeholder="Type your response…"
                  rows={4}
                  maxLength={4000}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-text-primary placeholder:text-gray-400 focus:border-education focus:ring-1 focus:ring-education"
                  aria-label={`Response for question`}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-sm ${atLimit ? 'text-amber-600' : 'text-text-secondary'}`}>
                    {words} / {MAX_WORDS} words
                  </span>
                  {saving === key ? (
                    <span className="text-sm text-text-secondary">Saving…</span>
                  ) : savedAt[key] ? (
                    <span className="text-sm text-green-600">Saved</span>
                  ) : value.trim() ? (
                    <button
                      type="button"
                      onClick={() => save(key, value)}
                      className="text-sm font-medium text-education hover:underline"
                    >
                      Save
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {showToast && (
        <Toast
          message="Reflections complete! This passage is marked fully complete."
          onDismiss={() => setShowToast(false)}
        />
      )}
    </div>
  )
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])
  return (
    <div
      className="fixed bottom-6 left-1/2 z-[2000] -translate-x-1/2 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-medium text-green-800 shadow-lg animate-[fade-in_0.3s_ease-out]"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}
