import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#FF2B79",
        surface: "#131315",
        "surface-dim": "#131315",
        "surface-bright": "#39393b",
        "surface-container-lowest": "#0e0e10",
        "surface-container-low": "#1b1b1d",
        "surface-container": "#201f21",
        "surface-container-high": "#2a2a2c",
        "surface-container-highest": "#353437",
        "on-surface": "#e5e1e4",
        "on-surface-variant": "#e4bdc3",
        "inverse-surface": "#e5e1e4",
        "inverse-on-surface": "#303032",
        outline: "#ab888e",
        "outline-variant": "#5b3f45",
        "surface-tint": "#ffb1c1",
        primary: "#ffb1c1",
        "on-primary": "#66002a",
        "primary-container": "#ff4c84",
        "on-primary-container": "#5a0024",
        "inverse-primary": "#bc0053",
        secondary: "#c6c6c7",
        "on-secondary": "#2f3131",
        "secondary-container": "#454747",
        "on-secondary-container": "#b4b5b5",
        tertiary: "#c8c5cb",
        "on-tertiary": "#303034",
        "tertiary-container": "#919095",
        "on-tertiary-container": "#29292d",
        error: "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        background: "#131315",
        "on-background": "#e5e1e4",
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      spacing: {
        base: "8px",
        "container-max": "1200px",
        gutter: "24px",
        "margin-desktop": "64px",
        "margin-mobile": "20px",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "headline-xl": ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": [
          "14px",
          { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" },
        ],
        "label-sm": ["12px", { lineHeight: "1", fontWeight: "500" }],
      },
      maxWidth: {
        "container-max": "1200px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        cartBump: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
        toastIn: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        toastOut: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-8px)" },
        },
        mapPinPulse: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)", opacity: "0.6" },
          "50%": { transform: "translate(-50%, -50%) scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        cartBump: "cartBump 0.2s ease-out",
        toastIn: "toastIn 0.25s ease-out",
        toastOut: "toastOut 0.25s ease-in forwards",
        mapPinPulse: "mapPinPulse 2s ease-out infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
