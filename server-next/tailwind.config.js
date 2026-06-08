/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        afro: {
          dark: '#13091B',
          card: '#1F0E31',
          orange: '#FF5E00',
          pink: '#E60067',
          gold: '#FFAA00',
          border: '#2D1845',
        }
      }
    },
  },
  plugins: [],
}
