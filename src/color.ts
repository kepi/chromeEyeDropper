import { TinyColor, type HSL, type HSV, type Numberify, type RGB } from "@ctrl/tinycolor"

type DataMode = {
  rgb: Numberify<RGB>
  hsv: Numberify<HSV>
  hsl: Numberify<HSL>
}

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

// this alter one dimension of colorspace, like i.e. chaning g in r,g,b
export const alterDimension = <M extends keyof DataMode>(
  data: DataMode[M],
  key: keyof DataMode[M],
  value: number,
): DataMode[M] => {
  data[key] = value as DataMode[M][typeof key]
  return data
}
