import { test, describe, beforeEach, it, expect } from "vitest"
import { fakeBrowser } from "@webext-core/fake-browser"
import { findFirstMissingNumber, paletteCreate, paletteGetColor, paletteSetColor } from "../palette"

describe("findFirstMissingNumber", async () => {
  type Inputs = [string, number[], number][]
  const inputs: Inputs = [
    ["empty array", [], 1],
    ["default only", [0], 1],
    ["continuous sequence", [0, 1, 2, 3], 4],
    ["non-continuous sequence", [0, 1, 5, 6, 12], 2],
    ["non-continuous sequence wo zero", [1, 5, 6, 12], 2],
  ]

  test.each(inputs)("%s", (_name, arr, res) => {
    const id = findFirstMissingNumber(arr)
    expect(id).toStrictEqual(res)
  })
})

describe("palette", async () => {
  beforeEach(async () => {
    fakeBrowser.reset()
  })

  it("paletteGetColor default", async () => {
    const color = await paletteGetColor()
    expect(color).toEqual("#75bb75")
  })

  it("paletteGetColor after setting it", async () => {
    const wantedColor = "#aabbcc"
    paletteSetColor(wantedColor, "ed")

    const color = await paletteGetColor()
    expect(color).toEqual(wantedColor)
  })

  it("create new palette when there are no palettes", async () => {
    const paletteId = await paletteCreate(null, "vocas", [])
    expect(paletteId).toStrictEqual(1)
  })
})
