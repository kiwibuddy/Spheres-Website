'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getSphereBySlug } from '@/lib/constants'

export interface SearchResult {
  id: number
  slug: string
  title: string
  scripture_reference: string
  code: string
  sphere_name: string
  similarity?: number
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <p className="mt-8 text-center text-text-secondary">
        No key passages found for &quot;{query}&quot;. Try a different topic.
      </p>
    )
  }

  return (
    <ul className="mt-6 flex flex-col gap-0.5">
      {results.map((r) => {
        const sphere = getSphereBySlug(r.slug)
        return (
          <li key={r.id}>
            <Link
              href={`/devotions/${r.id}`}
              className="group flex items-center gap-3 py-3 text-inherit no-underline transition hover:opacity-80"
            >
              {sphere && (
                <span className="relative h-6 w-6 shrink-0" aria-hidden>
                  <Image
                    src={`/sphere-icons/${sphere.icon}`}
                    alt=""
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </span>
              )}
              <h3 className="min-w-0 flex-1 font-heading text-sm font-medium text-text-primary">
                {r.title}
              </h3>
              <span className="shrink-0 text-gray-300 transition group-hover:text-gray-500" aria-hidden>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
