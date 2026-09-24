/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9ddfd',
          300: '#7cc2fb',
          400: '#36a3f7',
          500: '#0c87eb',
          600: '#006ac9',
          700: '#0155a3',
          800: '#064886',
          900: '#0b3d6f',
          950: '#07274a',
        },
        slate: {
          850: '#131c31',
          900: '#0f172a',
          950: '#090d16'
        }
      },
      fontFamily: {
        sans: ["'Gotham'", "'Gotham Medium'", 'Montserrat', "'Plus Jakarta Sans'", 'system-ui', '-apple-system', 'sans-serif'],
        display: ["'Gotham Bold'", "'Gotham'", 'Montserrat', "'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
