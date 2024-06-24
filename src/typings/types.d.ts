declare interface Color {
  r: number
  g: number
  b: number
  alpha: number
  rgbhex?: string
  opposite?: string
}

type EdropperOptions = {
  cursor: "default" | "crosshair"
  enableColorToolbox: boolean
  enableColorTooltip: boolean
  enableRightClickDeactivate: boolean
}

// Types for data conversions from old versions and tests
type V24PaletteItem = {
  f: number
  h: string
  n: string
  s: number
  // it should be number only but for sake of prev14 error...
  t: number | Function
  d?: number
}

type V24Palette = {
  c: V24PaletteItem[]
  t: number
}

type V24Data = {
  history: {
    cp: string
    lc: string
    v: number
  }
  [key: `palette\.${string}`]: V24Palette
  settings: {
    autoClipboard: boolean
    autoClipboardNoGrid: boolean
    dropperCursor: string
    enableColorToolbox: boolean
    enableColorTooltip: boolean
    enablePromoOnUpdate: boolean
    enableRightClickDeactivate: boolean
    plus: boolean
    plus_type: any
  }
}

declare interface SortableEvent extends Event {
  clone: HTMLElement
  /**
   * previous list
   */
  from: HTMLElement
  /**
   * dragged element
   */
  item: HTMLElement
  /**
   * dragged elements
   */
  items: HTMLElement[]
  /**
   * new index within parent
   */
  newIndex: number | undefined
  /**
   * old index within parent
   */
  oldIndex: number | undefined
  target: HTMLElement
  /**
   * list, in which moved element.
   */
  to: HTMLElement
  /**
   * Old index within parent, only counting draggable elements
   */
  oldDraggableIndex: number | undefined
  /**
   * New index within parent, only counting draggable elements
   */
  newDraggableIndex: number | undefined
  /**
   * Pull mode if dragging into another sortable
   */
  pullMode: "clone" | boolean | undefined
  /**
   * When MultiDrag is used to sort, this holds a HTMLElement and oldIndex for each item selected.
   *
   * `oldIndicies[number]` is directly related to `newIndicies[number]`
   *
   * If MultiDrag is not used to sort, this array will be empty.
   */
  oldIndicies: Array<{ multiDragElement: HTMLElement; index: number }>
  /**
   * When MultiDrag is used to sort, this holds a HTMLElement and newIndex for each item.
   *
   * `oldIndicies[number]` is directly related to `newIndicies[number]`
   *
   * If MultiDrag is not used to sort, this array will be empty.
   */
  newIndicies: Array<{ multiDragElement: HTMLElement; index: number }>
  /** When Swap is used to sort, this will contain the dragging item that was dropped on.*/
  swapItem: HTMLElement | null
}
