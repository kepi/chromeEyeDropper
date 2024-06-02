import browser, { type Runtime } from "webextension-polyfill"
import { writable } from "svelte/store"
import { random } from "@ctrl/tinycolor"
import storage from "./storage"

async function getSelectedColor() {
  const color = await storage.getItem("selectedColor")
  return color ?? random().toHexString()
}

export const selectedColor = writable(await getSelectedColor())
export const newColor = writable(random().toHexString())
export const colors = writable([
  random().toHexString(),
  random().toHexString(),
  random().toHexString(),
  random().toHexString(),
  random().toHexString(),
])
