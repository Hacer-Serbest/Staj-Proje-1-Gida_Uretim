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
          navy: '#0f2438',
          'navy-light': '#1c3a54',
          stone: '#b7ab8c',
          'stone-light': '#e8e0cc',
          'stone-dark': '#8f8267',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      // Jenerik gri değil, marka renginin tonuyla tintlenmiş "soft UI" gölge skalası —
      // kartlar sayfadan gerçekten ayrışsın diye (bkz. tasarım kararı: "belirgin gölge").
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(8,89,124,0.14), 0 1px 3px rgba(8,89,124,0.10)',
        'soft-md': '0 10px 28px -6px rgba(8,89,124,0.20), 0 3px 10px -2px rgba(8,89,124,0.12)',
        'soft-lg': '0 20px 48px -10px rgba(8,89,124,0.26), 0 6px 16px -4px rgba(8,89,124,0.14)',
        'soft-xl': '0 28px 70px -14px rgba(8,89,124,0.32), 0 10px 24px -6px rgba(8,89,124,0.16)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
        'fade-slide-up': 'fade-slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
