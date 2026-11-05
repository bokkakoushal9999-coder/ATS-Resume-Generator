/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        calibri: ['Calibri', 'Candara', 'Segoe', 'Segoe UI', 'Optima', 'Arial', 'sans-serif'],
        arial: ['Arial', 'Helvetica', 'sans-serif'],
        times: ['"Times New Roman"', 'Times', 'serif'],
        georgia: ['Georgia', 'serif'],
        garamond: ['Garamond', 'Baskerville', 'serif'],
      },
      screens: {
        'print': {'raw': 'print'},
      }
    },
  },
  plugins: [],
}

