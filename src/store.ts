import { TinyColor } from "@ctrl/tinycolor"
import { derived, writable, type Readable } from "svelte/store"
import {
  type StorePaletteColor,
  paletteGetColor,
  paletteSetColorAfterHooks,
  palletteColorToClipboard,
  type StorePalettes,
  type StorePaletteSortBy,
  type StorePaletteMeta,
} from "./palette"
import syncedWritable from "./syncedWritable"
import { defaults } from "./settings"
import syncedDerived from "./syncedDerived"

/** use for setting selected color and badge */
export const selectedColor = await syncedWritable("c", "#75bb75")
selectedColor.subscribe((color) => {
  paletteSetColorAfterHooks(color)

  // copy to clipboard
  palletteColorToClipboard(color)
})

export const newColor = writable(await paletteGetColor())

export const paletteId = await syncedWritable("p", 0)

export const paletteColorsKey = derived(
  paletteId,
  ($paletteId) => `p${$paletteId}c` as keyof StorePalettes,
)

export const paletteMetaKey = derived(
  paletteId,
  ($paletteId) => `p${$paletteId}m` as keyof StorePalettes,
)

export const paletteColors = syncedDerived(paletteColorsKey, []) as Readable<StorePaletteColor[]>
export const paletteMeta = syncedDerived(paletteMetaKey, []) as Readable<StorePaletteMeta>
export const sortBy = derived(paletteMeta, ($paletteMeta) => $paletteMeta.s)

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

export const sortedColors = derived(
  [paletteMeta, paletteColors],
  ([$paletteMeta, $paletteColors]) => {
    const sortBy = $paletteMeta.s
    if (sortBy === "def") return $paletteColors

    const colors = $paletteColors.sort((a, b) => {
      const tA = new TinyColor(a.h)
      const tB = new TinyColor(b.h)

      if (sortBy === "asc") {
        return tA.toHsv().h < tB.toHsv().h ? -1 : 1
      } else {
        return tA.toHsv().h > tB.toHsv().h ? -1 : 1
      }
    })
    return colors
  },
)
