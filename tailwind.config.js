/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/*.{js,ts,jsx,tsx}", // או ./src/data/*.{js,ts,jsx,tsx} אם הוא ב-src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
