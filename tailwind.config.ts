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
        mytheme: {
          primary: "#75ba75",
          secondary: "#f5945c",
          accent: "#be95be",
          neutral: "#2a323c",
          "base-100": "#1d232a",
          info: "#6dbfb8",
          success: "#ffffff",
          warning: "#ffbe00",
          error: "#ff5861",
        },
      },
    ],
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
} satisfies Config
