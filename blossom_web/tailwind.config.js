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
          50: 'var(--pink-soft-light)',
          100: 'var(--pink-soft)',
          200: 'var(--pink-soft-light)',
          300: 'var(--pink-bright)',
        },
        // Muted Blue Palette
        'blue-muted': {
          50: 'var(--blue-muted-light)',
          100: 'var(--blue-muted)',
          200: 'var(--blue-muted-light)',
          300: 'var(--blue-muted)',
        },
        // Gentle Purple Palette
        'purple-gentle': {
          50: 'var(--purple-gentle-light)',
          100: 'var(--purple-gentle)',
          200: 'var(--purple-gentle-light)',
          300: 'var(--purple-vivid)',
        },
        // Base Theme Colors
        'dark': {
          base: 'var(--background)',
          card: 'var(--card-bg)',
          elevated: 'var(--elevated-bg)',
          surface: 'var(--surface-bg)',
          border: 'var(--border-color)',
        },
        // Text Colors
        'text': {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


