/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          border: '#2a2a2a',
          text: '#e0e0e0',
          muted: '#888888',
        },
        accent: {
          blue: '#4a9eff',
          green: '#4ade80',
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
