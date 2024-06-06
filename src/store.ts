import { writable } from "svelte/store"
import { paletteGetColor, paletteGetColorsHexes, paletteSetColor } from "./palette"

// TODO add writers to palette store when adding color picker

export const selectedColor = writable(await paletteGetColor())
export const newColor = writable(await paletteGetColor())
export const colors = writable(await paletteGetColorsHexes())

selectedColor.subscribe((value) => {
  paletteSetColor(value)
})
