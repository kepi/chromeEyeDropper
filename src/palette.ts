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
import { settingsGet } from "./settings"
import { copyToClipboard } from "./clipboard"
import { colorToString } from "./color"

export type StorePaletteColorSource =
  /** eye dropper */
  | "ed"
  /** color picker */
  | "cp"
  /** old history */
  | "old"
  /**  default */
  | "def"

export type StorePaletteSortBy = "def" | "asc" | "desc"

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

export interface StorePaletteMeta {
  /** palette id */
  i: number
  /** name of palette - used for display only */
  n: string
  /** created at (timestamp) */
  t: number
  /** sorted by */
  s: StorePaletteSortBy
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
 * Copy passed color to clipboard
 *
 * @remarks
 * It will copy to clipboard based on settings. First it checks, if
 * clipboard is enabled and then it will select format in which color should
 * be copied in.
 *
 *  @param color - hex color (i.e. #ffffff)
 */
export const palletteColorToClipboard = async (color: string) => {
  // copy to clipboard if wanted
  if (await settingsGet("autoClipboard")) {
    console.log("copying to clipboard")
    copyToClipboard(colorToString(color, await settingsGet("autoClipboardType")))
  }
}

/**
 * Run hooks which should be run after setting color
 *
 * @remarks
 * As we are setting color from at least two places (Svelte store and this
 * palette), we need common function to do things after setting color, like
 * change badge and hopefully copy to clipboard at some point.
 *
 * We can't use copy to clipboard here at the moment, as we don't have always
 * document ready and looks like at least Firefox doesn't have
 * browser.offscreen for now.
 *
 * @param color - hex color (i.e. #ffffff)
 */
export const paletteSetColorAfterHooks = async (color: string) => {
  // set badge color
  await browser.action.setBadgeBackgroundColor({
    color,
  })
}

/**
 * Sets active color of palette
 *
 * @remarks
 * When we specify source, color will be added to list of palette colors.
 *
 * When we don't specify source, it will be only set in badge/active color.
 *
 * @param color - hex color (i.e. #ffffff)
 * @param source - where we took the color
 */
export const paletteSetColor = async (color: string, source?: StorePaletteColorSource) => {
  // set active color
  storage.setItem("c", color)

  // run hooks which should be run after setting color
  paletteSetColorAfterHooks(color)

  // add to palette colors
  if (source) {
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
    s: "def",
  })

  await storage.setItem(`p${paletteId}c`, colors)
  return paletteId
}

/**
 * Gets active color
 *
 * @remarks
 * When there is no active color, default #75bb75 is returned.
 */
export async function paletteGetColor() {
  return (await storage.getItem("c")) ?? "#75bb75"
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

export const color2StorePaletteColor = (color: string, source: StorePaletteColorSource) => {
  return {
    h: color,
    s: source,
    t: Date.now(),
  }
}

export const paletteWipe = async (paletteId?: number, defaultColors: boolean = false) => {
  paletteId ??= await paletteGetActive()

  paletteSetColors(paletteId, defaultColors ? paletteDefaultColors() : [])
}

export const paletteDefaultColors = () => {
  const defaultColors: string[] = [
    "#f5945c",
    "#fec76f",
    "#b3be62",
    "#75ba75",
    "#6dbfb8",
    "#71a3c1",
    "#be95be",
  ]
  const paletteColors: StorePaletteColor[] = defaultColors.map((color) =>
    color2StorePaletteColor(color, "def"),
  )
  return paletteColors
}

export const paletteSort = async (paletteId?: number, sortBy?: StorePaletteSortBy) => {
  paletteId ??= await paletteGetActive()

  const paletteMetaKey = `p${paletteId}m` as keyof StorePalettes

  const meta = (await storage.getItem(paletteMetaKey)) as StorePaletteMeta

  if (sortBy) {
    meta.s = sortBy
  } else {
    sortBy = meta.s
    if (sortBy === "def") meta.s = "asc"
    else if (sortBy === "asc") meta.s = "desc"
    else meta.s = "def"
  }

  storage.setItem(paletteMetaKey, meta)
}
