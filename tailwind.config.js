import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontWeight: {
        // Override default font weights to only use available ones
        light: '500',      // Fallback to Medium
        normal: '500',     // Fallback to Medium
        medium: '500',     // Available
        semibold: '600',   // Available
        bold: '600',       // Fallback to Semibold
        extrabold: '600',  // Fallback to Semibold
        black: '600',      // Fallback to Semibold
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;