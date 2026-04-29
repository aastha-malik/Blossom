/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper:        'var(--paper)',
        'paper-deep': 'var(--paper-deep)',
        card:         'var(--card)',
        ink:          'var(--ink)',
        'ink-soft':   'var(--ink-soft)',
        muted:        'var(--muted)',
        accent:       'var(--accent)',
        'accent-2':   'var(--accent-2)',
        'accent-3':   'var(--accent-3)',
        amber:        'var(--amber)',
        rule:         'var(--rule)',
        'rule-soft':  'var(--rule-soft)',
        hi:           'var(--hi)',
      },
      fontFamily: {
        serif: ['Fraunces', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
