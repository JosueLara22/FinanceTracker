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
          DEFAULT: '#667eea',
          dark: '#764ba2',
        },
        success: '#4CAF50',
        warning: '#FFC107',
        danger: '#F44336',
        info: '#2196F3',
        dark: {
          background: '#1a202c',
          text: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
}
