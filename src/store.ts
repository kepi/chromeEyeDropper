import { writable } from "svelte/store"
import { paletteGetColor, paletteGetColorsHexes } from "./palette"
import syncedWritable from "./syncedWritable"
import browser from "webextension-polyfill"
import { defaults } from "./settings"

/** use for setting selected color and badge */
export const selectedColor = await syncedWritable("c", "#75bb75")
selectedColor.subscribe((color) => {
  browser.action.setBadgeBackgroundColor({
    color,
  })
})

// FIXME
// colors and newColor are initialized only once and not synced through
// tabs etc.
//
// this should be problem at the moment, but if we will use
// palettes and selected colors on more pages, it needs to be
// addressed similar to settings bellow
//export const selectedColor = writable(await paletteGetColor())
export const newColor = writable(await paletteGetColor())
export const colors = writable(await paletteGetColorsHexes())

// Settings
export const autoClipboard = await syncedWritable("autoClipboard", defaults["autoClipboard"])
export const autoClipboardType = await syncedWritable(
  "autoClipboardType",
  defaults["autoClipboardType"],
)
export const enableColorToolbox = await syncedWritable(
  "enableColorToolbox",
  defaults["enableColorToolbox"],
)
export const enableColorTooltip = await syncedWritable(
  "enableColorTooltip",
  defaults["enableColorTooltip"],
)
export const enableRightClickDeactivate = await syncedWritable(
  "enableRightClickDeactivate",
  defaults["enableRightClickDeactivate"],
)
export const dropperCursor = await syncedWritable("dropperCursor", defaults["dropperCursor"])
export const enablePromoOnUpdate = await syncedWritable(
  "enablePromoOnUpdate",
  defaults["enablePromoOnUpdate"],
)
