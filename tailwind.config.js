/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
      colors: {
        forest: { 50: '#eef6f1', 100: '#d5eadc', 200: '#abd4ba', 300: '#79b892', 400: '#4a9a6c', 500: '#2d7d51', 600: '#1f6541', 700: '#1a5236', 800: '#16422d', 900: '#123726', 950: '#0a2016' },
        saffron: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#f59e3b', 500: '#e8891c', 600: '#c96f10', 700: '#a05510' },
        cream: { 50: '#fdfcf9', 100: '#faf7f0', 200: '#f3eee2' },
      },
      boxShadow: { card: '0 1px 2px rgba(16,40,28,.04), 0 4px 16px rgba(16,40,28,.05)' },
      keyframes: { fadeUp: { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'none' } }, slideIn: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'none' } } },
      animation: { fadeUp: 'fadeUp .35s ease-out both', slideIn: 'slideIn .25s ease-out both' },
    },
  },
  plugins: [],
};
