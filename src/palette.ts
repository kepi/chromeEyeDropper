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

import browser from "webextension-polyfill"
import storage from "./storage"

export type StorePaletteColorSource =
  /** eye dropper */
  | "ed"
  /** color picker */
  | "cp"
  /** old history */
  | "old"

export interface StorePaletteColor {
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
      paletteSetColors(paletteId, colors)
    }
  }
}

/**
 * Set colors of palette
 *
 * @remarks
 * This is only method which should be used to set colors of some palette. It
 * checks for missing default palette and may do more things in future.
 *
 * @param paletteId - id of palette
 * @param colors - colors to set
 */
export const paletteSetColors = async (paletteId: number, colors: StorePaletteColor[]) => {
  // default palette
  if (paletteId === 0) {
    // get metadata
    const paletteMeta = await storage.getItem(`p${paletteId}m`)

    // create palette and set colors if default doesn't exist
    if (!paletteMeta) {
      paletteCreate(paletteId, "default", colors)
      return
    }
  }

  // set colors to current palette
  storage.setItem(`p${paletteId}c`, colors)
}

/**
 * Find first missing number
 *
 * Find first missing number in number array and return it.
 *
 * @param array
 */
export const findFirstMissingNumber = (arr: number[]) => {
  arr.sort((a, b) => a - b)

  // if default palette isn't defined, add it
  if (arr[0] !== 0) {
    arr.unshift(0)
  }

  // we need to go to array + 1, hence <= as we need next available id, so i.e.
  // in array [0] we need to go to second position to get 1
  for (let i = 0; i <= arr.length; i++) {
    if (arr[i] !== i) {
      return i
    }
  }

  // this should never happen
  return -1
}

/**
 * Find first available Id
 *
 * Finds first available id in existing palettes and returns it.
 *
 */
export const paletteFindFirstAvailableId = async () => {
  const syncStorage = await browser.storage.sync.get()
  // this will count all existing palettes but default one (0) and add 1
  const existingPaletteIds = Object.keys(syncStorage)
    .filter((key) => /^p[0-9]+m$/.test(key))
    .map((key) => Number(key.match(/^p([0-9]+)m$/)![1]))

  return findFirstMissingNumber(existingPaletteIds)
}

/**
 * Create Palette
 *
 * Create palette and returns its id.
 *
 * @remarks
 * When paletteId is null, it will be autoincremented automatically.
 *
 * While it is preferred, palettes don't have to have ids in continuous number
 * sequence.
 *
 * When palette with specified number already exists, it silently returns this
 * id and do nothing. If creating failed, it returns -1.
 *
 * @param paletteId - id of palette to create
 * @param name - name of palette to create
 * @param colors - colors to set
 * @param time - time of creation - timestamp
 */

export const paletteCreate = async (
  paletteId: number | null,
  name: string,
  colors: StorePaletteColor[],
  time?: number,
) => {
  // get next paletteId
  if (paletteId === null) {
    paletteId = await paletteFindFirstAvailableId()
  }

  if (paletteId < 0) {
    return -1
  }

  const alreadyExists = await storage.getItem(`p${paletteId}c`)
  if (alreadyExists) {
    return paletteId
  }

  await storage.setItem(`p${paletteId}m`, {
    i: paletteId,
    n: name,
    t: time ?? Date.now(),
  })

  await storage.setItem(`p${paletteId}c`, colors)
  return paletteId
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
 * @param color - hex color (i.e. #ffffff)
 * @param source - from where we took the color
 */

const color2StorePaletteColor = (color: string, source: StorePaletteColorSource) => {
  return {
    h: color,
    s: source,
    t: Date.now(),
  }
}
