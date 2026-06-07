/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#17212b',
        mist: '#f5f7fb',
        ocean: '#0f6b7a',
        coral: '#e0695f',
        amber: '#d99b37',
        leaf: '#3f8f65'
      },
      boxShadow: {
        soft: '0 18px 55px rgba(23, 33, 43, 0.10)'
      }
    }
  },
  plugins: []
};
