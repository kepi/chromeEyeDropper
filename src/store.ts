import { derived, writable, type Writable } from "svelte/store"
import {
  paletteGetColor,
  paletteSetColorAfterHooks,
  paletteColorToClipboard,
  getDefaultColor,
} from "./palette"
import syncedWritable from "./syncedWritable"
import { defaults } from "./settings"
import { match } from "ts-pattern"

/** use for setting selected color and badge */
export const selectedColor = syncedWritable("c", getDefaultColor())
selectedColor.subscribe((color) => {
  paletteSetColorAfterHooks(color)

  // copy to clipboard
  paletteColorToClipboard(color)
})

// export const newColor: Writable<string | null> = writable(null);
// Define a writable store with a placeholder initial value (can be null or any default value)
export const newColor: Writable<string | null> = writable(null)

// Initialize the store asynchronously
async function initializeNewColor() {
  const color = await paletteGetColor()
  newColor.set(color)
}

// Call the initialization function
initializeNewColor().catch(console.error)

export const popupDialog = writable("palette")
export const wideDialog = derived(popupDialog, ($popupDialog) =>
  match($popupDialog)
    .with("palette", () => false)
    .with("picker", () => false)
    .otherwise(() => true),
)

// Options
export const autoClipboard = syncedWritable("autoClipboard", defaults["autoClipboard"])
export const autoClipboardType = syncedWritable("autoClipboardType", defaults["autoClipboardType"])
export const enableColorToolbox = syncedWritable(
  "enableColorToolbox",
  defaults["enableColorToolbox"],
)
export const enableColorTooltip = syncedWritable(
  "enableColorTooltip",
  defaults["enableColorTooltip"],
)
export const enableRightClickDeactivate = syncedWritable(
  "enableRightClickDeactivate",
  defaults["enableRightClickDeactivate"],
)
export const dropperCursor = syncedWritable("dropperCursor", defaults["dropperCursor"])
export const enablePromoOnUpdate = syncedWritable(
  "enablePromoOnUpdate",
  defaults["enablePromoOnUpdate"],
)
