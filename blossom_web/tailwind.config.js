/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft Pink Palette
        'pink-soft': {
          50: '#F5E6E8',
          100: '#E8B4B8',
          200: '#D4A5A9',
          300: '#C8969A',
        },
        // Muted Blue Palette
        'blue-muted': {
          50: '#B8C5D6',
          100: '#8FA3BF',
          200: '#7A8FA8',
          300: '#6B7D95',
        },
        // Gentle Purple Palette
        'purple-gentle': {
          50: '#D4C8E0',
          100: '#B8A9C9',
          200: '#A89BB8',
          300: '#988BA7',
        },
        // Dark Base Colors
        'dark': {
          base: '#0F1419',
          card: '#1A1A2E',
          elevated: '#16213E',
          surface: '#2D2D44',
          border: '#3A3A5C',
        },
        // Text Colors
        'text': {
          primary: '#FFFFFF',
          secondary: '#E5E5E5',
          muted: '#B0B0B0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

