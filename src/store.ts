import { writable } from "svelte/store"
import { random } from "@ctrl/tinycolor"
import { paletteGetColor, paletteGetColorsHexes } from "./palette"

// TODO add writers to palette store when adding color picker

export const selectedColor = writable(await paletteGetColor())
export const newColor = writable(random().toHexString())
export const colors = writable(await paletteGetColorsHexes())
