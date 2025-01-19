/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./docs/**/*.{html,js}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient 3s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}