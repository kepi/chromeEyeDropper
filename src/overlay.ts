import { createNode } from "./helpers"

class Overlay {
  el: HTMLElement
  private cursor: string

  private _toolbox: ToolBox
  private _tooltip: ToolTip

  tools: Array<Tool> = []

  constructor(args: {
    width: number
    height: number
    enableToolbox: boolean
    enableTooltip: boolean
    cursor: string
  }) {
    console.log(
      `overlay: Enabling overlay ${args.width}x${args.height} with cursor ${args.cursor}`
    )
    // set options
    this.cursor = args.cursor

    // toolbox
    if (args.enableToolbox) {
      this._toolbox = new ToolBox()
      this.tools.push(this._toolbox)
    }

    // tooltip
    if (args.enableTooltip) {
      this._tooltip = new ToolTip()
      this.tools.push(this._tooltip)
    }

    // create element
    this.el = createNode("div", {
      id: "eye-dropper-overlay",
      style: [
        "position: absolute",
        `width: ${args.width}px`,
        `height: ${args.height}px`,
        "opacity: 1",
        "background: none",
        "border: none",
        "z-index: 1000001",
      ].join(";"),
    })

    for (let tool of this.tools) {
      this.el.append(tool.el)
    }

    document.body.prepend(this.el)
  }

  hook(hook: string, args: any) {
    for (let tool of this.tools) {
      tool[hook](args)
    }
  }

  screenshoting(state: boolean): void {
    if (state) {
      console.log("overlay: screenshoting on. Hiding tools.")
      this.hook("hookHide", {})
      this.el.style.cursor = "progress"
    } else {
      console.log("overlay: screenshoting off. Showing tools.")
      this.hook("hookShow", {})
      this.el.style.cursor = this.cursor
      // TODO - set new tooltip color - where from without event?
    }
  }

  resized(args: { width: number; height: number }) {
    console.log(`overlay: Resizing overlay ${args.width}x${args.height}`)

    // also don't forget to set overlay
    this.el.style.width = `${args.width}px`
    this.el.style.height = `${args.height}px`
  }

  deactivate() {
    // remove tools
    this.hook("hookDeactivate", {})
    // remove overlay

    // FIXME: kdyz odstranime tak asi neni nutny menit kurzor ne?
    // page.elOverlay.style.cursor = 'default'
    this.el.remove()
  }

  tooltip(args: {
    screenWidth: number
    screenHeight: number
    x: number
    y: number
    color: Color
  }) {
    this.hook("hookColor", args)
  }
}

abstract class Tool {
  el: HTMLElement
  color: Color
  x: number
  y: number

  constructor() {}

  hookColor(args: { color: any; x: number; y: number }) {
    this.color = args.color
    this.x = args.x
    this.y = args.y
  }

  hookDeactivate(_args: {}) {
    this.el.remove()
  }

  hookShow(_args: {}) {
    this.el.style.display = ""
  }

  hookHide(_args: {}) {
    this.el.style.display = "none"
  }
}

class ToolTip extends Tool {
  constructor() {
    super()

    this.el = createNode("div", {
      id: "color-tooltip",
      style: [
        "z-index: 1000001",
        "color: black",
        "position: absolute",
        "display: none",
        "font-size: 15px",
        "border: 1px solid black",
        "width: 10px",
        "height: 10px",
      ].join(";"),
    })
  }

  hookColor(args: {
    color: any
    x: number
    y: number
    screenWidth: number
    screenHeight: number
  }) {
    super.hookColor(args)

    // offset is used for positioning element on screen
    const yOffset = Math.round(document.documentElement.scrollTop)
    const xOffset = Math.round(document.documentElement.scrollLeft)

    let fromTop = args.y - yOffset > args.screenHeight / 2 ? -15 : 20
    let fromLeft = args.x - xOffset < args.screenWidth / 2 ? 15 : -30

    this.el.style.backgroundColor = `#${args.color.rgbhex}`
    this.el.style.borderColor = `#${args.color.opposite}`
    this.el.style.top = `${args.y + fromTop}px`
    this.el.style.left = `${args.x + fromLeft}px`
  }
}

class ToolBox extends Tool {
  elColor: HTMLElement
  elText: HTMLElement

  constructor() {
    super()

    this.el = createNode("div", {
      id: "color-toolbox",
      style: [
        "z-index: 1000001",
        "color: black",
        "position: absolute",
        "display: none",
        "font-size: 15px",
        "border: 1px solid black",
        "width: 160px",
        "height: 42px",
        "bottom: 4px",
        "right: 4px",
        "border-radius: 2px",
        "-webkit-box-shadow: 2px 2px 0px rgba(0,0,128,0.25)",
        "background-image: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#0f0f0f), to(#3f3f3f))",
        "color: white",
        "font-family: monospace",
        "border: 1px solid transparent",
        "position: fixed",
      ].join(";"),
    })
    this.elColor = createNode("div", {
      id: "color-toolbox-color",
      style: [
        "width: 32px",
        "height: 32px",
        "margin: 4px",
        "margin-right: 8px",
        "float: left",
        "border: 1px solid white",
        "background-color: #ffbbca",
      ].join(";"),
    })
    this.elText = createNode("div", {
      id: "color-toolbox-text",
      style: [
        "font-size: 11px",
        "padding: 5px 0px",
        "overflow: hidden",
        "text-align: center",
        "color: white",
      ].join(";"),
    })
    this.el.append(this.elColor)
    this.el.append(this.elText)
  }

  hookColor(args: {
    color: any
    x: number
    y: number
    top: number
    left: number
  }) {
    super.hookColor(args)

    let debug_info = DEV_MODE
      ? `<div style="font-size: 0.8em">coord: ${args.x},${args.y}</div>`
      : ""

    this.elText.innerHTML = `#${this.color.rgbhex}<br/>rgb(${this.color.r},${this.color.g},${this.color.b})${debug_info}`
    this.elColor.style.backgroundColor = `#${this.color.rgbhex}`
  }
}

export default Overlay
