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
