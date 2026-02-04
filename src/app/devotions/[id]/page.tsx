import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DevotionPlayerWithProgress } from '@/components/features/DevotionPlayerWithProgress'
import { ReflectionResponses } from '@/components/features/ReflectionResponses'
import { getDevotionById, getSphereBySlug } from '@/lib/devotions-data'
import { getScriptureText } from '@/lib/scripture'

interface PageProps {
  params: { id: string }
}

export default async function DevotionPage({ params }: PageProps) {
  const id = parseInt(params.id, 10)
  if (Number.isNaN(id)) notFound()

  const devotion = getDevotionById(id)
  if (!devotion) notFound()

  const sphere = getSphereBySlug(devotion.slug)
  const scripture = await getScriptureText(devotion.scripture_reference)

  return (
    <div className="min-h-screen px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-[900px]">
        <Link
          href={`/spheres/${devotion.slug}`}
          className="mb-6 inline-block text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          ← Back to {sphere?.name ?? devotion.slug}
        </Link>

        <div className="mb-6">
          <span
            className="inline-block rounded-lg px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: sphere?.color_primary ?? '#323b43' }}
          >
            {sphere?.name}
          </span>
          <span className="ml-2 text-sm text-text-secondary">{devotion.code}</span>
        </div>

        <h1 className="font-heading text-3xl font-bold text-text-primary">{devotion.title}</h1>
        <p className="mt-2 text-lg text-text-secondary">{devotion.scripture_reference}</p>

        {scripture ? (
          <blockquote
            className="mt-6 rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass"
            cite={`https://worldenglish.bible/#${scripture.reference.replace(/\s/g, '_')}`}
          >
            <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-text-primary">
              {scripture.text}
            </p>
            <footer className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
              <cite className="not-italic font-medium">{scripture.reference}</cite>
              <span aria-hidden="true">·</span>
              <span>
                {scripture.translation_name} ({scripture.translation_note})
              </span>
            </footer>
          </blockquote>
        ) : null}

        <div className="mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-black">
          <div className="h-full w-full">
            <DevotionPlayerWithProgress
              youtubeUrl={devotion.youtube_url}
              devotionId={devotion.id}
            />
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-white/20 bg-white/70 p-8" aria-labelledby="reflection-heading">
          <h2 id="reflection-heading" className="font-heading text-xl font-bold text-text-primary">
            Reflection questions
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Use these questions to reflect after watching the video.
          </p>
          {[devotion.reflection_q1, devotion.reflection_q2, devotion.reflection_q3, devotion.reflection_q4].some(Boolean) ? (
            <>
              <ul className="mt-4 space-y-3 list-decimal list-inside">
                {[devotion.reflection_q1, devotion.reflection_q2, devotion.reflection_q3, devotion.reflection_q4]
                  .filter((q): q is string => Boolean(q))
                  .map((q, i) => (
                    <li key={i} className="text-text-primary">
                      {q}
                    </li>
                  ))}
              </ul>
              <ReflectionResponses
                devotionId={devotion.id}
                questions={[
                  devotion.reflection_q1 && { key: 'q1' as const, text: devotion.reflection_q1 },
                  devotion.reflection_q2 && { key: 'q2' as const, text: devotion.reflection_q2 },
                  devotion.reflection_q3 && { key: 'q3' as const, text: devotion.reflection_q3 },
                  devotion.reflection_q4 && { key: 'q4' as const, text: devotion.reflection_q4 },
                ].filter((q): q is { key: 'q1' | 'q2' | 'q3' | 'q4'; text: string } => Boolean(q))}
              />
            </>
          ) : (
            <p className="mt-4 text-text-secondary italic">No reflection questions for this passage.</p>
          )}
          {devotion.call_to_action ? (
            <p className="mt-6 font-medium text-text-primary">{devotion.call_to_action}</p>
          ) : null}
        </section>
      </div>
    </div>
  )
}
