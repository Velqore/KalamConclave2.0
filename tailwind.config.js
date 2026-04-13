/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0A0F1E',
        navyLight: '#111a2f',
        electricBlue: '#2563EB',
        gold: '#F59E0B',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
