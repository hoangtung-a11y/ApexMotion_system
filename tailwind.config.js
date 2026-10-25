/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apex: {
          dark: '#0f172a',
          navy: '#111827',
          blue: '#2563eb',
          accent: '#f97316',
        }
      }
    },
  },
  plugins: [],
}
