/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#05080F',
        navyLight: '#0B1220',
        navyMid: '#101D35',
        electricBlue: '#3B82F6',
        gold: '#F59E0B',
        crimson: '#9B1C1C',
        warRed: '#DC2626',
        ember: '#D97706',
        radarGreen: '#166534',
        smoke: '#374151',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.4)',
        war: '0 0 40px rgba(155,28,28,0.25)',
        science: '0 0 40px rgba(59,130,246,0.2)',
        gold: '0 0 30px rgba(245,158,11,0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      keyframes: {
        warGlow: {
          '0%, 100%': { textShadow: '0 0 15px rgba(220,38,38,0.4), 0 0 30px rgba(220,38,38,0.15)' },
          '50%': { textShadow: '0 0 25px rgba(220,38,38,0.7), 0 0 50px rgba(220,38,38,0.3)' },
        },
        borderPulse: {
          '0%, 100%': { borderColor: 'rgba(155,28,28,0.4)' },
          '50%': { borderColor: 'rgba(220,38,38,0.8)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(245,158,11,0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'war-glow': 'warGlow 3s ease-in-out infinite',
        'border-pulse': 'borderPulse 2.5s ease-in-out infinite',
        'scan-line': 'scanLine 6s linear infinite',
        shimmer: 'shimmer 4s linear infinite',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
