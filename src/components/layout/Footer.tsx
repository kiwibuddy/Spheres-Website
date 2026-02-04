import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/20 bg-white/50 py-8 backdrop-blur-[20px]">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} Sphere Devotions. 416 devotions · 8 spheres.
          </p>
          <div className="flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-text-primary hover:text-text-secondary">
              Dashboard
            </Link>
            <Link href="/#spheres" className="text-sm font-medium text-text-primary hover:text-text-secondary">
              Explore Spheres
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
