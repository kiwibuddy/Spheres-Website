import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { href: '/about', label: 'About the Spheres' },
  { href: '/#spheres', label: 'Explore' },
  { href: '/dashboard', label: 'Progress' },
  { href: '/#achievements', label: 'Community' },
]

/**
 * Server-rendered nav to avoid loading the client Navigation chunk
 * (which was triggering originalFactory.call in dev).
 */
export function NavigationStatic() {
  return (
    <nav
      className="fixed left-0 right-0 top-0 z-[1000] border-b border-white/20 bg-[rgba(250,250,249,0.72)] shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-[20px]"
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight text-text-primary"
        >
          <Image
            src="/logo.png"
            alt="Sphere Devotions"
            width={28}
            height={28}
            className="shrink-0"
          />
          <span className="bg-gradient-to-br from-education via-family to-religion bg-clip-text text-transparent">
            Sphere Devotions
          </span>
        </Link>

        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative hidden text-sm font-medium text-text-primary transition-colors hover:text-text-secondary after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-family after:transition-[width] after:duration-300 hover:after:w-full md:block"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/signup"
            className="rounded-xl bg-text-primary px-6 py-2.5 font-semibold text-cream shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            Get Started
          </Link>
        </div>
      </div>
      <div className="border-t border-white/20 px-6 py-4 md:hidden">
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/signup"
            className="rounded-xl bg-text-primary px-5 py-3 text-center font-semibold text-cream"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
