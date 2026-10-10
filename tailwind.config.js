/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: '#1A365D',
        brandOrange: '#ED8936',
        bgLight: '#F5F7FA',
        darkPanel: '#1E293B',
      }
    },
  },
  plugins: [],
}