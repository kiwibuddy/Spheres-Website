import Link from 'next/link'
import { TOTAL_DEVOTIONS } from '@/lib/constants'
import { SearchSection } from '@/components/features/SearchSection'
import { HomeCatalog } from '@/components/features/HomeCatalog'

export default function HomePage() {
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
              World-View
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[900px] text-[clamp(1.1rem,2vw,1.4rem)] leading-relaxed text-text-secondary">
            Discover a fresh way of seeing God&apos;s Word — one that changes how you see God&apos;s world — and find your role as a catalyst for change in your sphere of influence.
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

      {/* Search by topic */}
      <SearchSection />
      <HomeCatalog />
    </div>
  )
}
