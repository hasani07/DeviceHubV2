import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
      keyframes: {
        blobFloat: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -50px) scale(1.08)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.94)' },
        },
      },
      animation: {
        blob: 'blobFloat 22s ease-in-out infinite',
        'blob-slow': 'blobFloat 30s ease-in-out infinite reverse',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
