/**
 * Move item in array from one position to another
 *
 * @remarks
 * immutable. Position is index in array - starting from 0.
 *
 * @returns array with item moved
 *
 * */
export const arrayMoveItem = (ids: number[], oldIndex: number, newIndex: number) => {
  return ids.toSpliced(oldIndex, 1).toSpliced(newIndex, 0, ids[oldIndex])
}

export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength - 1).trim() + "…" : text
}

export type TabName = {
  id: number
  name: string
}

export const visibleTabNames = (tabNames: TabName[]) => {
  const maxChars = 38
  const shortLength = 8
  const maxTabs = 10

  const sumChars = tabNames.reduce((acc, t) => acc + t.name.length + 3, 0)

  // limit to max tabs in all cases
  if (tabNames.length > maxTabs) {
    tabNames = tabNames.toSpliced(maxTabs)
  }

  // we can display everything
  if (sumChars <= maxChars) {
    return tabNames
  }

  const sumCharsShortable = tabNames.reduce(
    (acc, t) => acc + 3 + (t.name.length > shortLength ? shortLength : t.name.length),
    0,
  )

  if (sumCharsShortable <= maxChars) {
    return tabNames.map((t) => ({ id: t.id, name: truncate(t.name, shortLength) }))
  } else {
    let visible: TabName[] = []
    let sum = 0

    tabNames.forEach((t) => {
      const truncated = truncate(t.name, shortLength)
      sum += truncated.length

      if (sum > maxChars) {
        return visible
      }

      visible.push({ id: t.id, name: truncated })
    })

    return visible
  }
}
