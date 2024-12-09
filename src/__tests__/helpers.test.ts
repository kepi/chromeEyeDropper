import { arrayMoveItem } from "@/helpers"
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
