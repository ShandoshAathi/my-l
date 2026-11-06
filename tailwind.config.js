/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#F8C8DC',
          blush: '#FFF1F7',
          lavender: '#DCCBFF',
          peach: '#FFE0CC',
          rose: '#E98AB3',
          cream: '#FFF9F3',
          purple: '#B9A4E8',
        },
      },
      fontFamily: {
        romantic: ['"Dancing Script"', 'cursive', 'sans-serif'],
        anime: ['"Quicksand"', 'sans-serif'],
        heading: ['"Playfair Display"', 'serif'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'float-fast': 'float 2.5s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-pink': '0 0 25px rgba(248, 200, 220, 0.65)',
        'glow-rose': '0 0 30px rgba(233, 138, 179, 0.55)',
        'glow-purple': '0 0 25px rgba(185, 164, 232, 0.5)',
        'glass': '0 8px 32px 0 rgba(233, 138, 179, 0.15)',
        'polaroid': '0 12px 28px rgba(233, 138, 179, 0.22), 0 2px 6px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
