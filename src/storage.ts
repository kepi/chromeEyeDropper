/**
 * Storage for EyeDropper
 *
 * This is simple non-nested storage ment to be accessed quickly from whole
 * extension.
 *
 * Keys are kind of short so we are not wasting bytes in synced storage, which
 * has quite small quota. Hence, all access should be done through methods from
 * this "module".
 *
 * Since manifest v3, service worker can be shut down after short inactivity.
 * Mainly because of this, we are now storing every variable and setting
 * directly in storage without any intermediary data structure. Because of that,
 * flat structure seems much easier, as we can now get/set everything but color
 * in palette with single command.
 *
 * Every stored key should be documented immediately so we don't have to guess
 * about its meaning.
 *
 * Access to storage is done through @webext-core/storage
 *
 **/

import browser from "webextension-polyfill"
import { defineExtensionStorage } from "@webext-core/storage"
import type { SettingsProps } from "./settings"
import type { StorePalettes } from "./palette"

/**
 * v = store schema version
 * c = last color
 * p = palette (active)
 */
type StoreBasic = {
  v: number
  c: string
  p: number
}

type Schema = StoreBasic & SettingsProps & StorePalettes

const extensionStorage = defineExtensionStorage<Schema>(browser.storage.sync)

export const checkStorage = () => {
  return true
}

// pokud existuje v tak máme nový styl schématu
// pokud existuje history.v tak je pre 0.6
// history: {
//   v: version,
//   cp: name of current palette
//   lc: last color
// },
const store_pre06 = {
  history: {
    cp: "default",
    lc: "#fcb040",
    v: 24,
  },
  "palette.default": {
    c: [
      {
        f: 0,
        h: "#f4efea",
        n: "",
        s: 1,
        t: 1705944463495,
      },
      {
        f: 0,
        h: "#e36c25",
        n: "",
        s: 1,
        t: 1705944480255,
      },
      {
        f: 0,
        h: "#fcb040",
        n: "",
        s: 1,
        t: 1707647001550,
      },
    ],
    t: 1705944446032,
  },
  settings: {
    autoClipboard: false,
    autoClipboardNoGrid: false,
    dropperCursor: "default",
    enableColorToolbox: true,
    enableColorTooltip: true,
    enablePromoOnUpdate: false,
    enableRightClickDeactivate: true,
    plus: false,
    plus_type: null,
  },
}
// pre history v 14
// Wrong timestamp saved before version 14
//
// There was error in bg versions before 14 that caused saving
// history color timestamp as link tu datenow function instead of
// current date in some cases.
//
// We will check for such times and set them to start of epoch
// if (version < 14) {
//   console.log("History version is pre 14: Fixing color times")
//   for (var _i = 0, _a = bg.history.palettes; _i < _a.length; _i++) {
//     var palette = _a[_i]
//     for (var _b = 0, _c = palette.colors; _b < _c.length; _b++) {
//       var color = _c[_b]
//       if (typeof color.t !== "number") {
//         color.t = 0
//       }
//     }
//   }
//   bg.saveHistory()
// }
// pre 0.4 history je v localStorage
// tryConvertOldHistory: function () {
//   if (window.localStorage.history) {
//     var oldHistory = JSON.parse(window.localStorage.history)
//     var converted_palette = bg.createPalette("converted")
//     console.warn(converted_palette)
//     // add every color from old history to new schema with current timestamp
//     var timestamp = Date.now()
//     for (var key in oldHistory) {
//       var color = oldHistory[key]
//       // in versions before 0.3.0 colors were stored without # in front
//       if (color[0] != "#") {
//         color = "#" + color
//       }
//       // push color to our converted palette
//       converted_palette.colors.push(bg.historyColorItem(color, timestamp, 3))
//       // set this color as last
//       bg.history.last_color = color
//     }
//     // make backup of old history
//     window.localStorage._history_backup = window.localStorage.history
//     // remove old history from local storage
//     window.localStorage.removeItem("history")
//     // sync history
//     bg.saveHistory()
//     // change to converted history if current palette is empty
//     if (bg.getPalette().colors.length < 1) {
//       bg.changePalette(converted_palette.name)
//     }
//   }
// },

// export const checkStorage = () => {
//   // detect if we have correct history version

//   console.info("Loading history from storage")
//   chrome.storage.sync.get((items) => {
//     if (items.history) {
//       bg.history.current_palette = items.history.cp
//       bg.history.last_color = items.history.lc
//       console.info("History info loaded. Loading palettes.")
//       console.info("Default palette before loading: " + bg.defaultPalette)
//       var count_default_1 = 0
//       var count_converted_1 = 0
//       Object.keys(items).forEach((key, _index) => {
//         var matches = key.match(/^palette\.(.*)$/)
//         if (matches) {
//           var palette = items[key]
//           bg.history.palettes.push({
//             name: matches[1],
//             colors: palette.c,
//             created: palette.t,
//           })
//           if (matches[1] === "default") {
//             count_default_1 = palette.c.length
//           }
//           if (matches[1] === "converted") {
//             count_converted_1 = palette.c.length
//           }
//         }
//       })
//       if (count_default_1 === 0 && count_converted_1 > 0) {
//         bg.defaultPalette = "converted"
//         console.info("Default palette after loading: " + bg.defaultPalette)
//       }
//       if (items.history.v < bg.history.version) {
//         checkHistoryUpgrades(items.history.v)
//       }
//     } else {
//       console.log("No history in storage")
//       bg.createPalette("default")
//     }
//     // in any case we will try to convert local history
//     bg.tryConvertOldHistory()
//   })
// }

// const checkHistoryUpgrades = (version: number) => {
//   // Wrong timestamp saved before version 14
//   //
//   // There was error in bg versions before 14 that caused saving
//   // history color timestamp as link tu datenow function instead of
//   // current date in some cases.
//   //
//   // We will check for such times and set them to start of epoch
//   if (version < 14) {
//     console.log("History version is pre 14: Fixing color times")
//     for (var _i = 0, _a = bg.history.palettes; _i < _a.length; _i++) {
//       var palette = _a[_i]
//       for (var _b = 0, _c = palette.colors; _b < _c.length; _b++) {
//         var color = _c[_b]
//         if (typeof color.t !== "number") {
//           color.t = 0
//         }
//       }
//     }
//     bg.saveHistory()
//   }
// }

export default extensionStorage
