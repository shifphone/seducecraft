/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0a0a0a',
          800: '#141414',
          700: '#1f1f1f',
        },
        accent: {
          DEFAULT: '#8B3A3A',
          hover: '#A04545',
        }
      }
    },
  },
  plugins: [],
}
