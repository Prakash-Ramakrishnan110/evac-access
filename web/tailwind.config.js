/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        crisis: {
          900: '#070D1E',
          800: '#0E172E',
          700: '#162447',
          600: '#1F3463',
          border: '#273E73',
          card: 'rgba(14, 23, 46, 0.85)',
          muted: '#8B9BB4'
        },
        emergency: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#FBBF24',
          feasible: '#10B981',
          unverified: '#F59E0B',
          unsuitable: '#E11D48',
          blue: '#3B82F6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
