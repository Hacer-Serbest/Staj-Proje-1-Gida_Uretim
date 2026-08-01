/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#bbcbe0',
          'bg-light': '#d3ddec',
          accent: '#c79abd',
          'accent-dark': '#b17ea3',
          'accent-light': '#dcb8d3',
          primary: '#08597c',
          'primary-dark': '#053f59',
          'primary-light': '#0d7aa3',
        },
      },
    },
  },
  plugins: [],
};
