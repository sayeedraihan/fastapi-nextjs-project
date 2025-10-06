/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryorbackground: '#191919', // '#e5ddc8',
        secondary: '#750E21', // '#01949a',
        fontcolor: '#BED754', // '#db1f48',
        clifford: "#dc2f35ff",
        yellowgreen: "#9acd32",
        bordercolor: "#E3651D", // "#004369",
        shadowcolor: "#00000080"
      }
    },
  },
  plugins: [],
}

