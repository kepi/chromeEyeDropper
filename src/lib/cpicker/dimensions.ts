import { TinyColor } from "@ctrl/tinycolor"

export const colorspaceDimensions = {
  hsl: {
    h: { extent: [0, 360], scale: 1, title: "hue" },
    s: { extent: [0, 100], scale: 100, title: "saturation" },
    l: { extent: [0, 100], scale: 100, title: "luminance" },
  },

  hsv: {
    h: { extent: [0, 360], scale: 1, title: "hue" },
    s: { extent: [0, 100], scale: 100, title: "saturation" },
    v: { extent: [0, 100], scale: 100, title: "value" },
  },

  rgb: {
    r: { extent: [0, 255], scale: 1, title: "red" },
    g: { extent: [0, 255], scale: 1, title: "green" },
    b: { extent: [0, 255], scale: 1, title: "blue" },
  },
}

export type ColorspaceDimensions = typeof colorspaceDimensions
export type ColorspaceName = keyof ColorspaceDimensions
export type DimensionName<K extends ColorspaceName> = keyof (typeof colorspaceDimensions)[K]

type ValidDimensionNames<K extends ColorspaceName> = keyof ColorspaceDimensions[K]

// export type DimensionKey<K extends ColorspaceName> =
//   `${K}.${Extract<ValidDimensionNames<K>, string>}`
// export type DimensionKey = `${ColorspaceName}.${Extract<DimensionName<ColorspaceName>, string>}`
export type DimensionKey =
  | "rgb.r"
  | "rgb.h"
  | "rgb.b"
  | "hsl.h"
  | "hsl.s"
  | "hsl.l"
  | "hsv.h"
  | "hsv.s"
  | "hsv.v"

export type Dimension = (typeof colorspaceDimensions)["rgb"]["r"]

export type DimensionData = Dimension & {
  colorspace: ColorspaceName
  dimension: DimensionName<ColorspaceName>
}

export const dimensions = Object.entries(colorspaceDimensions).reduce(
  (acc, [colorspaceName, values]) => {
    Object.entries(values).forEach(([dimensionName, dimension]) => {
      acc[`${colorspaceName}.${dimensionName}` as DimensionKey] = {
        colorspace: colorspaceName as ColorspaceName,
        dimension: dimensionName as DimensionName<ColorspaceName>,
        ...(dimension as Dimension),
      }
    })
    return acc
  },
  {} as Record<DimensionKey, DimensionData>,
)

export const colorspace = Object.keys(colorspaceDimensions) as [ColorspaceName]

export function otherDimensions(dimensionKey: DimensionKey): DimensionKey[] {
  const [colorspaceName, dimensionName] = dimensionKey.split(".", 2)
  const colorspace = colorspaceDimensions[colorspaceName as ColorspaceName]
  const dimensionKeys = Object.keys(colorspace).filter((cs) => cs != dimensionName)

  if (dimensionKeys.length === 2) {
    return dimensionKeys.map((d) => `${colorspaceName}.${d}` as DimensionKey)
  }

  throw new Error(`wrong dimension data`)
}

export function colorTo(color: string, colorSpace: ColorspaceName) {
  const tColor = new TinyColor(color)

  if (colorSpace === "hsl") {
    return tColor.toHsl()
  } else if (colorSpace === "hsv") {
    return tColor.toHsv()
  } else {
    return tColor.toRgb()
  }
}
