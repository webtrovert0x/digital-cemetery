import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cemetery: {
          void: "#07080d",
          charcoal: "#0f111a",
          slate: "#161926",
          stone: "#232738",
          border: "#2e344b",
          mist: "#9aa4c2",
          moonlight: "#7dd3fc",
          violet: "#a855f7",
          moss: "#4ade80",
          lichen: "#6ea88b",
        },
      },
      fontFamily: {
        display: ['"Cinzel"', "Palatino Linotype", "Book Antiqua", "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(-3%, 0, 0)", opacity: "0.35" },
          "50%": { transform: "translate3d(3%, -1%, 0)", opacity: "0.55" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        wisp: {
          "0%, 100%": { transform: "translateY(0px) scale(1)", opacity: "0.25" },
          "50%": { transform: "translateY(-18px) scale(1.25)", opacity: "0.75" },
        },
      },
      animation: {
        drift: "drift 16s ease-in-out infinite",
        "drift-reverse": "drift 22s ease-in-out infinite reverse",
        "float-slow": "floatSlow 6s ease-in-out infinite",
        wisp: "wisp 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

