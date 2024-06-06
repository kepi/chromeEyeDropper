declare interface Color {
  r: number
  g: number
  b: number
  alpha: number
  rgbhex?: string
  opposite?: string
}

type EdropperOptions = {
  cursor: "default" | "crosshair"
  enableColorToolbox: boolean
  enableColorTooltip: boolean
  enableRightClickDeactivate: boolean
}

// Types for data conversions from old versions and tests
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
