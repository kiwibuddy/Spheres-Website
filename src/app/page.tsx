import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCompletedCount, getResponsesCompletedCount, getSphereProgress, getStreak } from '@/lib/supabase/progress'
import { SPHERES, ACHIEVEMENT_BADGES, FULL_COMPLETION_BADGES, TOTAL_DEVOTIONS, DEVOTIONS_PER_SPHERE } from '@/lib/constants'
import { SphereCardWithModal } from '@/components/features/SphereCardWithModal'

async function getHomeProgress() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return {
        completedCount: 0,
        responsesCompletedCount: 0,
        streak: 0,
        sphereCompleted: SPHERES.map(() => 0),
        badgesEarned: 0,
        fullBadgesEarned: 0,
      }
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        completedCount: 0,
        responsesCompletedCount: 0,
        streak: 0,
        sphereCompleted: SPHERES.map(() => 0),
        badgesEarned: 0,
        fullBadgesEarned: 0,
      }
    }
    const [completedCount, responsesCompletedCount, streak, sphereProgress] = await Promise.all([
      getCompletedCount(supabase, user.id),
      getResponsesCompletedCount(supabase, user.id),
      getStreak(supabase, user.id),
      Promise.all(SPHERES.map((s) => getSphereProgress(supabase, user.id, s.id))),
    ])
    const sphereCompleted = sphereProgress.map((p) => p.completed)
    const badgesEarned = ACHIEVEMENT_BADGES.filter((b) => completedCount >= b.threshold).length
    const fullBadgesEarned = FULL_COMPLETION_BADGES.filter((b) => responsesCompletedCount >= b.threshold).length
    return {
      completedCount,
      responsesCompletedCount,
      streak,
      sphereCompleted,
      badgesEarned,
      fullBadgesEarned,
    }
  } catch {
    return {
      completedCount: 0,
      responsesCompletedCount: 0,
      streak: 0,
      sphereCompleted: SPHERES.map(() => 0),
      badgesEarned: 0,
      fullBadgesEarned: 0,
    }
  }
}

