import Link from 'next/link'
import type { StaticDevotion } from '@/lib/devotions-data'

export interface DevotionCardProps {
  devotion: StaticDevotion
  progress?: { completed: boolean; watch_percentage: number; responses_completed?: boolean } | null
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function PenCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    </svg>
  )
}

export function DevotionCard({ devotion, progress }: DevotionCardProps) {
  const completed = progress?.completed ?? false
  const responsesCompleted = progress?.responses_completed ?? false
  const percent = progress?.watch_percentage ?? 0
  const showPercent = !completed && percent > 0

  return (
    <li>
      <Link
        href={`/devotions/${devotion.id}`}
        className="relative flex flex-col rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-text-secondary">
              {devotion.order_in_sphere} · {devotion.scripture_reference}
            </span>
            <span className="mt-1 block font-heading text-lg font-semibold text-text-primary">
              {devotion.title}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {completed && (
              <span
                className="devotion-complete-icon flex h-9 w-9 items-center justify-center rounded-full bg-green-500/20 text-green-700"
                title="Video watched"
                aria-label="Video watched"
              >
                <CheckIcon className="h-4 w-4" />
              </span>
            )}
            {responsesCompleted && (
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-education/20 text-education"
                title="Reflections completed"
                aria-label="Reflections completed"
              >
                <PenCheckIcon className="h-4 w-4" />
              </span>
            )}
            {showPercent && (
              <span
                className="flex items-center rounded-full bg-black/10 px-2.5 py-1 text-sm font-semibold text-text-primary"
                title={`${percent}% watched`}
              >
                {percent}%
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  )
}
