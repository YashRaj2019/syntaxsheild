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
          950: '#0A0A0A',
          900: '#121212',
          800: '#1A1A1A',
          700: '#2A2A2A',
          600: '#3A3A3A',
        },
        primary: {
          500: '#6366f1',
          400: '#818cf8',
        },
        accent: {
          500: '#14b8a6',
          400: '#2dd4bf',
        }
      }
    },
  },
  plugins: [],
}
