/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#00ff88',
          pink: '#ff007f',
          blue: '#00e5ff'
        },
        dark: {
          900: '#0a0a0a',
          800: '#121212',
          700: '#1a1a1a',
          glass: 'rgba(255, 255, 255, 0.03)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
