import { createNode } from './helpers'
import Color from './Color.d'

class Overlay {
    el: HTMLElement
    enableToolbox: boolean = true
    enableTooltip: boolean = true
    cursor: string

    _toolbox: ToolBox
    _tooltip: ToolTip

    tools: Array<Tool> = []

    constructor(args: { enableToolbox: boolean; enableTooltip: boolean; cursor: string }) {
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
        this.el = createNode('div', {
            id: 'eye-dropper-overlay',
            style: [
                'position: absolute',
                `width: ${document.documentElement.scrollWidth}px`,
                `height: ${document.documentElement.scrollHeight}px`,
                'opacity: 1',
                'background: none',
                'border: none',
                'z-index: 5000',
            ].join(';'),
        })

        for (let tool of this.tools) {
            this.el.append(tool.el)
        }

        document.body.prepend(this.el)
    }

    hook(hook, args) {
        for (let tool of this.tools) {
            tool[hook](args)
        }
    }

    screenshoting(state: boolean): void {
        if (state) {
            console.log('overlay: screenshoting on. Hiding tools.')
            this.hook('hookHide', {})
            this.el.style.cursor = 'progress'
        } else {
            console.log('overlay: screenshoting off. Showing tools.')
            this.hook('hookShow', {})
            this.el.style.cursor = this.cursor
            // TODO - set new tooltip color - where from without event?
        }
    }

    resized() {
        // also don't forget to set overlay
        this.el.style.width = `${document.documentElement.scrollWidth}px`
        this.el.style.height = `${document.documentElement.scrollHeight}px`
    }

    deactivate() {
        // remove tools
        this.hook('hookDeactivate', {})
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
        const yOffset = document.documentElement.scrollTop
        const xOffset = document.documentElement.scrollLeft

        // set tooltip
        if (this.enableTooltip === true) {
            let fromTop = args.x - xOffset > args.screenWidth / 2 ? -20 : -15
            let fromLeft = args.y - yOffset < args.screenHeight / 2 ? 15 : 10

            this.hook('hookColor', {
                color: args.color,
                x: args.x,
                y: args.y,
                top: fromTop,
                left: fromLeft,
            })
        }
    }
}

class Tool {
    el: HTMLElement
    color: Color

    constructor() {}

    hookColor(args) {
        this.color = args.color
    }

    hookDeactivate(args) {
        this.el.remove()
    }

    hookShow(args) {
        this.el.style.display = ''
    }

    hookHide(args) {
        this.el.style.display = 'none'
    }
}

class ToolTip extends Tool {
    constructor() {
        super()

        this.el = createNode('div', {
            id: 'color-tooltip',
            style: [
                'z-index: 1000',
                'color: black',
                'position: absolute',
                'display: none',
                'font-size: 15px',
                'border: 1px solid black',
                'width: 10px',
                'height: 10px',
            ].join(';'),
        })
    }

    hookColor(args) {
        super.hookColor(args)

        this.el.style.backgroundColor = `#${args.color.rgbhex}`
        this.el.style.borderColor = `#${args.color.opposite}`
        this.el.style.top = `${args.y + args.top}px`
        this.el.style.left = `${args.x + args.left}px`
    }
}

class ToolBox extends Tool {
    elColor: HTMLElement
    elText: HTMLElement

    constructor() {
        super()

        this.el = createNode('div', {
            id: 'color-toolbox',
            style: [
                'z-index: 1000',
                'color: black',
                'position: absolute',
                'display: none',
                'font-size: 15px',
                'border: 1px solid black',
                'width: 160px',
                'height: 42px',
                'bottom: 4px',
                'right: 4px',
                'border-radius: 2px',
                '-webkit-box-shadow: 2px 2px 0px rgba(0,0,128,0.25)',
                'background-image: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#0f0f0f), to(#3f3f3f))',
                'color: white',
                'font-family: monospace',
                'border: 1px solid transparent',
                'position: fixed',
            ].join(';'),
        })
        this.elColor = createNode('div', {
            id: 'color-toolbox-color',
            style: [
                'width: 32px',
                'height: 32px',
                'margin: 4px',
                'margin-right: 8px',
                'float: left',
                'border: 1px solid white',
                'background-color: #ffbbca',
            ].join(';'),
        })
        this.elText = createNode('div', {
            id: 'color-toolbox-text',
            style: [
                'font-size: 11px',
                'padding: 5px 0px',
                'overflow: hidden',
                'text-align: center',
                'color: white',
            ].join(';'),
        })
        this.el.append(this.elColor)
        this.el.append(this.elText)
    }

    hookColor(args) {
        super.hookColor(args)

        this.elText.innerHTML = `#${this.color.rgbhex}<br/>rgb(${this.color.r},${this.color.g},${this.color.b})`
        this.elColor.style.backgroundColor = `#${this.color.rgbhex}`
    }
}

export default Overlay
