import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
  },
  daisyui: {
    logs: false,
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#75ba75",
          secondary: "#f5945c",
          accent: "#be95be",
          neutral: "#2a323c",
          info: "#6dbfb8",
          success: "#ffffff",
          warning: "#ffbe00",
          error: "#ff5861",
          // use later for dark theme
          //          "base-100": "#1d232a",
        },
      },
    ],
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
} satisfies Config
