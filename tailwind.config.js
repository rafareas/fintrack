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
        background: 'var(--background)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        neon: {
          green: 'rgba(var(--neon-green), <alpha-value>)',
          pink: 'rgba(var(--neon-pink), <alpha-value>)',
          blue: 'rgba(var(--neon-blue), <alpha-value>)'
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
