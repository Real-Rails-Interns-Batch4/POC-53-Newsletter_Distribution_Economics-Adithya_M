import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#030712",
        surface: "#0B1117",
        cyan: {
          accent: "#38BDF8",
        },
        indigo: {
          accent: "#818CF8",
        },
        border: {
          rail: "#1F2937",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tight: "-0.02em",
      },
      boxShadow: {
        "cyan-glow": "0 0 0 0.5px rgba(56, 189, 248, 0.4), 0 0 12px rgba(56, 189, 248, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
