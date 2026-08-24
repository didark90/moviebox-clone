/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
    },
  },
  safelist: [
    {
      pattern: /(bg|text)-(blue|green|purple|orange|yellow|gold)-(100|400|600|900)/,
      variants: ['dark'],
    },
    {
      pattern: /bg-(blue|green|purple|orange|yellow|gold)-900\/30/,
    },
  ],
  plugins: [],
}
