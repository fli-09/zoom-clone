import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: "#0E71EB",
          hover: "#2680EB",
          light: "#3B82F6",
          dark: "#0B56B3",
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#0E71EB",
          600: "#0B56B3",
        },
        dark: {
          bg: "#0B0D10",
          surface: "#111418",
          card: "#161B22",
          border: "#21262D",
          hover: "#1C2128",
          muted: "#8B949E",
        },
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(14, 113, 235, 0.35)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.4)",
        dropdown: "0 10px 30px -5px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
