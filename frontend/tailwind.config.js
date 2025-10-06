// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        sleep: {
          100: '#EAFBFE',
          200: '#CDEFFB',
          300: '#A5EAF9',
          400: '#6BDDF6',
          500: '#4ED7F1',
          600: '#3C5F92',
          700: '#304A74',
          800: '#243D63',
          900: '#1A2D50',
        },
        accent: {
          purple: '#879CD4',
        },
      },
    },
  },
  plugins: [],
}

