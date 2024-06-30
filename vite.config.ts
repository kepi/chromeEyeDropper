import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import webExtension, { readJsonFile } from "vite-plugin-web-extension"

const beta = process.env.BETA === "1" ? true : false

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json")
  const pkg = readJsonFile("package.json")

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
  plugins: [
    svelte(),
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ["package.json", "manifest.json"],
      additionalInputs: ["src/injects/edropper.ts"],
    }),
  ],
})
