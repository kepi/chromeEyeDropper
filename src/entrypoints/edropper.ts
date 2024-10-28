import browser from "webextension-polyfill"
import scrollStop from "~/vendor/scrollStop"
import Overlay from "~/overlay"
import Rect from "~/rect"
import { paletteColorToClipboard } from "~/palette"
import { onMessage, sendMessage } from "~/messaging"

var EDROPPER_VERSION = 14
var CANVAS_MAX_SIZE = 32767 - 20
var page = {
  width: 0,
  height: 0,

  screenWidth: 0,
  screenHeight: 0,
  xOffset: 0,
  yOffset: 0,

  overlay: {} as Overlay,

  options: {
    cursor: "default",
    enableColorToolbox: true,
    enableColorTooltip: true,
    enableRightClickDeactivate: true,
  } as EdropperOptions,

  canvas: {} as HTMLCanvasElement,
  canvasData: {} as ImageData["data"],
  canvasContext: {} as CanvasRenderingContext2D | null,
  canvasBorders: 20,
  imageData: null as string | null,
  resetCanvas: true,

  rects: [] as Array<Rect>,

  screenshoting: false,
  dropperActivated: false,

  shortcutsUnsubscribe: () => {},

  // function to set defaults - used during init and later for reset
  defaults: function () {
    page.screenWidth = window.innerWidth
    page.screenHeight = window.innerHeight

    page.canvas = document.createElement("canvas")
    page.resetCanvas = true
    page.rects = []
    page.screenshoting = false
    page.width = Math.round(document.documentElement.scrollWidth)
    page.height = Math.round(document.documentElement.scrollHeight)

    // TODO: check if this is needed
    if (page.width > CANVAS_MAX_SIZE) {
      page.width = CANVAS_MAX_SIZE
      console.warn("Page width is larger then maximum Canvas width.")
    }
    if (page.height > CANVAS_MAX_SIZE) {
      page.height = CANVAS_MAX_SIZE
      console.warn("Page height is larger then maximum Canvas height.")
    }
  },

  // ---------------------------------
  // MESSAGING
  // ---------------------------------
  messageListener: function () {
    onMessage("getVersion", () => {
      return EDROPPER_VERSION
    })

    onMessage("pickupActivate", (message) => {
      page.options = message.data
      page.dropperActivate()
      return { status: "ok" }
    })

    onMessage("pickupDeactivate", () => {
      page.dropperDeactivate()
    })
  },
  // ---------------------------------
  // DROPPER CONTROL
  // ---------------------------------
  dropperActivate: function () {
    console.log("?")
    if (page.dropperActivated) return

    console.log("dropper: activating page dropper")
    console.log(`dropper: debug page at ${browser.runtime.getURL("debug-tab.html")}`)
    page.defaults()

    page.overlay = new Overlay({
      width: page.width,
      height: page.height,
      enableToolbox: page.options.enableColorToolbox,
      enableTooltip: page.options.enableColorTooltip,
      cursor: page.options.cursor,
    })

    page.dropperActivated = true
    page.screenChanged()
    // set listeners
    scrollStop(page.onScrollStop)
    document.addEventListener("mousemove", page.onMouseMove, false)
    document.addEventListener("click", page.onMouseClick, false)
    if (page.options.enableRightClickDeactivate === true) {
      document.addEventListener("contextmenu", page.onContextMenu, false)
    }
    // enable keyboard shortcuts
    page.shortcuts(true)
  },
  dropperDeactivate: function () {
    if (!page.dropperActivated) return
    // disable keyboard shortcuts
    page.shortcuts(false)

    page.dropperActivated = false
    console.log("dropper: deactivating page dropper")
    document.removeEventListener("mousemove", page.onMouseMove, false)
    document.removeEventListener("click", page.onMouseClick, false)
    if (page.options.enableRightClickDeactivate === true) {
      document.removeEventListener("contextmenu", page.onContextMenu, false)
    }

    scrollStop(page.onScrollStop, "stop")

    page.overlay.deactivate()
  },
  // ---------------------------------
  // EVENT HANDLING
  // ---------------------------------
  onMouseMove: function (e: MouseEvent) {
    if (!page.dropperActivated) return
    page.tooltip(e)
  },
  onMouseClick: function (e: MouseEvent) {
    console.log("dropper: mouse click")
    console.dir(e)
    if (!page.dropperActivated) return
    e.preventDefault()
    page.dropperDeactivate()

    const x = e.pageX
    const y = e.pageY

    const color = page.pickColor(x, y)
    if (!color) {
      console.log(`picking color at ${x}, ${y} failed`)
      return
    }
    console.log(`dropper: click: ${x},${y}. Color: ${color.rgbhex}`)

    const hex = `#${color.rgbhex}`

    sendMessage("setColor", hex)

    paletteColorToClipboard(hex)
  },
  onScrollStop: function () {
    if (!page.dropperActivated) return
    console.log("dropper: scroll stopped")
    page.screenChanged()
  },
  onScrollStart: function () {
    if (!page.dropperActivated) return
  },
  shortcutsHandler: function (event: KeyboardEvent) {
    if (event.code === "Escape") {
      page.dropperDeactivate()
    } else if (event.code === "KeyU") {
      page.screenChanged(true)
    }
  },
  // keyboard shortcuts
  // enable with argument as true, disable with false
  shortcuts: function (start: boolean) {
    // enable shortcuts
    if (start == true) {
      addEventListener("keyup", page.shortcutsHandler)
      // disable shortcuts
    } else {
      removeEventListener("keyup", page.shortcutsHandler)
    }
  },
  // right click
  onContextMenu: function (e: MouseEvent) {
    if (!page.dropperActivated) return
    e.preventDefault()
    page.dropperDeactivate()
  },
  // window is resized
  onWindowResize: function () {
    if (!page.dropperActivated) return
    console.log("dropper: window resized or pixelRatio changed")
    // set defaults
    page.defaults()

    // call screen chaned
    page.screenChanged()
    page.overlay.resized({ width: page.width, height: page.height })
  },
  // ---------------------------------
  // MISC
  // ---------------------------------
  tooltip: function (e: MouseEvent) {
    if (!page.dropperActivated || page.screenshoting) return

    const x = e.pageX
    const y = e.pageY

    const color = page.pickColor(x, y)
    if (!color) return
    console.log(`dropper: move: ${x},${y}. Color: ${color.rgbhex}`)

    page.overlay.tooltip({
      screenWidth: page.screenWidth,
      screenHeight: page.screenHeight,
      x,
      y,
      color,
    })
  },

  // ---------------------------------
  // COLORS
  // ---------------------------------
  pickColor: function (x_coord: number, y_coord: number) {
    const x = Math.round(x_coord)
    const y = Math.round(y_coord)

    if (page.canvasData === null) return
    const redIndex = y * page.canvas.width * 4 + x * 4

    let color: Color = {
      r: page.canvasData[redIndex],
      g: page.canvasData[redIndex + 1],
      b: page.canvasData[redIndex + 2],
      alpha: page.canvasData[redIndex + 3],
    }
    color.rgbhex = page.rgbToHex(color.r, color.g, color.b)
    color.opposite = page.rgbToHex(255 - color.r, 255 - color.g, 255 - color.b)
    return color
  },
  // i: color channel value, integer 0-255
  // returns two character string hex representation of a color channel (00-FF)
  toHex: function (i: number) {
    // TODO this shouldn't happen; looks like offset/x/y might be off by one
    if (i === undefined) {
      console.error(`Wrong color channel value: ${i}. Can't convert to hex.`)
      return "ff"
    }
    var str = i.toString(16)
    while (str.length < 2) {
      str = "0" + str
    }
    return str
  },
  // r,g,b: color channel value, integer 0-255
  // returns six character string hex representation of a color
  rgbToHex: function (r: number, g: number, b: number) {
    return `${page.toHex(r)}${page.toHex(g)}${page.toHex(b)}`
  },
  // ---------------------------------
  // UPDATING SCREEN
  // ---------------------------------
  checkCanvas: function () {
    const scale = window.devicePixelRatio

    // we have to create new canvas element
    if (page.resetCanvas || page.canvas.width != page.width || page.canvas.height != page.height) {
      page.canvas = document.createElement("canvas")
      page.canvas.width = page.width
      page.canvas.height = page.height

      console.log(
        `dropper: creating new canvas ${page.canvas.width}x${page.canvas.height}. Pixel Ratio: ${window.devicePixelRatio}. Page dimension: ${page.width}x${page.height}`,
      )

      page.canvasContext = page.canvas.getContext("2d")
      page.canvasContext?.scale(1 / scale, 1 / scale)
      page.rects = []
      page.resetCanvas = false
    }
  },
  setScreenshoting: function (state: boolean) {
    if (page.screenshoting && state) {
      return
    }
    page.screenshoting = state
    page.overlay.screenshoting(state)
  },
  screenChanged: function (force = false) {
    if (!page.dropperActivated) return
    console.log("dropper: screenChanged")
    page.yOffset = Math.round(document.documentElement.scrollTop)
    page.xOffset = Math.round(document.documentElement.scrollLeft)

    const rect = new Rect(page.xOffset, page.yOffset, page.screenWidth, page.screenHeight)

    console.group(`comparing rect ${rect} with [ ${page.rects.join(", ")} ]`)
    // don't screenshot if we already have this one
    if (!force && page.rects.length > 0) {
      for (let r of page.rects) {
        if (r.contains(rect)) {
          console.log("dropper: already shoted, skipping")
          console.groupEnd()
          return
        }
      }
    }
    console.groupEnd()

    page.setScreenshoting(true)
    setTimeout(async () => {
      const data = await sendMessage("capture", undefined)

      if (data) {
        console.log("got data")
        page.imageData = data
        page.capture()
      }
    }, 50)
  },

  updateRects: function (rect: Rect) {
    console.group("updateRects")

    if (page.rects.length === 0) {
      page.rects.push(rect)
      console.log("no rects yet, pushing first")
      console.groupEnd()
      return
    }

    let merged = false

    page.rects.forEach((r, i) => {
      console.group(`Trying merge ${rect} with ${r}`)
      let t = rect.merge(r)
      if (t !== null) {
        console.log("merged")
        merged = true
        page.rects.splice(i, 1)
        page.updateRects(t)
      }
      console.groupEnd()
    })

    if (!merged) {
      console.log("dropper: pushing merged to rects")
      page.rects.push(rect)
    }

    console.groupEnd()
  },

  // capture actual Screenshot
  capture: function () {
    console.group("capture")
    page.checkCanvas()

    console.log("dropper: creating image element and waiting on load")
    var image = document.createElement("img")
    image.onload = function () {
      if (!page.canvas || !page.canvasContext) {
        console.error("Page canvas should be initialized but it isn't.")
        return
      }
      console.log(`dropper: got new screenshot ${image.width}x${image.height}`)

      const rect = new Rect(
        page.xOffset,
        page.yOffset,
        Math.round(image.width / window.devicePixelRatio),
        Math.round(image.height / window.devicePixelRatio),
      )
      page.updateRects(rect)

      // we changed scale of canvasContext and image data are parsed accroding to this
      // but unfortunately not sx,sy dimensions so we need to adjust them
      const scale = window.devicePixelRatio
      const sx = page.xOffset * scale
      const sy = page.yOffset * scale

      console.log(
        `dropper: drawing image at ${page.xOffset},${page.yOffset} and internally at ${sx},${sy}`,
      )
      page.canvasContext.drawImage(image, sx, sy)

      // get whole canvas data
      page.canvasData = page.canvasContext.getImageData(
        0,
        0,
        page.canvas.width,
        page.canvas.height,
      ).data

      page.setScreenshoting(false)

      // if (DEV_MODE) {
      //   page.sendMessage({ type: "debug-tab", image: page.canvas.toDataURL() })
      // }
    }
    if (page.imageData) {
      image.src = page.imageData
    } else {
      console.error("ed: no imageData")
    }

    console.groupEnd()
  },
  init: function () {
    console.log(`edropper ${EDROPPER_VERSION} init`)
    page.messageListener()

    window.onresize = function () {
      page.onWindowResize()
    }

    // TODO: would be probably better to call onWindowResize within some time range so we don't
    // spam this when user is i.e actively zooming in
    const mqString = `(resolution: ${window.devicePixelRatio}dppx)`
    const mqList = matchMedia(mqString)
    mqList.addEventListener("change", page.onWindowResize)
  },
}

export default defineUnlistedScript(() => {
  page.init()
})
