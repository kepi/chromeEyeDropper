/**
 * Storage for EyeDropper
 *
 * This is simple non-nested storage ment to be accessed quickly from whole
 * extension.
 *
 * Keys are kind of short so we are not wasting bytes in synced storage, which
 * has quite small quota. Hence, all access should be done through methods from
 * this "module".
 *
 * Since manifest v3, service worker can be shut down after short inactivity.
 * Mainly because of this, we are now storing every variable and setting
 * directly in storage without any intermediary data structure. Because of that,
 * flat structure seems much easier, as we can now get/set everything but color
 * in palette with single command.
 *
 * Every stored key should be documented immediately so we don't have to guess
 * about its meaning.
 *
 * Access to storage is done through @webext-core/storage
 *
 **/

import browser from "webextension-polyfill"
import { defineExtensionStorage, localExtStorage } from "@webext-core/storage"
import type { SettingsProps } from "./settings"
import {
  paletteCreate,
  paletteSetActive,
  type StorePalettes,
  type StorePaletteColor,
  type StorePaletteColorSource,
} from "./palette"

/**
 * v = store schema version
 * c = last color
 * p = palette (active)
 */
type StoreBasic = {
  v: number
  c: string
  p: number
}

type Schema = StoreBasic & SettingsProps & StorePalettes

const extensionStorage = defineExtensionStorage<Schema>(browser.storage.sync)

export const backupStorage = async (data: unknown) => {
  const t = Date.now()
  await localExtStorage.setItem(`backup${t}`, data)
}

type V24PaletteItem = {
  f: number
  h: string
  n: string
  s: number
  // it should be number only but for sake of prev14 error...
  t: number | Function
  d?: number
}

type V24Palette = {
  c: V24PaletteItem[]
  t: number
}

type V24Data = {
  history: {
    cp: string
    lc: string
    v: number
  }
  [key: `palette\.${string}`]: V24Palette
  settings: {
    autoClipboard: boolean
    autoClipboardNoGrid: boolean
    dropperCursor: string
    enableColorToolbox: boolean
    enableColorTooltip: boolean
    enablePromoOnUpdate: boolean
    enableRightClickDeactivate: boolean
    plus: boolean
    plus_type: any
  }
}

export const checkStorage = async () => {
  const v = await extensionStorage.getItem("v")

  // v exists, we are in post 0.6 schema
  if (v) {
    return true
  }

  // get data from storage
  const unknData = await browser.storage.sync.get()

  if (unknData) {
    // empty storage - nothing to do
    const isEmpty = Object.keys(unknData).length === 0 && unknData.constructor === Object
    if (isEmpty) {
      return true
    }

    if (unknData.history?.v) {
      const data = unknData as V24Data

      // let's convert data to new Schema
      //
      // settings and basic info
      const convertedData: Schema = {
        v: data.history.v,
        c: data.history.lc,
        p: 0, // we will set selected palette in next steps
        autoClipboard: data.settings.autoClipboard,
        autoClipboardNoGrid: data.settings.autoClipboardNoGrid,
        enableColorToolbox: data.settings.enableColorToolbox,
        enableColorTooltip: data.settings.enableColorTooltip,
        enableRightClickDeactivate: data.settings.enableRightClickDeactivate,
        dropperCursor: data.settings.dropperCursor,
        enablePromoOnUpdate: data.settings.enablePromoOnUpdate,
      }

      // backup first
      await backupStorage(data)

      // sync to store
      await browser.storage.sync.set(convertedData)

      // handle palettes
      let palettes_count = 0
      Object.keys(data).forEach((key) => {
        if (/^palette\./.test(key)) {
          // get palette
          const palette_name = key.split(".")[1]
          const palette = data[key as keyof V24Data] as V24Palette

          // convert colors for palette
          const palette_colors = palette.c.map((c) => {
            const getSource = (source: number): StorePaletteColorSource => {
              switch (source) {
                case 0:
                  return "ed"
                case 1:
                  return "cp"
                case 2:
                  return "old"
                default:
                  return "ed"
              }
            }

            const newColor: StorePaletteColor = {
              h: c.h,
              s: getSource(c.s),
              t: typeof c.t === "number" ? c.t : 0,
              d: c.d,
            }
            return newColor
          })

          // get palette_id
          let palette_id: number
          if (palette_name == "default") {
            palette_id = 0
          } else {
            palettes_count += 1
            palette_id = palettes_count
          }

          // create palette in new store
          paletteCreate(palette_id, palette_name, palette_colors, palette.t)

          // set active palette if we have id
          if (data.history.cp === palette_name) {
            paletteSetActive(palette_id)
          }
        }
      })

      return true
    } else {
      backupStorage(unknData)
      await browser.storage.sync.clear()
      return true
    }
  }

  // we shouldn't end here
  return false
}

// - pokud existuje v tak máme nový styl schématu
// - pokud existuje history.v tak je pre 0.6
// - pre history v 14
// const checkHistoryUpgrades = (version: number) => {
//   // Wrong timestamp saved before version 14
//   //
//   //
//   // We will check for such times and set them to start of epoch
//   if (version < 14) {
//     bg.saveHistory()
//   }
// }

export default extensionStorage
