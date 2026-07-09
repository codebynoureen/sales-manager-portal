import type { Config } from "tailwindcss";

// Tokens sourced 1:1 from distributeos-sales-manager-panel-v1.html :root
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F0F4FA",
        surface: "#FFFFFF",
        surface2: "#F6F8FD",
        surface3: "#EDF1F9",
        border: {
          DEFAULT: "#DDE4F0",
          strong: "#B8C4DA",
        },
        primary: {
          DEFAULT: "#1558D6",
          hover: "#1147B8",
          subtle: "#EBF0FD",
        },
        secondary: {
          DEFAULT: "#0D1F3C",
          mid: "#162A50",
          text: "#A8BEDD",
        },
        dist: { DEFAULT: "#0891B2", subtle: "#E0F5FA" },
        success: { DEFAULT: "#0B7A4A", subtle: "#E6F5EE" },
        warning: { DEFAULT: "#C96B0A", subtle: "#FDF3E7" },
        danger: { DEFAULT: "#C0392B", subtle: "#FDECEB" },
        info: { DEFAULT: "#2563EB", subtle: "#EBF1FD" },
        gold: { DEFAULT: "#D4820A", subtle: "#FEF3DC" },
        text: {
          DEFAULT: "#0F172A",
          dim: "#334155",
          muted: "#64748B",
          inverse: "#FFFFFF",
          sidebar: "#CBD8EC",
        },
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        xs: "10px",
        sm: "12px",
        base: "14px",
        md: "15px",
        lg: "16px",
        xl: "18px",
        "2xl": "22px",
        hero: "32px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      spacing: {
        13: "52px",
        18: "72px",
        28: "112px", // topbar(64) + pulse-strip(48)
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;