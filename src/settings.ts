import storage, { type Schema } from "./storage"

export interface SettingsProps {
  autoClipboard: boolean
  autoClipboardNoGrid: boolean
  enableColorToolbox: boolean
  enableColorTooltip: boolean
  enableRightClickDeactivate: boolean
  dropperCursor: string
  enablePromoOnUpdate: boolean
}

const defaults: SettingsProps = {
  autoClipboard: false,
  autoClipboardNoGrid: false,
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
