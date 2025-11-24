/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#05060A",
        accent: {
          primary: "#7BFF5A",
          secondary: "#00FFB3",
          gold: "#FFD047",
        },
      },
    },
  },
  plugins: [],
};
