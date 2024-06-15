import { TinyColor } from "@ctrl/tinycolor"

export type ColorStringFormat =
  | "rgb"
  | "prgb"
  | "nhex6"
  | "nhex3"
  | "nhex8"
  | "hex6"
  | "hex3"
  | "hex8"
  | "name"
  | "hsl"
  | "hsv"

export const colorToString = (color: string, format: ColorStringFormat) => {
  const removeHash = format.match(/^nh/)
  if (removeHash) {
    format = format.substring(1) as ColorStringFormat
  }

  const tColor = new TinyColor(color)
  const output = tColor.toString(format as "name") as string
  return removeHash ? output.substring(1) : output
}
