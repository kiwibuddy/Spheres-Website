'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DevotionPlayer } from './DevotionPlayer'

const PROGRESS_INTERVAL_MS = 10000

export interface DevotionPlayerWithProgressProps {
  youtubeUrl: string
  devotionId: number
}

export function DevotionPlayerWithProgress({ youtubeUrl, devotionId }: DevotionPlayerWithProgressProps) {
  const lastSaved = useRef(0)
  const lastPercentage = useRef(0)
  const hasShownCompletion = useRef(false)
  const [saveError, setSaveError] = useState(false)
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false)

  const saveProgress = useCallback(
    async (percentage: number) => {
      lastPercentage.current = percentage
      const now = Date.now()
      const shouldSave =
        percentage >= 90 || now - lastSaved.current >= PROGRESS_INTERVAL_MS
      if (!shouldSave) return
      lastSaved.current = now
      setSaveError(false)
      try {
        const supabase = createClient()
        if (!supabase) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            devotionId,
            watchPercentage: percentage,
            completed: percentage >= 90,
          }),
        })
        if (res.status >= 500) {
          setSaveError(true)
          return
        }
        if (res.ok && percentage >= 90 && !hasShownCompletion.current) {
          hasShownCompletion.current = true
          setShowCompletionCelebration(true)
        }
      } catch {
        setSaveError(true)
      }
    },
    [devotionId]
  )

  useEffect(() => {
    if (!showCompletionCelebration) return
    const t = setTimeout(() => setShowCompletionCelebration(false), 4000)
    return () => clearTimeout(t)
  }, [showCompletionCelebration])

  return (
    <div className="relative flex h-full flex-col">
      {showCompletionCelebration && (
        <div
          className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center shadow-lg"
          style={{ animation: 'fade-in 0.3s ease-out forwards' }}
          role="status"
          aria-live="polite"
        >
          <span className="font-semibold text-green-800">Devotion complete!</span>
          <p className="mt-0.5 text-sm text-green-700">This key passage is marked complete on your progress.</p>
        </div>
      )}
      <div className="relative min-h-0 flex-1 w-full">
        <div className="absolute inset-0">
          <DevotionPlayer
            youtubeUrl={youtubeUrl}
            devotionId={devotionId}
            onProgress={saveProgress}
          />
        </div>
      </div>
      {saveError && (
        <p
          className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800"
          role="alert"
        >
          Progress couldn’t be saved. You can still watch the video; progress will save once you’re connected.
        </p>
      )}
    </div>
  )
}
