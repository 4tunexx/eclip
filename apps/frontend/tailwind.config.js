/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neonLime: { DEFAULT: "#C6FF32", 600: "#B7FF18" },
        electricGreen: { DEFAULT: "#7FFF00", 600: "#75E000" },
        deepTechGreen: { DEFAULT: "#2B4F2A", 700: "#1E3F1E" },
        darkCyberGrey: { DEFAULT: "#0E141B", 700: "#101820" },
        circuitBlue: { DEFAULT: "#0A4769", 700: "#06344E" }
      }
    }
  },
  plugins: []
}