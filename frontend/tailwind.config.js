/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1a365d',
        /* secondary aligné pour un contraste ≥ 7:1 sur blanc (WCAG AAA 1.4.6)
         * #1e4d8c sur blanc ≈ 7.1:1 vs #2b6cb0 ≈ 5.27:1 */
        secondary: '#1e4d8c',
        accent: '#ed8936',
      },
    },
  },
  plugins: [],
}
