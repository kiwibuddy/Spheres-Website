import type { Metadata } from 'next'
import { Space_Grotesk, Bricolage_Grotesque } from 'next/font/google'
import '@/styles/globals.css'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sphere Devotions – Transform Your Worldview',
  description: '416 biblical devotions across 8 spheres of influence. 52 devotions per sphere – one for every week of the year.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${bricolageGrotesque.variable}`}>
      <body className="font-sans">
        <a
          href="#main-content"
          className="absolute left-[-9999px] w-px h-px overflow-hidden focus:left-4 focus:top-4 focus:z-[1001] focus:w-auto focus:h-auto focus:px-4 focus:py-2 focus:rounded focus:bg-text-primary focus:text-cream focus:overflow-visible"
        >
          Skip to main content
        </a>
        <Navigation />
        <main id="main-content" className="min-h-screen" role="main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