export default async function HomePage() {
  const { completedCount, responsesCompletedCount, streak, sphereCompleted, badgesEarned, fullBadgesEarned } =
    await getHomeProgress()
  const overallPct = Math.round((completedCount / TOTAL_DEVOTIONS) * 100)
  const isBadgeEarned = (threshold: number) => completedCount >= threshold
  const isFullBadgeEarned = (threshold: number) => responsesCompletedCount >= threshold

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(37,183,214,0.1)_0%,transparent_50%)] bg-[radial-gradient(circle_at_80%_80%,rgba(255,58,48,0.1)_0%,transparent_50%)] bg-[radial-gradient(circle_at_40%_20%,rgba(136,200,7,0.08)_0%,transparent_50%)]" />
        <div className="relative z-10 max-w-[1200px] text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-5 py-2.5 text-sm font-medium backdrop-blur-[10px]">
            <span>✨</span>
            <span>{TOTAL_DEVOTIONS} Biblical Devotions</span>
          </div>
          <h1 className="font-heading text-[clamp(3rem,8vw,6.5rem)] font-bold leading-tight tracking-tight text-text-primary">
            Transform Your
            <br />
            <span className="inline-block bg-gradient-to-br from-education via-family to-religion bg-clip-text text-transparent">
              Worldview
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-[clamp(1.1rem,2vw,1.4rem)] leading-relaxed text-text-secondary">
            Build on the Foundational 52—a biblical worldview for all of life—then explore the 7 spheres of society. {DEVOTIONS_PER_SPHERE} devotions each. Track progress, earn achievements, and grow in understanding.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-[14px] bg-text-primary px-10 py-4 text-lg font-semibold text-cream shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              Begin Journey
            </Link>
            <Link
              href="/#spheres"
              className="rounded-[14px] border-2 border-text-primary px-10 py-4 text-lg font-semibold text-text-primary transition-all duration-300 hover:-translate-y-1 hover:bg-text-primary hover:text-cream"
            >
              Explore Spheres
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-6 w-6 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Stats Bento */}
      <section className="relative z-10 mx-auto max-w-[1400px] -mt-12 px-6 pb-24 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: '📚', value: String(completedCount), label: 'Watched' },
            { icon: '🔥', value: String(streak), label: 'Day Streak' },
            { icon: '✨', value: String(responsesCompletedCount), label: 'Full Completions' },
            { icon: '⭐', value: `${overallPct}%`, label: 'Overall Progress' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 shadow-glass transition-all duration-300 hover:-translate-y-2 hover:shadow-glass-hover"
            >
              <div className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-education to-media transition-transform duration-300 group-hover:scale-x-100" />
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-education to-media text-3xl">
                {stat.icon}
              </div>
              <div className="font-heading text-4xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-sm font-medium text-text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Foundational + 7 Spheres Bento */}
      <section id="spheres" className="mx-auto max-w-[1400px] px-6 pb-24 sm:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight text-text-primary">
            Foundational Worldview + 7 Spheres
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-xl text-text-secondary">
            Start with the Foundational 52—the backbone of a biblical worldview for all of life—then explore the 7 spheres of society. Each has {DEVOTIONS_PER_SPHERE} weekly devotions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[300px_300px_300px]">
          {SPHERES.map((sphere, i) => {
            const completed = sphereCompleted[i] ?? 0
            const progressPct = Math.round((completed / DEVOTIONS_PER_SPHERE) * 100)
            const gridClass =
              i === 0 || i === 1
                ? 'lg:col-span-6'
                : i === 2
                  ? 'lg:col-span-4 lg:row-span-2'
                  : i === 3 || i === 4
                    ? 'lg:col-span-4'
                    : i === 5
                      ? 'lg:col-span-6'
                      : 'lg:col-span-3'
            return (
              <SphereCardWithModal
                key={sphere.slug}
                sphere={sphere}
                completed={completed}
                progressPct={progressPct}
                gridClass={gridClass}
              />
            )
          })}
        </div>
      </section>

      {/* Achievements */}
      <section id="achievements" className="mx-auto max-w-[1400px] px-6 pb-24 text-center sm:px-8" aria-labelledby="achievements-heading">
        <h2 id="achievements-heading" className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold text-text-primary">
          Achievements
        </h2>
        <p className="mx-auto mt-2 max-w-[500px] text-text-secondary">Earn badges as you watch and fully complete devotions</p>
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Watched</h3>
          <div className="mt-4 flex flex-wrap justify-center gap-6">
            {ACHIEVEMENT_BADGES.map((badge) => {
              const earned = isBadgeEarned(badge.threshold)
              return (
                <div
                  key={badge.id}
                  className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 bg-white/70 text-3xl shadow-glass transition-all duration-300 hover:-translate-y-3 hover:shadow-lg ${
                    earned ? 'border-education' : 'border-white/20 opacity-70 grayscale'
                  }`}
                  title={`${badge.name}: ${badge.threshold} watched${earned ? ' (earned)' : ''}`}
                >
                  <span>{badge.emoji}</span>
                  <span className="mt-1 text-xs font-medium text-text-secondary">{badge.name}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Full completion (video + reflections)</h3>
          <div className="mt-4 flex flex-wrap justify-center gap-6">
            {FULL_COMPLETION_BADGES.map((badge) => {
              const earned = isFullBadgeEarned(badge.threshold)
              return (
                <div
                  key={badge.id}
                  className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 bg-white/70 text-3xl shadow-glass transition-all duration-300 hover:-translate-y-3 hover:shadow-lg ${
                    earned ? 'border-education' : 'border-white/20 opacity-70 grayscale'
                  }`}
                  title={`${badge.name}: ${badge.threshold} full completions${earned ? ' (earned)' : ''}`}
                >
                  <span>{badge.emoji}</span>
                  <span className="mt-1 text-xs font-medium text-text-secondary">{badge.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
