/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FBF8F3',
        mist: '#F3EDE4',
        ink: '#171310',
        slate: '#6D6357',
        line: '#E6DDD1',
        gold: '#9A7445',
        accentDark: '#7C5930',
        sand: '#EFE5D9',
        stone: '#C9B7A0',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        hush: '0 1px 2px rgba(28, 21, 14, 0.05)',
        velvet: '0 12px 30px rgba(46, 31, 9, 0.08)',
        float: '0 18px 40px rgba(46, 31, 9, 0.12)',
      },
    },
  },
  plugins: [],
};
