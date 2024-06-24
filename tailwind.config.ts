import type { Config } from "tailwindcss"
import { light } from "daisyui/src/theming/themes"
import daisyui from "daisyui"
import typography from "@tailwindcss/typography"

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
          light,
          primary: "#f5945c",
          secondary: "#75ba75",
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
  plugins: [daisyui, typography],
} satisfies Config
