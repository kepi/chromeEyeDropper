import storage, { type Schema } from "./storage"
import type { ColorStringFormat } from "./color"

export interface SettingsProps {
  autoClipboard: boolean
  autoClipboardType: ColorStringFormat
  enableColorToolbox: boolean
  enableColorTooltip: boolean
  enableRightClickDeactivate: boolean
  dropperCursor: string
  enablePromoOnUpdate: boolean
}

export const defaults: SettingsProps = {
  autoClipboard: false,
  autoClipboardType: "hex6",
  enableColorToolbox: true,
  enableColorTooltip: true,
  enableRightClickDeactivate: true,
  dropperCursor: "default",
  enablePromoOnUpdate: true,
}

export const settingsGet = async <K extends keyof SettingsProps>(prop: K) => {
  const val: SettingsProps[K] = (await storage.getItem(prop)) ?? defaults[prop]
  return val
}

export const settingsSet = async <K extends keyof SettingsProps>(
  prop: K,
  value: SettingsProps[K],
) => {
  await storage.setItem(prop as keyof Schema, value as Schema[K])
}
