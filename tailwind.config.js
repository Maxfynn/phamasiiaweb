/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}', // Include all HTML, JS, JSX, TS, and TSX files in the src folder
    './public/index.html', // Include the main HTML file in the public folder
    './pages/**/*.{html,js,jsx,ts,tsx}', // Include all files in the pages folder
    './components/**/*.{js,ts,jsx,tsx}',   // components folder outside pages
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
