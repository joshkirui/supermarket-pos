/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#166534',
          800: '#14532d',
          900: '#0a1f0d',
        },
        pos: {
          bg: '#f8fafc',
          card: '#ffffff',
          surface: '#f1f5f9',
          border: '#e2e8f0',
          hover: '#f1f5f9',
          text: '#0f172a',
          muted: '#64748b',
          success: '#16a34a',
          warning: '#f59e0b',
          danger: '#ef4444',
          sidebar: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
