import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        foundational: 'var(--foundational)',
        family: 'var(--family)',
        economics: 'var(--economics)',
        government: 'var(--government)',
        religion: 'var(--religion)',
        education: 'var(--education)',
        media: 'var(--media)',
        celebration: 'var(--celebration)',
      },
      fontFamily: {
        sans: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'glass-sm': '12px',
        'glass-md': '18px',
        'glass-lg': '24px',
        'glass-xl': '28px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-hover': '0 20px 50px rgba(31, 38, 135, 0.2)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'shimmer-bar': 'shimmerBar 2s infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmerBar: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}
export default config
