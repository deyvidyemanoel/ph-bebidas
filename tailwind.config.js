/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#FFE566',
          400: '#FFD700',
          500: '#D4AF37',
          600: '#B8860B',
          700: '#9B7309',
        },
        dark: {
          900: '#050505',
          800: '#0a0a0a',
          700: '#111111',
          600: '#1a1a1a',
          500: '#222222',
          400: '#2a2a2a',
          300: '#333333',
          200: '#3f3f3f',
        }
      }
    },
  },
  plugins: [],
}
