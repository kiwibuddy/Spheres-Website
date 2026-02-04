import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getCompletedCount,
  getResponsesCompletedCount,
  getSphereProgress,
  getStreak,
  getWeeklySummary,
  getNextDevotion,
} from '@/lib/supabase/progress'
import { SPHERES, TOTAL_DEVOTIONS, DEVOTIONS_PER_SPHERE, FULL_COMPLETION_BADGES } from '@/lib/constants'

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

export default async function DashboardPage() {
  const supabase = await createClient()
  if (!supabase) {
    return (
      <div className="min-h-screen px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-[1000px]">
          <h1 className="font-heading text-4xl font-bold text-text-primary">Your Progress</h1>
          <p className="mt-2 text-text-secondary">Explore devotions and track your journey.</p>
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
            <p className="font-medium">Running in demo mode</p>
            <p className="mt-2 text-sm">Progress saving is off until Supabase is configured. Add <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">.env.local</code> to enable sign-in and progress tracking.</p>
          </div>
          <div className="mt-10 rounded-3xl border border-white/20 bg-white/70 p-8 shadow-glass">
            <h2 className="font-heading text-xl font-bold text-text-primary">Overall</h2>
            <p className="mt-2 text-3xl font-bold text-text-primary">0 / {TOTAL_DEVOTIONS}</p>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-black/10">
              <div className="h-full w-0 rounded-full bg-gradient-to-r from-education to-family" />
            </div>
            <p className="mt-2 text-sm text-text-secondary">0% complete</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {SPHERES.map((sphere) => (
              <Link
                key={sphere.slug}
                href={`/spheres/${sphere.slug}`}
                className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="font-heading text-lg font-bold text-text-primary">{sphere.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">0 / {DEVOTIONS_PER_SPHERE} completed</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/10">
                  <div className="h-full w-0 rounded-full" style={{ backgroundColor: sphere.color_primary }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let completedCount = 0
  let responsesCompletedCount = 0
  let streak = 0
  let weeklySummary = { watchedThisWeek: 0, reflectionsThisWeek: 0 }
  let nextDevotion: Awaited<ReturnType<typeof getNextDevotion>> = null
  let sphereProgressList: {
    slug: string
    name: string
    color_primary: string
    completed: number
    percentage: number
    responsesCompleted: number
    responsesPercentage: number
  }[] = []
  try {
    ;[completedCount, responsesCompletedCount, streak, nextDevotion] = await Promise.all([
      getCompletedCount(supabase, user.id),
      getResponsesCompletedCount(supabase, user.id),
      getStreak(supabase, user.id),
      getNextDevotion(supabase, user.id),
    ])
    weeklySummary = await getWeeklySummary(supabase, user.id)
    sphereProgressList = await Promise.all(
      SPHERES.map(async (s) => {
        const p = await getSphereProgress(supabase, user.id, s.id)
        return {
          slug: s.slug,
          name: s.name,
          color_primary: s.color_primary,
          completed: p.completed,
          percentage: p.percentage,
          responsesCompleted: p.responsesCompleted,
          responsesPercentage: p.responsesPercentage,
        }
      })
    )
  } catch {
    // use zeros
  }

  const watchedPercent = Math.round((completedCount / TOTAL_DEVOTIONS) * 100)
  const reflectionsPercent = Math.round((responsesCompletedCount / TOTAL_DEVOTIONS) * 100)

  return (
    <div className="min-h-screen px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="font-heading text-4xl font-bold text-text-primary">Your Progress</h1>
        <p className="mt-2 text-text-secondary">Track your journey through the 416 devotions</p>

        {completedCount === 0 && !nextDevotion && (
          <div className="mt-8 rounded-2xl border border-white/20 bg-white/70 p-8 text-center shadow-glass" role="status">
            <p className="text-text-primary">You haven’t completed any devotions yet.</p>
            <p className="mt-2 text-sm text-text-secondary">Start with a sphere below and watch your first devotion.</p>
            <Link
              href="/#spheres"
              className="mt-4 inline-block rounded-xl bg-text-primary px-6 py-3 font-semibold text-cream hover:opacity-90"
            >
              Explore Spheres
            </Link>
          </div>
        )}

        {/* Next step */}
        {nextDevotion && (
          <div className="mt-8 rounded-2xl border border-education/30 bg-education/5 p-6 shadow-glass">
            <h2 className="font-heading text-lg font-bold text-text-primary">Next step</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {nextDevotion.type === 'reflections'
                ? 'Finish your reflections for this passage'
                : 'Continue your journey'}
            </p>
            <Link
              href={`/devotions/${nextDevotion.devotionId}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-text-primary px-5 py-2.5 font-semibold text-cream transition hover:opacity-90"
            >
              {nextDevotion.type === 'reflections' ? 'Complete reflections' : 'Watch now'}: {nextDevotion.title}
            </Link>
          </div>
        )}

        {/* This week + Streak */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass">
            <h2 className="font-heading text-lg font-bold text-text-primary">This week</h2>
            <p className="mt-2 text-2xl font-bold text-text-primary">
              {weeklySummary.watchedThisWeek} watched · {weeklySummary.reflectionsThisWeek} reflections
            </p>
            <p className="mt-1 text-sm text-text-secondary">Last 7 days</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass">
            <h2 className="font-heading text-lg font-bold text-text-primary">Current streak</h2>
            <p className="mt-2 text-2xl font-bold text-text-primary">{streak} day{streak !== 1 ? 's' : ''}</p>
            <p className="mt-1 text-sm text-text-secondary">Consecutive days with a completion</p>
          </div>
        </div>

        {/* Two-level overview with donuts */}
        <div className="mt-10 rounded-3xl border border-white/20 bg-white/70 p-8 shadow-glass">
          <h2 className="font-heading text-xl font-bold text-text-primary">Overall progress</h2>
          <div className="mt-6 flex flex-wrap items-center gap-12">
            <div className="flex flex-col items-center gap-2">
              <div className="relative inline-flex items-center justify-center">
                <DonutRing percentage={watchedPercent} color="#25b7d6" size={140} strokeWidth={14} />
                <span className="absolute text-2xl font-bold text-text-primary">{watchedPercent}%</span>
              </div>
              <p className="text-sm font-semibold text-text-primary">Watched</p>
              <p className="text-lg font-bold text-text-primary">
                {completedCount} <span className="font-normal text-text-secondary">/ {TOTAL_DEVOTIONS}</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="relative inline-flex items-center justify-center">
                <DonutRing percentage={reflectionsPercent} color="#88c807" size={140} strokeWidth={14} />
                <span className="absolute text-2xl font-bold text-text-primary">{reflectionsPercent}%</span>
              </div>
              <p className="text-sm font-semibold text-text-primary">Reflections done</p>
              <p className="text-lg font-bold text-text-primary">
                {responsesCompletedCount} <span className="font-normal text-text-secondary">/ {TOTAL_DEVOTIONS}</span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            Complete a devotion by watching the video (90%+) and answering all reflection questions.
          </p>
        </div>

        {/* Per-sphere cards with two-level progress */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {sphereProgressList.map((sphere) => (
            <Link
              key={sphere.slug}
              href={`/spheres/${sphere.slug}`}
              className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">{sphere.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {sphere.completed} watched · {sphere.responsesCompleted} reflections
                  </p>
                </div>
                <div className="relative shrink-0">
                  <DonutRing
                    percentage={sphere.percentage}
                    color={sphere.color_primary}
                    size={56}
                    strokeWidth={6}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary">
                    {sphere.percentage}%
                  </span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${sphere.percentage}%`, backgroundColor: sphere.color_primary }}
                  />
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${sphere.responsesPercentage}%`,
                      backgroundColor: sphere.color_primary,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                Left: watched · Right: reflections
              </p>
            </Link>
          ))}
        </div>

        {/* Full completion badges */}
        <div className="mt-12 rounded-2xl border border-white/20 bg-white/70 p-8 shadow-glass">
          <h2 className="font-heading text-xl font-bold text-text-primary">Full completion badges</h2>
          <p className="mt-1 text-sm text-text-secondary">Earn these when you complete both the video and all reflection questions.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            {FULL_COMPLETION_BADGES.map((badge) => {
              const earned = responsesCompletedCount >= badge.threshold
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center rounded-2xl border-2 px-6 py-4 transition ${
                    earned ? 'border-education bg-education/10' : 'border-white/20 opacity-70'
                  }`}
                  title={`${badge.name}: ${badge.threshold} full completions${earned ? ' (earned)' : ''}`}
                >
                  <span className="text-3xl">{badge.emoji}</span>
                  <span className="mt-2 font-heading font-semibold text-text-primary">{badge.name}</span>
                  <span className="text-xs text-text-secondary">{badge.threshold} full</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
