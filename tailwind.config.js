/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C8102E',
          50:  '#FFF0F2',
          100: '#FFD6DC',
          200: '#FFB3BC',
          300: '#FF8090',
          400: '#F04060',
          500: '#C8102E',
          600: '#A00020',
          700: '#780015',
          800: '#50000D',
          900: '#280006',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
