import { checkStorage } from "../storage"

import browser from "webextension-polyfill"
import { fakeBrowser } from "@webext-core/fake-browser"
import { syncExtStorage } from "@webext-core/storage"
import { describe, beforeEach, it, expect } from "vitest"

import { storeV24TwoPalettes, storeV24, storeV13 } from "./storage.previous"

const STORAGE_VERSION = 26

describe("emptyStore", () => {
  beforeEach(async () => {
    fakeBrowser.reset()
  })

  it("checkStorage returns true", async () => {
    const check = await checkStorage()
    expect(check).toBe(true)
  })
})

describe("unknownStore", () => {
  const data = {
    hocus: "pocus",
  }

  beforeEach(async () => {
    fakeBrowser.reset()
    await browser.storage.sync.set(data)
  })

  it("checkStorage returns true", async () => {
    const check = await checkStorage()
    expect(check).toBe(true)
  })

  it("sync storage is set to default", async () => {
    await checkStorage()
    const syncStorage = await browser.storage.sync.get()

    expect(syncStorage.v).toEqual(STORAGE_VERSION)
    expect(syncStorage.p).toEqual(0)

    const { t, ...p0mWoTime } = syncStorage.p0m
    expect(p0mWoTime).toEqual({ i: 0, n: "default", s: "m:asc" })
    expect(syncStorage.p0c.length).toEqual(7)
  })

  it("local storage has one backup", async () => {
    await checkStorage()
    const localStorage = await browser.storage.local.get()

    expect(
      Object.keys(localStorage).filter((key) => /^backup[0-9]+$/.test(key)).length,
    ).toStrictEqual(1)
  })
})

describe("old store v24", () => {
  beforeEach(async () => {
    // Reset the in-memory state before every test
    fakeBrowser.reset()
    // set test object
    await browser.storage.sync.set(storeV24)
  })

  it("we can get correct last color", async () => {
    const history = await syncExtStorage.getItem("history")
    expect(history.lc).toBe("#fcb040")
  })

  it("checkStorage returns true", async () => {
    const check = await checkStorage()
    expect(check).toBe(true)
  })
})

describe("old store v13", () => {
  beforeEach(async () => {
    // Reset the in-memory state before every test
    fakeBrowser.reset()
    // set test object
    await browser.storage.sync.set(storeV13)
  })

  it("we can get correct last color", async () => {
    const history = await syncExtStorage.getItem("history")
    expect(history.lc).toBe("#fcb040")
  })

  it("checkStorage returns true", async () => {
    const check = await checkStorage()
    expect(check).toBe(true)
  })
})

describe("old store v24 two palettes", () => {
  beforeEach(async () => {
    // Reset the in-memory state before every test
    fakeBrowser.reset()
    // set test object
    await browser.storage.sync.set(storeV24TwoPalettes)
  })

  it("we can get correct last color", async () => {
    const history = await syncExtStorage.getItem("history")
    expect(history.lc).toBe("#56aba6")
  })

  it("checkStorage returns true", async () => {
    const check = await checkStorage()
    expect(check).toBe(true)
  })
})
