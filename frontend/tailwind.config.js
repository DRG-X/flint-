/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      colors: {
        flint: {
          bg:       '#06080d',
          surface:  '#0c1019',
          surface2: '#111827',
          border:   '#1a2035',
          border2:  '#243049',
          text:     '#e8ecf4',
          dim:      '#8892a8',
          faint:    '#556078',
          cyan:     '#22d3ee',
          blue:     '#3b82f6',
          purple:   '#a78bfa',
          green:    '#34d399',
          orange:   '#f97316',
          red:      '#f87171',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease both',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.4,0,0.2,1) both',
        'slide-in-r': 'slideInR 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'pulse-glow': 'pulseGlow 2s ease infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInR: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34,211,238,0.15)' },
          '50%':      { boxShadow: '0 0 0 16px rgba(34,211,238,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
