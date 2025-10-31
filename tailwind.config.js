/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#b3d7ff',
          DEFAULT: '#0056b3',
          dark: '#003f80',
        },
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        gray: { // This will override default Tailwind grays, ensure this is desired or merge carefully
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1d20',
        },
      },
    },
  },
  plugins: [],
}
