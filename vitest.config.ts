import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // List setup file
    setupFiles: ["vitest.setup.ts"],

    // List ALL dependencies that use `webextension-polyfill` under `server.deps.include`.
    // Without this, Vitest can't mock `webextension-polyfill` inside the dependencies, and the
    // actual polyfill will be loaded in tests
    //
    // You can get a list of dependencies using your package manager:
    //   - pnpm why webextension-polyfill
    server: {
      deps: {
        inline: ["@webext-core/storage"],
      },
    },
  },
})
