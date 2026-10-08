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
        brand: {
          green: "#22c55e",
          greenDark: "#16a34a",
          yellow: "#f7c948",
          bg: "#050d08",
          panel: "#0b1a11",
          panelDark: "#040a06",
          txt: "#eaf5ee",
          muted: "#8fae9e",
        },
      },
      fontFamily: {
        montserrat: ["Montserrat", "system-ui", "sans-serif"],
      },
      animation: {
        breathe: "breathe 4s ease-in-out infinite",
        voa: "voa 3.2s ease-in-out infinite",
        ctapulse: "ctapulse 2.4s ease-in-out infinite",
        ctahalo: "ctahalo 2.4s ease-out infinite",
        blink: "blink 2s ease-in-out infinite",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" },
        },
        voa: {
          "0%, 100%": { transform: "translateY(0) rotate(-1.4deg)" },
          "50%": { transform: "translateY(-11px) rotate(1.4deg)" },
        },
        ctapulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.045)", boxShadow: "0 22px 52px -12px rgba(34,197,94,0.95)" },
        },
        ctahalo: {
          "0%": { opacity: "0.75", transform: "scale(1)" },
          "70%, 100%": { opacity: "0", transform: "scale(1.22)" },
        },
        blink: {
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};
