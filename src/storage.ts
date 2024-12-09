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

const STORAGE_VERSION = 26

import browser from "webextension-polyfill"
import { defineExtensionStorage, localExtStorage } from "@webext-core/storage"
import { defaults, type SettingsProps } from "./settings"
import {
  paletteCreate,
  paletteSetActive,
  type StorePaletteMeta,
  type StorePalettes,
  type StorePaletteColor,
  type StorePaletteColorSource,
  paletteDefaultColors,
  getDefaultColor,
  palettesIds,
} from "./palette"
import { storeAppVersion } from "./version"

export type StoreBasic = {
  /** store schema version */
  v: number
  /** last color in hex format (i.e. #ffffff) */
  c: string
  /** id of active palette */
  p: number
}

export type Schema = StoreBasic & SettingsProps & StorePalettes

const extensionStorage = defineExtensionStorage<Schema>(browser.storage.sync)

export const backupStorage = async (data: unknown) => {
  const t = Date.now()
  await localExtStorage.setItem(`backup${t}`, data)
}

const setDefaultStorage = async () => {
  await browser.storage.sync.set({ v: STORAGE_VERSION, p: 0 })
  await paletteCreate(0, "default", paletteDefaultColors())
}

export const checkStorage = async () => {
  await checkLegacyStorage()

  const v = await extensionStorage.getItem("v")

  // v should be defined now but better safe than sorry
  if (!v) {
    return false
  }

  if (v === 26) {
    console.log("Storage version v26 - adding palette weights")
    await setMissingPaletteWeights()
    await extensionStorage.setItem("v", 27)
  }

  return true
}

export const setMissingPaletteWeights = async () => {
  const ids = (await palettesIds()).sort((a, b) => a - b)

  const updatePromises = ids.map(async (paletteId, idx) => {
    const metaKey = `p${paletteId}m` as keyof StorePalettes
    const meta = (await extensionStorage.getItem(metaKey)) as StorePaletteMeta

    meta.w = idx + 1
    await extensionStorage.setItem(metaKey, meta)
  })

  await Promise.all(updatePromises)
}

export const checkLegacyStorage = async () => {
  const v = await extensionStorage.getItem("v")

  // v exists, we are in post 0.6 schema
  if (v) {
    console.debug("Storage: latest version, everything OK.")
    // return that we are OK
    return true
  }

  // get data from storage
  const unknData = await browser.storage.sync.get()

  if (unknData) {
    const isEmpty = Object.keys(unknData).length === 0 && unknData.constructor === Object

    // empty storage - create new palette with default colors
    if (isEmpty) {
      console.debug("Storage: empty storage, setting default.")
      setDefaultStorage()

      return true
    }

    // V24 - let's convert it to new version
    if ((unknData as V24Data).history?.v || unknData.settings) {
      console.debug("Storage: old V24 storage, making backup and converting to new format.")
      const data = unknData as V24Data

      // backup first
      await backupStorage(data)

      // settings and basic info
      const convertedData: Schema = {
        v: 26,
        c: data.history?.lc || getDefaultColor(),
        p: 0, // we will set selected palette in next steps
        autoClipboard: data.settings?.autoClipboard ?? defaults.autoClipboard,
        autoClipboardType: data.settings?.autoClipboardNoGrid ? "nhex6" : "hex6",
        enableColorToolbox: data.settings?.enableColorToolbox ?? defaults.enableColorToolbox,
        enableColorTooltip: data.settings?.enableColorTooltip ?? defaults.enableColorTooltip,
        enableRightClickDeactivate:
          data.settings?.enableRightClickDeactivate ?? defaults.enableRightClickDeactivate,
        dropperCursor: data.settings?.dropperCursor ?? defaults.dropperCursor,
        enablePromoOnUpdate: data.settings?.enablePromoOnUpdate ?? defaults.enablePromoOnUpdate,
        enableErrorReportingTab: true,
      }

      // sync to store
      await browser.storage.sync.clear()
      await browser.storage.sync.set(convertedData as Record<string, any>)

      // set version to oldest pre-v1
      await storeAppVersion("0.5.25")

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

      // store format is unknown -  let's backup and clear storage to default state
    } else {
      console.debug("Storage: unknown storage, making backup and setting default.")
      await storeAppVersion("0.0.0.0")

      backupStorage(unknData)
      await browser.storage.sync.clear()
      await setDefaultStorage()
      return true
    }
  }

  // we shouldn't end here
  return false
}

export default extensionStorage
