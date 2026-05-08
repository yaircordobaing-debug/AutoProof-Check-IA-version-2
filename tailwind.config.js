/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jungle: '#1F6F5F',
        muted: '#2FA084',
        frozen: '#6FCF97',
        azure: '#EEEEEE',
        mint: '#FFFFFF',
        alert: '#e63946',
        warning: '#fbc02d'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
