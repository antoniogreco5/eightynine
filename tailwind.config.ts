import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#bcdbff",
          300: "#8ec5ff",
          400: "#4f8fff",
          500: "#3170ff",
          600: "#1a4ff5",
          700: "#133ce0",
          800: "#1632b6",
          900: "#182f8f",
        },
        surface: {
          0: "#06080d",
          50: "#0a0e17",
          100: "#0c1019",
          200: "#131a27",
          300: "#1a2235",
          400: "#1e2a3e",
          500: "#273550",
          600: "#4e5d73",
          700: "#8b99ad",
          800: "#c1cbd8",
          900: "#f0f4f8",
        },
        up: { DEFAULT: "#34d399", dim: "rgba(52,211,153,0.1)", mid: "rgba(52,211,153,0.2)" },
        down: { DEFAULT: "#f87171", dim: "rgba(248,113,113,0.1)", mid: "rgba(248,113,113,0.2)" },
        warn: { DEFAULT: "#fbbf24", dim: "rgba(251,191,36,0.1)", mid: "rgba(251,191,36,0.2)" },
        info: { DEFAULT: "#4f8fff", dim: "rgba(79,143,255,0.08)", mid: "rgba(79,143,255,0.15)" },
        cyan: { DEFAULT: "#0dd4ce", dim: "rgba(13,212,206,0.1)" },
      },
      fontFamily: {
        display: ['"Outfit"', "system-ui", "sans-serif"],
        body: ['"Outfit"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        glow: "0 0 24px rgba(79,143,255,0.08)",
        "glow-up": "0 0 24px rgba(52,211,153,0.08)",
        "glow-down": "0 0 24px rgba(248,113,113,0.08)",
        card: "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,42,62,0.5)",
        elevated: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(30,42,62,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "pulse-soft": "pulseSoft 2.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
      },
    },
  },
  plugins: [],
};

export default config;
