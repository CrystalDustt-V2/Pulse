/** @type {import('tailwindcss').Config} */
export default {
  content: ['./pages/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0b0c',
        surface: '#0f0f10',
        muted: '#9aa0a6'
      }
    }
  },
  plugins: []
}
