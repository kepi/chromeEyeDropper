import { defineConfig } from "wxt"

// const pkg_name = import.meta.env.npm_package_name
// const pkg_description = import.meta.env.npm_package_description

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-svelte"],
  manifest: ({ browser }) => ({
    browser_action: {
      theme_icons: [{ light: "icon/light.svg", dark: "icon/dark.svg", size: 16 }],
    },
    // name: import.meta.env.PROD ? pkg_name : `${pkg_name} BETA`,
    // description: import.meta.env.PROD ? pkg_description : "THIS EXTENSION IS FOR BETA TESTING",
    permissions: ["activeTab", "storage", "scripting"],
    web_accessible_resources: [
      {
        matches: ["*://*/*"],
        resources: ["edropper.js"],
      },
    ],
    commands: {
      "pick-from-webpage": {
        suggested_key: {
          default: "Alt+P",
        },
        description: "Pick color from web page",
      },
    },
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "prod@eyedropper.org",
        },
      },
    }),
  }),
  runner: {
    startUrls: ["https://eyedropper.org"],
    openConsole: true,
    openDevtools: true,
    chromiumArgs: ["--user-data-dir=./.wxt/chrome-data"],
  },
  vite: () => ({
    define: {
      __APP_VERSION__: JSON.stringify(`${import.meta.env.npm_package_version}`),
    },
    ssr: {
      noExternal: ["@webext-core/messaging"],
    },
  }),
})
