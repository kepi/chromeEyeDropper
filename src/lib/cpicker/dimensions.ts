export const dimensions = {
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

export function getDimension(specifier: string) {
  let [scaleKey, dimKey] = specifier.split(".", 2) as [
    keyof typeof dimensions,
    keyof (typeof dimensions)[keyof typeof dimensions],
  ]
  const data = dimensions[scaleKey][dimKey]

  return {
    scale: scaleKey,
    dim: dimKey,
    data: data,
  }
}
