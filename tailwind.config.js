/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1e40af',
          600: '#1d4ed8',
          700: '#1e3a8a',
        },
        secondary: '#64748b',
        accent: '#0ea5e9',
        surface: '#ffffff',
background: '#f8fafc',
        success: {
          DEFAULT: '#10b981',
          600: '#059669',
        },
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'lg': '8px',
        'md': '6px',
      }
    },
  },
  plugins: [],
}