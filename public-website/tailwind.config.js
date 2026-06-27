/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#FAF9F6',
        'brand-dark': '#0D1512',
        'brand-gold': '#D4B996',
      }
    },
  },
  plugins: [],
}