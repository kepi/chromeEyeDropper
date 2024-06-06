import { writable } from "svelte/store"
import { paletteGetColor, paletteGetColorsHexes, paletteSetColor } from "./palette"
import syncedWritable from "./syncedWritable"

// FIXME
// colors are initialized only once and not synced through
// tabs etc.
//
// this should be problem at the moment, but if we will use
// palettes and selected colors on more pages, it needs to be
// addressed similar to settings bellow
//export const selectedColor = writable(await paletteGetColor())
export const selectedColor = await syncedWritable("c", await paletteGetColor())
export const newColor = writable(await paletteGetColor())
export const colors = writable(await paletteGetColorsHexes())

selectedColor.subscribe((value) => {
  console.log("setting color", value)
  paletteSetColor(value)
})

// Settings
export const autoClipboard = await syncedWritable("autoClipboard", false)
