'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useCallback, useRef, useMemo } from 'react'
import { SPHERES, getSphereBySlug } from '@/lib/constants'
import type { SearchResult } from './SearchResults'

const INITIAL_SHOW = 5

/** Sort by sphere (best-matching spheres first), then by similarity within sphere. */
function sortResults(results: SearchResult[]): SearchResult[] {
  const bySphere = new Map<string, SearchResult[]>()
  for (const r of results) {
    const slug = r.slug
    if (!bySphere.has(slug)) bySphere.set(slug, [])
    bySphere.get(slug)!.push(r)
  }
  Array.from(bySphere.values()).forEach((arr) => {
    arr.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
  })
  const sphereOrder = SPHERES.map((s) => s.slug)
  const sorted: SearchResult[] = []
  const spheresWithResults = sphereOrder.filter((slug) => bySphere.has(slug))
  spheresWithResults.sort((a, b) => {
    const maxA = Math.max(...(bySphere.get(a) ?? []).map((r) => r.similarity ?? 0))
    const maxB = Math.max(...(bySphere.get(b) ?? []).map((r) => r.similarity ?? 0))
    return maxB - maxA
  })
  for (const slug of spheresWithResults) {
    sorted.push(...(bySphere.get(slug) ?? []))
  }
  return sorted
}

function useDebounce<T>(fn: (v: T) => void, ms: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(
    (value: T) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        fn(value)
        timeoutRef.current = null
      }, ms)
    },
    [fn, ms]
  )
}

interface SearchSectionProps {
  isLoggedIn: boolean
}

export function SearchSection({ isLoggedIn }: SearchSectionProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const sortedResults = useMemo(() => sortResults(results), [results])
  const visibleResults = expanded ? sortedResults : sortedResults.slice(0, INITIAL_SHOW)
  const hasMore = sortedResults.length > INITIAL_SHOW

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setResults([])
      setSearched(false)
      return
    }
    if (!isLoggedIn) return
    setLoading(true)
    setSearched(true)
    setExpanded(false)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Search failed')
      setResults(data.results ?? [])
    } catch (e) {
      console.error('Search error:', e)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  const debouncedSearch = useDebounce(doSearch, 300)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    debouncedSearch(v)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) return
    doSearch(query)
  }

  const handleFocus = () => {
    if (!isLoggedIn) setSearched(true)
  }

  return (
    <section className="relative z-10 mx-auto max-w-[1400px] -mt-12 px-6 pb-12 sm:px-8 mb-16" aria-labelledby="search-heading">
      <div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass sm:p-8">
        <h2 id="search-heading" className="font-heading text-xl font-bold text-text-primary sm:text-2xl">
          Search by topic
        </h2>
        <p className="mt-1.5 text-sm text-text-secondary">
          Find key passages that speak to topics you care about. Try concepts like &quot;God as father&quot;, &quot;marriage&quot;, &quot;justice&quot;, or &quot;stewardship&quot;.
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-3">
            <input
              type="search"
              value={query}
              onChange={handleChange}
              onFocus={handleFocus}
              placeholder="e.g. God as father, marriage, justice"
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-text-primary placeholder:text-gray-400 focus:border-education focus:outline-none focus:ring-1 focus:ring-education"
              aria-label="Search key passages by topic"
            />
            <button
              type="submit"
              disabled={loading || !isLoggedIn}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-text-primary transition hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>

        {!isLoggedIn && (searched || query.trim()) && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <p className="font-medium">Sign in to search</p>
            <p className="mt-1 text-sm">Create an account or log in to search 416 key passages by topic.</p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-text-primary px-5 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl border-2 border-text-primary px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-text-primary hover:text-cream"
              >
                Create account
              </Link>
            </div>
          </div>
        )}

        {isLoggedIn && loading && (
          <p className="mt-6 text-center text-text-secondary">Searching key passages…</p>
        )}

        {isLoggedIn && !loading && searched && (
          <div className="mt-6">
            {results.length === 0 ? (
              <p className="text-center text-text-secondary">
                No key passages found for &quot;{query.trim()}&quot;. Try a different topic.
              </p>
            ) : (
              <>
                <ul className="flex flex-col gap-0.5" data-search-results="list">
                  {visibleResults.map((r) => {
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
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="mt-3 py-2 text-sm text-gray-500 transition hover:text-text-primary"
                  >
                    Show {sortedResults.length - INITIAL_SHOW} more
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
