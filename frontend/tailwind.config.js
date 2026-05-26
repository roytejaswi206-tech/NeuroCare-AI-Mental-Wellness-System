/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Modern wellness palette - violet/indigo family.
        // Calm enough for the subject matter, modern enough to feel current.
        primary: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6C63FF",   // primary
          600: "#7F5AF0",   // hover / strong
          700: "#4F46E5",
          800: "#4338ca",
          900: "#3730a3",
        },
        accent: {
          violet: "#8B5CF6",
          soft:   "#EEF2FF",
        },
        teal: {
          soft: "#e6f4f1",
          mid: "#7fb8ad",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Softer, lifted card shadow without going overboard.
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 4px 8px rgba(15, 23, 42, 0.06), 0 12px 32px rgba(108, 99, 255, 0.10)",
      },
    },
  },
  plugins: [],
};
