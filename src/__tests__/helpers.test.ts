import { arrayMoveItem, type TabName, visibleTabNames } from "~/popupHelpers"
import { test, describe, expect } from "vitest"

describe("arrayMoveItem", () => {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  type Inputs = [string, number, number, number[]][]
  const inputs: Inputs = [
    ["no change when 0 to 0", 0, 0, ids],
    ["second to first", 1, 0, [2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
    ["first to last", 0, 10, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1]],
    ["id 6 to second", 5, 1, [1, 6, 2, 3, 4, 5, 7, 8, 9, 10, 11]],
    // ["", , , [1,2,3,4,5,6,7,8,9,10,11]],
  ]

  test.each(inputs)("%s", (_name, a, b, res) => {
    const changed = arrayMoveItem(ids, a, b)
    expect(changed).toStrictEqual(res)
  })
})

describe("getTabs", () => {
  const tabNamesSingle: TabName[] = [{ id: 0, name: "default" }]

  const tabNamesShort: TabName[] = [
    { id: 0, name: "default" },
    { id: 2, name: "short" },
    { id: 3, name: "💩" },
    { id: 5, name: "🐕" },
  ]

  const tabNamesSingleLong: TabName[] = [
    { id: 0, name: "really really long name of tab which should be shorten in all cases" },
  ]

  const resTabNamesSingleLong: TabName[] = [{ id: 0, name: "really…" }]

  const tabNamesShortable: TabName[] = [
    { id: 0, name: "default" },
    { id: 1, name: "really long name of tab" },
    { id: 2, name: "short" },
    { id: 3, name: "💩" },
    { id: 4, name: "another really long name of tab" },
    { id: 5, name: "🐕" },
    { id: 6, name: "one" },
    { id: 7, name: "two" },
  ]

  const resTabNamesShortable: TabName[] = [
    { id: 0, name: "default" },
    { id: 1, name: "really…" },
    { id: 2, name: "short" },
    { id: 3, name: "💩" },
    { id: 4, name: "another…" },
    { id: 5, name: "🐕" },
    { id: 6, name: "one" },
    { id: 7, name: "two" },
  ]

  const tabNamesLong: TabName[] = [
    { id: 0, name: "default" },
    { id: 1, name: "really really long name of tab" },
    { id: 2, name: "short" },
    { id: 3, name: "💩" },
    { id: 4, name: "another really long name of tab" },
    { id: 5, name: "🐕" },
    { id: 6, name: "one" },
    { id: 7, name: "two" },
    { id: 8, name: "three" },
    { id: 9, name: "four" },
    { id: 10, name: "five" },
    { id: 11, name: "six" },
  ]

  const resTabNamesLong: TabName[] = [
    { id: 0, name: "default" },
    { id: 1, name: "really…" },
    { id: 2, name: "short" },
    { id: 3, name: "💩" },
    { id: 4, name: "another…" },
    { id: 5, name: "🐕" },
    { id: 6, name: "one" },
    { id: 7, name: "two" },
  ]

  type Inputs = [string, TabName[], TabName[]][]

  const inputs: Inputs = [
    ["singleTab", tabNamesSingle, tabNamesSingle],
    ["singleTab but too long", tabNamesSingleLong, resTabNamesSingleLong],
    ["short tabs", tabNamesShort, tabNamesShort],
    ["longer tabs but shortable names", tabNamesShortable, resTabNamesShortable],
    ["too long tabs", tabNamesLong, resTabNamesLong],
  ]

  test.each(inputs)("%s", (_name, tabNames, resTabNames) => {
    const visible = visibleTabNames(tabNames)
    expect(visible).toStrictEqual(resTabNames)
  })
})
