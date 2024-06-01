import { writable } from "svelte/store"
import { random } from "@ctrl/tinycolor"

export const selectedColor = writable(random().toHexString())
export const newColor = writable(random().toHexString())
export const colors = writable([
  random().toHexString(),
  random().toHexString(),
  random().toHexString(),
  random().toHexString(),
  random().toHexString(),
])
