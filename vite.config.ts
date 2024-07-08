import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import webExtension, { readJsonFile } from "vite-plugin-web-extension"

const beta = process.env.BETA === "1" ? true : false
const pkg = readJsonFile("package.json")

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json")

  if (beta) {
    return {
      name: `${pkg.name} BETA`,
      description: "THIS EXTENSION IS FOR BETA TESTING",
      version: `${pkg.version}`,
      ...manifest,
    }
  } else {
    return {
      name: pkg.name,
      description: pkg.description,
      version: pkg.version,
      ...manifest,
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(`${pkg.version}`),
  },
  plugins: [
    svelte(),
    webExtension({
      browser: process.env.TARGET ?? "chrome",
      manifest: generateManifest,
      watchFilePaths: ["package.json", "manifest.json"],
      additionalInputs: ["src/injects/edropper.ts"],
    }),
  ],
})
