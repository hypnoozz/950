/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#165DFF',
        secondary: '#00F0FF',
        // You can add more custom colors here
        'custom-bg': 'rgba(10, 20, 40, 0.8)', // Example for a slightly transparent dark background
        'custom-card': 'rgba(20, 30, 55, 0.7)',
        'custom-border': 'rgba(0, 240, 255, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px 2px rgba(22, 93, 255, 0.4)',
        'glow-secondary': '0 0 15px 2px rgba(0, 240, 255, 0.4)',
      },
      animation: {
        'border-glow': 'border-glow 1.5s infinite alternate',
        'slide-in': 'slide-in 0.5s ease-out forwards',
      },
      keyframes: {
        'border-glow': {
          '0%': { borderColor: 'rgba(22, 93, 255, 0.2)' },
          '100%': { borderColor: 'rgba(0, 240, 255, 0.7)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}; 