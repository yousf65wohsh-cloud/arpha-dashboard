import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper:  "#F6F7F5",
        card:   "#FFFFFF",
        ink:    "#141A1F",
        muted:  "#67787F",
        line:   "#DFE4E1",
        petrol: "#0F5257",
        petrolSoft: "#E4EDEC",
        amber:  "#B0700F",
        amberSoft: "#FBF0DC",
        alert:  "#9E2B18",
        alertSoft: "#FAE7E2",
        good:   "#2C6E49",
        goodSoft: "#E4F0E8",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans Arabic'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: { xl: "14px" },
    },
  },
  plugins: [],
};
export default config;
