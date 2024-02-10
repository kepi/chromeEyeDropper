import { afterEach, describe, expect, test } from "vitest"
import "../background"
import {
  campaign,
  december,
  january,
  oldCorrect,
  oldWrong,
  newAlreadyOpened,
  newNotOpened,
  oldNotOpened,
  oldAlreadyOpened,
} from "./campaign-history.data"

const setData = (data: any) => {
  localStorage.setItem("campaigns", JSON.stringify(data))
}

describe("Campaign history", () => {
  afterEach(() => {
    localStorage.clear()
  })

  describe("localStorage", () => {
    test("I can store something in localStorage", () => {
      setData("something")
    })
  })

  describe("getCampaignHistory", () => {
    test.each([
      { desc: "oldCorrect", data: oldCorrect, expected: [december, january] },
      { desc: "oldWrong", data: { maxai202312: january }, expected: [january] },
      {
        desc: "newAlreadyOpened",
        data: [december, january],
        expected: [december, january],
      },
    ])("correct object is returned $desc", ({ data, expected }) => {
      setData(data)
      expect(bg.getCampaignHistory()).toStrictEqual(expected)
    })
  })

  describe("wasCampaignOpened", () => {
    test.each([
      { desc: "old correct opened", data: oldCorrect, expected: true },
      { desc: "old opened", data: oldAlreadyOpened, expected: true },
      { desc: "new opened", data: newAlreadyOpened, expected: true },
      { desc: "new not opened", data: newNotOpened, expected: false },
      { desc: "old not opened", data: oldNotOpened, expected: false },
      {
        desc: "manual not opened",
        data: [december, december, december],
        expected: false,
      },
      {
        desc: "manual opened",
        data: [december, december, january, december],
        expected: true,
      },
    ])("$desc", ({ data, expected }) => {
      setData(data)
      expect(bg.wasCampaignOpened(campaign)).toBe(expected)
    })

    test("wrong campaign has already been opened", () => {
      setData(oldWrong)
      expect(bg.wasCampaignOpened(campaign)).toBe(true)
    })
  })

  describe("addCampaignToHistory", () => {
    describe("add current campaign to history", () => {
      const date = new Date()
      bg.addCampaignToHistory(campaign)
      const items = bg.getCampaignHistory()
      const item = items[0]

      test("history length is 1", () => {
        expect(items.length).toStrictEqual(1)
      })

      test("id is same", () => {
        expect(item.id).toStrictEqual(campaign.id)
      })
      test("url is same", () => {
        expect(item.url).toStrictEqual(campaign.url)
      })
      test("type is onUpdate", () => {
        expect(item.type).toStrictEqual("onUpdate")
      })
      test("date is OK", () => {
        expect(new Date(item.date).getTime()).toBeGreaterThanOrEqual(
          date.getTime()
        )
      })
    })
  })
})
