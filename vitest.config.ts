import { defineConfig } from "vitest/config"
import { WxtVitest } from "wxt/testing"

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  plugins: [WxtVitest()],
  test: {
    // List setup file
    setupFiles: ["vitest.setup.ts"],
  },
})
