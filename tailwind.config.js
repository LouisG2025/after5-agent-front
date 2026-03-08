/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0b0f1a',
          card: '#111827',
          sidebar: '#0f1320',
          elevated: '#1a2035',
        },
        accent: {
          DEFAULT: '#2EFFA1',
          dark: '#1acc80',
          muted: 'rgba(46,255,161,0.12)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          hover: 'rgba(46,255,161,0.3)',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
