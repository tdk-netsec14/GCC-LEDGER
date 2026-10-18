/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        grade: {
          a: {
            bg: "#ecfdf5",
            text: "#065f46",
            border: "#10b981",
            darkBg: "#064e3b",
            darkText: "#6ee7b7",
          },
          b: {
            bg: "#eff6ff",
            text: "#1e40af",
            border: "#3b82f6",
            darkBg: "#1e3a8a",
            darkText: "#93c5fd",
          },
          c: {
            bg: "#fffbeb",
            text: "#92400e",
            border: "#f59e0b",
            darkBg: "#78350f",
            darkText: "#fcd34d",
          },
          d: {
            bg: "#f8fafc",
            text: "#475569",
            border: "#94a3b8",
            darkBg: "#334155",
            darkText: "#cbd5e1",
          },
        },
      },
    },
  },
  plugins: [],
}
