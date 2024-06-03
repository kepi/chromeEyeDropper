import storage from "./storage"

export interface SettingsProps {
  autoClipboard: boolean
  autoClipboardNoGrid: boolean
  enableColorToolbox: boolean
  enableColorTooltip: boolean
  enableRightClickDeactivate: boolean
  dropperCursor: string
  enablePromoOnUpdate: boolean
}

class Settings {
  defaults: SettingsProps = {
    autoClipboard: false,
    autoClipboardNoGrid: false,
    enableColorToolbox: true,
    enableColorTooltip: true,
    enableRightClickDeactivate: true,
    dropperCursor: "default",
    enablePromoOnUpdate: true,
  }

  async get(_target: any, prop: keyof SettingsProps) {
    const value = await storage.getItem(prop)
    if (value === null) {
      return this.defaults[prop]
    }
  }

  async set(_target: any, prop: keyof SettingsProps, value: any) {
    await storage.setItem(prop, String(value))
  }
}

export default Settings
