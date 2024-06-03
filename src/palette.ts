/**
 * Palette part of Storage for Eye Dropper
 *
 * Palettes are stored in top level, each palette has two keys. `pXm` for metadata
 * and `pXc` for colors, where `X` is ID (number) of palette.
 *
 * Default palette id 0.
 * Active palette is stored in key `p`.
 *
 * Palettes should be access only through this "module" so we can easily change
 * things under the hood, if necessary.
 */

import storage from "./storage"

type StorePaletteColorSource =
  /** eye dropper */
  | "ed"
  /** color picker */
  | "cp"
  /** old history */
  | "old"

interface StorePaletteColor {
  /** color in hex format including # character. i.e. #ffffff */
  h: string
  /** from where was the color taken? */
  s: StorePaletteColorSource
  /** taken at (timestamp) */
  t: number
  /** deleted at (timestamp) */
  d?: number
}

interface StorePaletteMeta {
  /** palette id */
  i: number
  /** name of palette - used for display only */
  n: string
  /** created at (timestamp) */
  t: number
}

export type StorePalettes = {
  /** p0m = metadata for palette 0 */
  [key: `p${number}m`]: StorePaletteMeta
  /** p0c = colors for palette 0 */
  [key: `p${number}c`]: StorePaletteColor[]
}

/**
 * Returns id of active palette.
 *
 * @remarks
 * When there is no active palette, it returns 0 (default palette).
 *
 * @returns id of active palette
 */
export const paletteGetActive = async () => {
  const p = await storage.getItem("p")
  return p ?? 0
}

/**
 * Sets palette as active
 *
 * @paletteId - id of palette to be set as active
 */
export const paletteSetActive = async (paletteId: number) => {
  storage.setItem("p", paletteId)
}

/**
 * Sets active color of palette
 *
 * @param color - hex color (i.e. #ffffff)
 * @param source - where we took the color
 * @param add - also add color to palette colors
 */
export const paletteSetColor = async (
  color: string,
  source: StorePaletteColorSource,
  add: boolean = true,
) => {
  // set active color
  storage.setItem("c", color)

  // add to palette colors
  if (add) {
    const paletteId = await paletteGetActive()
    if (paletteId === undefined) return

    const colors = await paletteGetColors(paletteId)

    // if color isn't already in palette
    if (!colors.some((c) => c.h === color)) {
      // push to colors in correct format with metadata
      colors.push(color2StorePaletteColor(color, source))
      // save to storage
      storage.setItem(`p${paletteId}c`, colors)
    }
  }
}

/**
 * Gets active color
 */
export async function paletteGetColor() {
  return storage.getItem("c")
}

/**
 * Gets colors from palette
 *
 * @param [paletteId=paletteGetActive()] id of palette to get colors from
 */
export const paletteGetColors = async (paletteId?: number) => {
  paletteId ??= await paletteGetActive()

  if (paletteId === undefined) {
    console.error("no palette")
    return []
  }

  const colors = await storage.getItem(`p${paletteId}c`)
  return colors ?? []
}

/**
 * Gets hexes of colors from palette
 *
 * @param [paletteId=paletteGetActive()] id of palette to get colors from
 */
export const paletteGetColorsHexes = async (paletteId?: number) => {
  const colors = await paletteGetColors(paletteId)
  return colors.map((c) => c.h)
}

/**
 * Returns color with metadata in format to be stored.
 *
 * @param color: hex color (i.e. #ffffff)
 * @param source: from where we took the color
 */

const color2StorePaletteColor = (color: string, source: StorePaletteColorSource) => {
  return {
    h: color,
    s: source,
    t: Date.now(),
  }
}
