import shortcut from "./vendor/shortcut"
import scrollStop from "./vendor/scrollStop"
import Overlay from "./overlay"
import Rect from "./rect"
import { copyToClipboard } from "./clipboard"

var EDROPPER_VERSION = 13
var CANVAS_MAX_SIZE = 32767 - 20
var page = {
  width: 0,
  height: 0,

  screenWidth: 0,
  screenHeight: 0,
  xOffset: 0,
  yOffset: 0,

  overlay: null as Overlay,

  options: {
    cursor: "default",
    enableColorToolbox: true,
    enableColorTooltip: true,
    enableRightClickDeactivate: true,
    autoClipboard: false,
    autoClipboardNoGrid: false,
  },

  canvas: null,
  canvasData: null,
  canvasContext: null,
  canvasBorders: 20,
  imageData: null,
  resetCanvas: true,

  rects: [] as Array<Rect>,

  screenshoting: false,
  dropperActivated: false,

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
    // Listen for pickup activate
    console.log("dropper: page activated")
    console.log(
      `dropper: debug page at ${chrome.runtime.getURL("debug-tab.html")}`
    )
    chrome.runtime.onMessage.addListener(function (req, _sender, sendResponse) {
      switch (req.type) {
        case "edropper-version":
          sendResponse({
            version: EDROPPER_VERSION,
            tabid: req.tabid,
          })
          break
        case "pickup-activate":
          page.options = req.options
          page.dropperActivate()
          break
        case "pickup-deactivate":
          page.dropperDeactivate()
          break
        case "update-image":
          console.log("dropper: background send me updated screenshot")
          page.imageData = req.data
          page.capture()
          break
      }
    })
  },
  sendMessage: function (message: any) {
    chrome.runtime.connect().postMessage(message)
  },
  // ---------------------------------
  // DROPPER CONTROL
  // ---------------------------------
  dropperActivate: function () {
    if (page.dropperActivated) return

    console.log("dropper: activating page dropper")
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
    console.log(`dropper: click: ${x},${y}. Color: ${color.rgbhex}`)

    if (page.options.autoClipboard) {
      const prefix = page.options.autoClipboardNoGrid ? "" : "#"
      copyToClipboard(`${prefix}${color.rgbhex}`)
    }

    page.sendMessage({
      type: "set-color",
      color,
    })
  },
  onScrollStop: function () {
    if (!page.dropperActivated) return
    console.log("dropper: scroll stopped")
    page.screenChanged()
  },
  onScrollStart: function () {
    if (!page.dropperActivated) return
  },
  // keyboard shortcuts
  // enable with argument as true, disable with false
  shortcuts: function (start: boolean) {
    // enable shortcuts
    if (start == true) {
      shortcut.add("Esc", function (_evt: KeyboardEvent) {
        page.dropperDeactivate()
      })
      shortcut.add("U", function (_evt: KeyboardEvent) {
        page.screenChanged(true)
      })
      // disable shortcuts
    } else {
      shortcut.remove("U")
      shortcut.remove("Esc")
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
    if (
      page.resetCanvas ||
      page.canvas.width != page.width ||
      page.canvas.height != page.height
    ) {
      page.canvas = document.createElement("canvas")
      page.canvas.width = page.width
      page.canvas.height = page.height

      console.log(
        `dropper: creating new canvas ${page.canvas.width}x${page.canvas.height}. Pixel Ratio: ${window.devicePixelRatio}. Page dimension: ${page.width}x${page.height}`
      )

      page.canvasContext = page.canvas.getContext("2d")
      page.canvasContext.scale(1 / scale, 1 / scale)
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

    const rect = new Rect(
      page.xOffset,
      page.yOffset,
      page.screenWidth,
      page.screenHeight
    )

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
    setTimeout(function () {
      page.sendMessage({
        type: "screenshot",
      })
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
      console.log(`dropper: got new screenshot ${image.width}x${image.height}`)

      const rect = new Rect(
        page.xOffset,
        page.yOffset,
        Math.round(image.width / window.devicePixelRatio),
        Math.round(image.height / window.devicePixelRatio)
      )
      page.updateRects(rect)

      // we changed scale of canvasContext and image data are parsed accroding to this
      // but unfortunately not sx,sy dimensions so we need to adjust them
      const scale = window.devicePixelRatio
      const sx = page.xOffset * scale
      const sy = page.yOffset * scale

      console.log(
        `dropper: drawing image at ${page.xOffset},${page.yOffset} and internally at ${sx},${sy}`
      )
      page.canvasContext.drawImage(image, sx, sy)

      // get whole canvas data
      page.canvasData = page.canvasContext.getImageData(
        0,
        0,
        page.canvas.width,
        page.canvas.height
      ).data

      page.setScreenshoting(false)

      if (DEV_MODE) {
        page.sendMessage({ type: "debug-tab", image: page.canvas.toDataURL() })
      }
    }
    if (page.imageData) {
      image.src = page.imageData
    } else {
      console.error("ed: no imageData")
    }

    console.groupEnd()
  },
  init: function () {
    page.messageListener()

    window.onresize = function () {
      page.onWindowResize()
    }

    // FIXME: implement device pixel ration changes same as scrollstop
    // with some timeout so it works ok during zoom change i.e.
    const mqString = `(resolution: ${window.devicePixelRatio}dppx)`
    matchMedia(mqString).addListener(page.onWindowResize)
  },
}
page.init()
