import storage, { type Schema } from "./storage"

export type AutoClipboardType = "#rgbhex" | "rgbhex"

export interface SettingsProps {
  autoClipboard: boolean
  autoClipboardType: AutoClipboardType
  enableColorToolbox: boolean
  enableColorTooltip: boolean
  enableRightClickDeactivate: boolean
  dropperCursor: string
  enablePromoOnUpdate: boolean
}

export const defaults: SettingsProps = {
  autoClipboard: false,
  autoClipboardType: "#rgbhex",
  enableColorToolbox: true,
  enableColorTooltip: true,
  enableRightClickDeactivate: true,
  dropperCursor: "default",
  enablePromoOnUpdate: true,
}

const settings = async <K extends keyof SettingsProps>(prop: K, value?: SettingsProps[K]) => {
  // getting
  if (value === undefined) {
    const val: SettingsProps[K] = (await storage.getItem(prop)) ?? defaults[prop]
    console.log("Setting", prop, "is", val)
    if (val === "false") {
      console.log("stringy false")
    }
    return val
  }

  // setting
  await storage.setItem(prop as keyof Schema, value as Schema[K])
}

export default settings
