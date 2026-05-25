/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Soft, calming palette - avoid neon / corporate gradients.
        primary: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#bdd0ff",
          300: "#92b0ff",
          400: "#6688f5",
          500: "#4663dc",
          600: "#3a4fbe",
          700: "#2f4099",
        },
        teal: {
          soft: "#e6f4f1",
          mid: "#7fb8ad",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
