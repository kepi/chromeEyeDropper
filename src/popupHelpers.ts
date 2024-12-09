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
