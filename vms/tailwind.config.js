/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Gatehouse palette — deep checkpoint navy, brass access accent,
        // warm paper background, muted denial red.
        checkpoint: {
          950: '#0B1420',
          900: '#0F1B2D',
          800: '#16273F',
          700: '#203552',
          600: '#33507A',
        },
        brass: {
          400: '#D9B45C',
          500: '#C89B3C',
          600: '#A97F2A',
        },
        denial: {
          500: '#B3432B',
          600: '#963823',
        },
        paper: '#F7F5F1',
        ink: '#1B1B18',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'badge-perf':
          'radial-gradient(circle, rgba(255,255,255,0.55) 2px, transparent 2px)',
      },
    },
  },
  plugins: [],
}
