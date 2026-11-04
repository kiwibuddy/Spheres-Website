'use client'

import { useEffect, useState } from 'react'
import { EMPTY_DASHBOARD, type DashboardSnapshot } from '@/lib/dashboard-types'

/** Paint with zeros, then fill in saved progress if a session already exists. */
export function useDashboardSnapshot(): DashboardSnapshot {
  const [snapshot, setSnapshot] = useState(EMPTY_DASHBOARD)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/dashboard', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DashboardSnapshot | null) => {
        if (data?.signedIn) setSnapshot(data)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  return snapshot
}
