'use client'

import Link from 'next/link'
import { FULL_COMPLETION_BADGES, TOTAL_DEVOTIONS } from '@/lib/constants'
import { useDashboardSnapshot } from '@/components/features/useDashboardSnapshot'

function DonutRing({
  percentage,
  color,
  size = 120,
  strokeWidth = 12,
}: {
  percentage: number
  color: string
  size?: number
  strokeWidth?: number
}) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const dash = (percentage / 100) * circumference
  return (
    <svg width={size} height={size} className="rotate-[-90deg]" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-black/10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function WritingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52 1.21-4.77 3.11-6.28C5.5 7.5 6 5.5 6 3c0 0 3 2 6 2s6-2 6-2c0 2.5.5 4.5 2.11 5.72C19.79 10.23 21 12.48 21 15c0 4.42-4.03 8-9 8z" />
    </svg>
  )
}

export function DashboardStats() {
  const {
    completedCount,
    responsesCompletedCount,
    streak,
    watchedThisWeek,
    reflectionsThisWeek,
    nextDevotion,
    spheres,
  } = useDashboardSnapshot()

  const watchedPercent = Math.round((completedCount / TOTAL_DEVOTIONS) * 100)
  const reflectionsPercent = Math.round((responsesCompletedCount / TOTAL_DEVOTIONS) * 100)

  return (
    <>
      {completedCount === 0 && !nextDevotion && (
        <div className="mb-10 rounded-2xl border border-white/20 bg-white/70 p-8 text-center shadow-glass" role="status">
          <p className="text-text-primary">You haven’t completed any devotions yet.</p>
          <p className="mt-2 text-sm text-text-secondary">Pick a sphere below, or search for a topic above.</p>
          <Link
            href="/#spheres"
            className="mt-4 inline-block rounded-xl bg-text-primary px-6 py-3 font-semibold text-cream transition hover:opacity-90"
          >
            Explore Spheres
          </Link>
        </div>
      )}

      {nextDevotion && (
        <div className="group relative mb-8 overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-glass backdrop-blur-sm transition-all duration-300 hover:shadow-glass-hover sm:rounded-3xl">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-education via-religion to-celebration" aria-hidden />
          <div className="flex flex-col gap-4 p-6 pl-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-education/20 to-religion/20 text-education">
                <WritingIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-education">
                  {nextDevotion.type === 'reflections' ? 'Reflections pending' : 'Continue'}
                </p>
                <h2 className="mt-0.5 font-heading text-lg font-bold text-text-primary sm:text-xl">
                  {nextDevotion.type === 'reflections'
                    ? 'Finish your reflections for this passage'
                    : 'Continue your journey'}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">{nextDevotion.title}</p>
              </div>
            </div>
            <Link
              href={`/devotions/${nextDevotion.devotionId}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-education to-religion px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              {nextDevotion.type === 'reflections' ? 'Complete reflections' : 'Watch now'}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glass-hover">
          <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-education/10 blur-2xl" aria-hidden />
          <div className="relative flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-education/15 text-education">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-secondary">
                This week
              </h2>
              <p className="mt-2 text-2xl font-bold text-text-primary">
                {watchedThisWeek} watched · {reflectionsThisWeek} reflections
              </p>
              <p className="mt-1 text-xs text-text-secondary">Last 7 days</p>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glass-hover">
          <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-economics/15 blur-2xl" aria-hidden />
          <div className="relative flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-economics/15 text-economics">
              <FlameIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-secondary">
                Current streak
              </h2>
              <p className="mt-2 text-2xl font-bold text-text-primary">
                {streak} day{streak !== 1 ? 's' : ''}
              </p>
              <p className="mt-1 text-xs text-text-secondary">Consecutive days</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-10 rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass sm:p-8">
        <h2 className="font-heading text-lg font-bold text-text-primary">Overall progress</h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative inline-flex items-center justify-center">
              <DonutRing percentage={watchedPercent} color="#25b7d6" size={120} strokeWidth={12} />
              <span className="absolute text-xl font-bold text-text-primary">{watchedPercent}%</span>
            </div>
            <p className="text-sm font-semibold text-text-primary">Watched</p>
            <p className="text-base font-bold text-text-primary">
              {completedCount} <span className="font-normal text-text-secondary">/ {TOTAL_DEVOTIONS}</span>
            </p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative inline-flex items-center justify-center">
              <DonutRing percentage={reflectionsPercent} color="#88c807" size={120} strokeWidth={12} />
              <span className="absolute text-xl font-bold text-text-primary">{reflectionsPercent}%</span>
            </div>
            <p className="text-sm font-semibold text-text-primary">Reflections done</p>
            <p className="text-base font-bold text-text-primary">
              {responsesCompletedCount} <span className="font-normal text-text-secondary">/ {TOTAL_DEVOTIONS}</span>
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-text-secondary">
          Complete a devotion by watching the video (90%+) and answering all reflection questions.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-heading text-lg font-bold text-text-primary">Progress by sphere</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {spheres.map((sphere) => (
            <Link
              key={sphere.slug}
              href={`/spheres/${sphere.slug}`}
              className="group flex flex-col rounded-xl border border-white/20 bg-white/70 p-4 shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                  style={{ backgroundColor: `${sphere.color_primary}20` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/sphere-icons/${sphere.icon}`}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading font-bold text-text-primary group-hover:text-education">
                    {sphere.name}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {sphere.completed} watched · {sphere.responsesCompleted} reflections
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="relative inline-flex items-center justify-center">
                    <DonutRing percentage={sphere.percentage} color={sphere.color_primary} size={56} strokeWidth={5} />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <PlayIcon className="h-4 w-4 text-text-primary opacity-70" />
                    </span>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">Watched</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="relative inline-flex items-center justify-center">
                    <DonutRing
                      percentage={sphere.responsesPercentage}
                      color={sphere.color_primary}
                      size={56}
                      strokeWidth={5}
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <WritingIcon className="h-4 w-4 text-text-primary opacity-70" />
                    </span>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">Reflections</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass sm:p-8">
        <h2 className="font-heading text-lg font-bold text-text-primary">Full completion badges</h2>
        <p className="mt-1 text-sm text-text-secondary">Earn these when you complete both the video and all reflection questions.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-4">
          {FULL_COMPLETION_BADGES.map((badge) => {
            const earned = responsesCompletedCount >= badge.threshold
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center rounded-xl border-2 px-4 py-3 transition ${
                  earned ? 'border-education bg-education/10' : 'border-white/20 opacity-70'
                }`}
                title={`${badge.name}: ${badge.threshold} full completions${earned ? ' (earned)' : ''}`}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <span className="mt-1.5 font-heading text-sm font-semibold text-text-primary">{badge.name}</span>
                <span className="text-[10px] text-text-secondary">{badge.threshold} full</span>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
