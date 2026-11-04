import { SearchSection } from '@/components/features/SearchSection'
import { DashboardStats } from '@/components/features/DashboardStats'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafaf9] to-white/50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Your Progress
          </h1>
          <p className="mt-1.5 text-text-secondary">
            Track your journey through the 416 devotions
          </p>
        </header>

        <SearchSection placement="inset" />
        <DashboardStats />
      </div>
    </div>
  )
}
