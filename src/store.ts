import { derived, writable } from "svelte/store"
import { paletteGetColor, paletteSetColorAfterHooks, palletteColorToClipboard } from "./palette"
import syncedWritable from "./syncedWritable"
import { defaults } from "./settings"
import { match } from "ts-pattern"

/** use for setting selected color and badge */
export const selectedColor = await syncedWritable("c", "#75bb75")
selectedColor.subscribe((color) => {
  paletteSetColorAfterHooks(color)

  // copy to clipboard
  palletteColorToClipboard(color)
})

export const newColor = writable(await paletteGetColor())

export const popupDialog = writable("palette")
export const wideDialog = derived(popupDialog, ($popupDialog) =>
  match($popupDialog)
    .with("palette", () => false)
    .with("picker", () => false)
    .otherwise(() => true),
)

// Options
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
