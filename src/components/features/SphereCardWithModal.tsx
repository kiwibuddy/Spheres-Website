'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { SphereConfig } from '@/lib/constants'
import { SPHERE_INTROS } from '@/lib/constants'

export interface SphereCardWithModalProps {
  sphere: SphereConfig
  completed: number
  progressPct: number
  gridClass: string
}

export function SphereCardWithModal({ sphere, completed, progressPct, gridClass }: SphereCardWithModalProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const intro = SPHERE_INTROS[sphere.slug]
  const short = intro?.short ?? sphere.description
  const full = intro?.full ?? short

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`group flex flex-col justify-between rounded-[28px] border border-white/20 bg-white/70 p-8 text-left shadow-glass transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_30px_60px_rgba(31,38,135,0.25)] ${gridClass}`}
      >
        <div>
          <div
            className="mb-4 flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl"
            style={{ backgroundColor: `${sphere.color_primary}15` }}
          >
            <img
              src={`/sphere-icons/${sphere.icon}`}
              alt=""
              width={72}
              height={72}
              className="h-full w-full object-contain"
            />
          </div>
          <h3 className="font-heading text-2xl font-bold text-text-primary">{sphere.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{short}</p>
        </div>
        <div>
          <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: sphere.color_primary }}
            />
          </div>
          <p className="text-sm font-semibold text-text-primary">
            {completed} of 52 completed
          </p>
        </div>
      </button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sphere-modal-title"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/20 bg-white p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${sphere.color_primary}20` }}
              >
                <img src={`/sphere-icons/${sphere.icon}`} alt="" width={48} height={48} className="object-contain" />
              </div>
              <h2 id="sphere-modal-title" className="font-heading text-2xl font-bold text-text-primary">
                {sphere.name}
              </h2>
            </div>
            <p className="whitespace-pre-wrap text-text-primary leading-relaxed">{full}</p>
            <div className="mt-8 flex gap-3">
              <Link
                href={`/spheres/${sphere.slug}`}
                className="rounded-xl bg-text-primary px-5 py-2.5 font-semibold text-cream transition hover:opacity-90"
              >
                Explore {sphere.name}
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-text-primary/30 px-5 py-2.5 font-semibold text-text-primary transition hover:bg-white/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
