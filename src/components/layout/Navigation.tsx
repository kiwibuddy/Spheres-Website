'use client'

import Link from 'next/link'
import { useState } from 'react'

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

const navLinks = [
  { href: '/about', label: 'About the Spheres' },
  { href: '/#spheres', label: 'Explore' },
  { href: '/dashboard', label: 'Progress' },
  { href: '/#achievements', label: 'Community' },
]

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-[1000] border-b border-white/20 bg-[rgba(250,250,249,0.72)] shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-[20px]"
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 sm:px-8">
        <Link
          href="/"
          className="font-heading text-2xl font-bold tracking-tight text-text-primary"
        >
          <span className="bg-gradient-to-br from-education via-family to-religion bg-clip-text text-transparent">
            Sphere Devotions
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-text-primary transition-colors hover:text-text-secondary after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-family after:transition-[width] after:duration-300 hover:after:w-full"
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

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/20 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/signup"
              className="rounded-xl bg-text-primary px-6 py-3 text-center font-semibold text-cream"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
