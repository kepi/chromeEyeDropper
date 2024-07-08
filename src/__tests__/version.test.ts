import { fakeBrowser } from "@webext-core/fake-browser"
import { describe, test, it, expect } from "vitest"
import { getSprintFromVersion, isBigUpdate } from "../version"

const [sprint, feature, fix, build] = __APP_VERSION__.split(".").map((p) => Number(p))
const nextBuild = build + 1
const versionWithDifferentBuild = `${sprint}.${feature}.${fix}.${nextBuild}`

type Inputs = [string, { app_version?: string | number | null | boolean }, boolean, null | number][]
const inputs: Inputs = [
  ["empty storage", {}, false, null],
  ["null version", { app_version: null }, false, null],
  ["boolean version", { app_version: true }, false, null],
  ["nonsense version", { app_version: "ahoj" }, false, null],
  ["number version", { app_version: 0.5 }, false, null],
  ["old version format", { app_version: "0.5.25" }, true, 0],
  ["old version format but high first number", { app_version: "5.5" }, false, null],
  ["more recent version then our store", { app_version: "99999.4.3.5" }, false, 99999],
  ["first nextgen version", { app_version: "1.3.6.0" }, false, 1],
  ["previous version", { app_version: "0.2.1.0" }, true, 0],
  ["same version", { app_version: __APP_VERSION__ }, false, sprint],
  ["same version different build", { app_version: versionWithDifferentBuild }, false, sprint],
]

describe("getSprintFromVersion", () => {
  const version = "16.2.3.4"

  it(`returns 16 for ${version}`, () => {
    expect(getSprintFromVersion(version)).toBe(16)
  })

  test.each(inputs)("%s", async (_name, storage, _shouldBe, sprint) => {
    expect(getSprintFromVersion(`${storage.app_version}`)).toBe(sprint)
  })
})

describe("__APP_VERSION__", () => {
  test("Is defined", () => {
    expect(__APP_VERSION__).toBeDefined()
  })

  test("Has correct format", () => {
    expect(__APP_VERSION__).toMatch(/^([0-9]+\.){3}[0-9]+/)
  })
})

describe("isBigUpdate", () => {
  test.each(inputs)("%s", async (_name, storage, shouldBe) => {
    fakeBrowser.reset()
    await fakeBrowser.storage.local.set(storage)
    expect(await isBigUpdate()).toEqual(shouldBe)
  })
})
