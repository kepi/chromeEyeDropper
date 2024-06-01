import browser, { type Runtime } from "webextension-polyfill"
import { writable } from "svelte/store"
import { random } from "@ctrl/tinycolor"

async function getSelectedColor() {
  const gettingItem = browser.storage.sync.get("selectedColor")
  return gettingItem.then(
    (val) => val.selectedColor,
    () => random().toHexString(),
  )
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
