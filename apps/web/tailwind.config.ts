import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F3F4F6',
          border: '#D1D5DB',
          dark: '#141414',
          'dark-secondary': '#1C1C1C',
          'dark-border': '#2A2A2A',
        },
        page: {
          light: '#F3F4F6',
          dark: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'tool-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'tool-card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
