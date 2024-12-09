import type { Config } from "tailwindcss"
import { light } from "daisyui/src/theming/themes"
import daisyui from "daisyui"
import typography from "@tailwindcss/typography"
import plugin from "tailwindcss/plugin"

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      textShadow: {
        DEFAULT: "1px 0 0 var(--tw-shadow-color)",
      },
    },
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
          success: "#a7d8d5",
          warning: "#ffbe00",
          error: "#ff5861",
          "base-100": "#fff",
          "--tab-radius": "0.3rem",

          // use later for dark theme
          //          "base-100": "#1d232a",
        },
      },
    ],
  },
  plugins: [
    daisyui,
    typography,
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") },
      )
    }),
  ],
} satisfies Config
