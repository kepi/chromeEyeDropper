import shortcut from './vendor/shortcut'
import scrollStop from './scrollStop'
import { createNode } from './helpers'

interface Color {
    r: number
    g: number
    b: number
    alpha: number
    rgbhex?: string
    opposite?: string
}

var EDROPPER_VERSION = 11
var CANVAS_MAX_SIZE = 32767 - 20
var DEBUG = false
var page = {
    width: 0,
    height: 0,
    imageData: null,
    canvasBorders: 20,
    canvasData: null,
    dropperActivated: false,
    screenWidth: 0,
    screenHeight: 0,

    options: {
        cursor: 'default',
        enableColorToolbox: true,
        enableColorTooltip: true,
        enableRightClickDeactivate: true,
    },

    // Variables for later use
    elColorTooltip: null as HTMLElement,
    elColorToolbox: null as HTMLElement,
    elColorToolboxColor: null as HTMLElement,
    elColorToolboxText: null as HTMLElement,

    elOverlay: null as HTMLElement,

    XOffset: document.documentElement.scrollTop,
    YOffset: document.documentElement.scrollLeft,

    canvas: null,
    rects: null,
    screenshoting: false,
    canvasContext: null,

    // function to set defaults - used during init and later for reset
    defaults: function() {
        page.canvas = document.createElement('canvas')
        page.rects = []
        page.screenshoting = false
        page.width = document.documentElement.clientWidth
        page.height = document.documentElement.clientHeight
    },

    // ---------------------------------
    // MESSAGING
    // ---------------------------------
    messageListener: function() {
        // Listen for pickup activate
        console.log('dropper: page activated')
        chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
            switch (req.type) {
                case 'edropper-version':
                    sendResponse({
                        version: EDROPPER_VERSION,
                        tabid: req.tabid,
                    })
                    break
                case 'pickup-activate':
                    page.options = req.options
                    page.dropperActivate()
                    break
                case 'pickup-deactivate':
                    page.dropperDeactivate()
                    break
                case 'update-image':
                    console.log('dropper: background send me updated screenshot')
                    page.imageData = req.data
                    page.capture()
                    break
            }
        })
    },
    sendMessage: function(message) {
        chrome.runtime.connect().postMessage(message)
    },
    // ---------------------------------
    // DROPPER CONTROL
    // ---------------------------------
    dropperActivate: function() {
        if (page.dropperActivated) return

        // create overlay div
        page.elOverlay = createNode('div', {
            id: 'eye-dropper-overlay',
            style: [
                'position: absolute',
                `width: ${page.width}px`,
                `height: ${page.height}px`,
                'opacity: 1',
                'background: none',
                'border: none',
                'z-index: 5000',
            ].join(';'),
        })

        // insert tooltip and toolbox
        if (page.options.enableColorTooltip === true) {
            page.elColorTooltip = createNode('div', {
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
            page.elOverlay.append(page.elColorTooltip)
        }
        if (page.options.enableColorToolbox === true) {
            page.elColorToolbox = createNode('div', {
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
            page.elColorToolboxColor = createNode('div', {
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
            page.elColorToolboxText = createNode('div', {
                id: 'color-toolbox-text',
                style: [
                    'font-size: 11px',
                    'padding: 5px 0px',
                    'overflow: hidden',
                    'text-align: center',
                    'color: white',
                ].join(';'),
            })

            page.elColorToolbox.append(page.elColorToolboxColor)
            page.elColorToolbox.append(page.elColorToolboxText)

            page.elOverlay.append(page.elColorToolbox)
        }
        document.body.prepend(page.elOverlay)
        console.log('dropper: activating page dropper')
        page.defaults()
        page.dropperActivated = true
        page.screenChanged()
        // set listeners
        scrollStop(page.onScrollStop)
        document.addEventListener('mousemove', page.onMouseMove, false)
        document.addEventListener('click', page.onMouseClick, false)
        if (page.options.enableRightClickDeactivate === true) {
            document.addEventListener('contextmenu', page.onContextMenu, false)
        }
        // enable keyboard shortcuts
        page.shortcuts(true)
    },
    dropperDeactivate: function() {
        if (!page.dropperActivated) return
        // disable keyboard shortcuts
        page.shortcuts(false)
        // reset cursor changes
        page.elOverlay.style.cursor = 'default'

        page.dropperActivated = false
        console.log('dropper: deactivating page dropper')
        document.removeEventListener('mousemove', page.onMouseMove, false)
        document.removeEventListener('click', page.onMouseClick, false)
        if (page.options.enableRightClickDeactivate === true) {
            document.removeEventListener('contextmenu', page.onContextMenu, false)
        }

        scrollStop(page.onScrollStop, 'stop')

        if (page.options.enableColorTooltip === true) {
            page.elColorTooltip.remove()
        }
        if (page.options.enableColorToolbox === true) {
            page.elColorToolbox.remove()
        }
        page.elOverlay.remove()
    },
    // ---------------------------------
    // EVENT HANDLING
    // ---------------------------------
    onMouseMove: function(e) {
        if (!page.dropperActivated) return
        page.tooltip(e)
    },
    onMouseClick: function(e) {
        if (!page.dropperActivated) return
        e.preventDefault()
        page.dropperDeactivate()
        page.sendMessage({
            type: 'set-color',
            color: page.pickColor(e),
        })
    },
    onScrollStop: function() {
        if (!page.dropperActivated) return
        console.log('dropper: Scroll stop')
        page.screenChanged()
    },
    onScrollStart: function() {
        if (!page.dropperActivated) return
    },
    // keyboard shortcuts
    // enable with argument as true, disable with false
    shortcuts: function(start) {
        // enable shortcuts
        if (start == true) {
            shortcut.add('Esc', function(evt) {
                page.dropperDeactivate()
            })
            shortcut.add('U', function(evt) {
                page.screenChanged(true)
            })
            // disable shortcuts
        } else {
            shortcut.remove('U')
            shortcut.remove('Esc')
        }
    },
    // right click
    onContextMenu: function(e) {
        if (!page.dropperActivated) return
        e.preventDefault()
        page.dropperDeactivate()
    },
    // window is resized
    onWindowResize: function() {
        if (!page.dropperActivated) return
        console.log('dropper: window resized')
        // set defaults
        page.defaults()

        // also don't forget to set overlay
        page.elOverlay.style.width = `${page.width}px`
        page.elOverlay.style.height = `${page.height}px`

        // call screen chaned
        page.screenChanged()
    },
    // ---------------------------------
    // MISC
    // ---------------------------------
    tooltip: function(e: MouseEvent) {
        if (!page.dropperActivated || page.screenshoting) return
        var color = page.pickColor(e)
        // set tooltip
        if (page.options.enableColorTooltip === true) {
            let fromTop = e.pageX - page.XOffset > page.screenWidth / 2 ? -20 : -15
            let fromLeft = e.pageY - page.YOffset < page.screenHeight / 2 ? 15 : 10

            page.elColorTooltip.style.backgroundColor = `#${color.rgbhex}`
            page.elColorTooltip.style.borderColor = `#${color.opposite}`
            page.elColorTooltip.style.top = `${e.pageY + fromTop}px`
            page.elColorTooltip.style.left = `${e.pageX + fromLeft}px`
        }
        // set toolbox
        if (page.options.enableColorToolbox === true) {
            page.elColorToolboxText.innerHTML = `#${color.rgbhex}<br/>rgb(${color.r},${color.g},${color.b})`
            page.elColorToolboxColor.style.backgroundColor = `#${color.rgbhex}`
        }
    },
    // return true if rectangle A is whole in rectangle B
    rectInRect: function(A, B) {
        if (A.x >= B.x && A.y >= B.y && A.x + A.width <= B.x + B.width && A.y + A.height <= B.y + B.height) return true
        else return false
    },
    // found out if two points and length overlaps
    // and merge it if needed. Helper method for
    // rectMerge
    rectMergeGeneric: function(a, b, length) {
        // swap them if b is above a
        if (b < a) {
            ;[a, b] = [b, a]
        }
        // shapes are overlaping
        if (b <= a + length)
            return {
                a: a,
                length: b - a + length,
            }
        else return false
    },
    // merge same x or y positioned rectangles if overlaps
    // width (or height) of B has to be equal to A
    rectMerge: function(a, b) {
        var t
        // same x position and same width
        if (a.x == b.x && a.width == b.width) {
            t = page.rectMergeGeneric(a.y, b.y, a.height)
            if (t != false) {
                a.y = t.a
                a.height = length
                return a
            }
            // same y position and same height
        } else if (a.y == b.y && a.height == b.height) {
            t = page.rectMergeGeneric(a.x, b.x, a.width)
            if (t != false) {
                a.x = t.a
                a.width = length
                return a
            }
        }
        return false
    },
    // ---------------------------------
    // COLORS
    // ---------------------------------
    pickColor: function(e: MouseEvent) {
        if (page.canvasData === null) return
        var canvasIndex = (e.pageX + e.pageY * page.canvas.width) * 4
        ////console.log(e.pageX + ' ' + e.pageY + ' ' + page.canvas.width);
        let color: Color = {
            r: page.canvasData[canvasIndex],
            g: page.canvasData[canvasIndex + 1],
            b: page.canvasData[canvasIndex + 2],
            alpha: page.canvasData[canvasIndex + 3],
        }
        color.rgbhex = page.rgbToHex(color.r, color.g, color.b)
        color.opposite = page.rgbToHex(255 - color.r, 255 - color.g, 255 - color.b)
        return color
    },
    // i: color channel value, integer 0-255
    // returns two character string hex representation of a color channel (00-FF)
    toHex: function(i) {
        if (i === undefined) return 'FF' // TODO this shouldn't happen; looks like offset/x/y might be off by one
        var str = i.toString(16)
        while (str.length < 2) {
            str = '0' + str
        }
        return str
    },
    // r,g,b: color channel value, integer 0-255
    // returns six character string hex representation of a color
    rgbToHex: function(r, g, b) {
        return page.toHex(r) + page.toHex(g) + page.toHex(b)
    },
    // ---------------------------------
    // UPDATING SCREEN
    // ---------------------------------
    checkCanvas: function() {
        // we have to create new canvas element
        if (
            page.canvas.width != page.width + page.canvasBorders ||
            page.canvas.height != page.height + page.canvasBorders
        ) {
            console.log('dropper: creating new canvas')
            page.canvas = document.createElement('canvas')
            page.canvas.width = page.width + page.canvasBorders
            page.canvas.height = page.height + page.canvasBorders
            page.canvasContext = page.canvas.getContext('2d')
            page.canvasContext.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio)
            page.rects = []
        }
    },
    screenChanged: function(force = false) {
        if (!page.dropperActivated) return
        console.log('dropper: screenChanged')
        page.YOffset = document.documentElement.scrollTop
        page.XOffset = document.documentElement.scrollLeft
        var rect = {
            x: page.XOffset,
            y: page.YOffset,
            width: page.screenWidth,
            height: page.screenHeight,
        }
        // don't screenshot if we already have this one
        if (!force && page.rects.length > 0) {
            for (let index in page.rects) {
                if (page.rectInRect(rect, page.rects[index])) {
                    console.log('dropper: already shoted, skipping')
                    return
                }
            }
        }
        page.screenshoting = true
        page.elOverlay.style.cursor = 'progress'

        console.log('dropper: screenshoting')

        if (page.options.enableColorTooltip === true) {
            page.elColorTooltip.style.display = 'none'
        }

        if (page.options.enableColorToolbox === true) {
            page.elColorToolbox.style.display = 'none'
        }

        console.log('screenshot: sendMessage')
        page.sendMessage({
            type: 'screenshot',
        })
        console.log('screenshot: sendMessage end')
    },
    // capture actual Screenshot
    capture: function() {
        page.checkCanvas()
        ////console.log(page.rects);
        //    var image = new Image();
        var image = document.createElement('img')
        image.onload = function() {
            page.screenWidth = image.width
            page.screenHeight = image.height
            var rect = {
                x: page.XOffset,
                y: page.YOffset,
                width: image.width,
                height: image.height,
            }
            var merged = false
            // if there are already any rectangles
            if (page.rects.length > 0) {
                // try to merge shot with others
                for (let index in page.rects) {
                    var t = page.rectMerge(rect, page.rects[index])
                    if (t != false) {
                        console.log('dropper: merging')
                        merged = true
                        page.rects[index] = t
                    }
                }
            }
            // put rectangle in array
            if (merged == false) page.rects.push(rect)
            page.canvasContext.drawImage(image, page.XOffset, page.YOffset)
            page.canvasData = page.canvasContext.getImageData(0, 0, page.canvas.width, page.canvas.height).data
            // TODO - je nutne refreshnout ctverecek a nastavit mu spravnou barvu
            page.screenshoting = false
            page.elOverlay.style.cursor = page.options.cursor
            console.log('reenabling color toolbox/tooltip')
            // re-enable tooltip and toolbox
            if (page.options.enableColorTooltip === true) {
                page.elColorTooltip.style.display = ''
            }
            if (page.options.enableColorToolbox === true) {
                page.elColorToolbox.style.display = ''
            }
            if (DEBUG) {
                page.sendMessage({ type: 'debug-tab', image: page.canvas.toDataURL() })
                debugger
            }
        }
        if (page.imageData) {
            image.src = page.imageData
        } else {
            console.error('ed: no imageData')
        }
    },
    init: function() {
        page.messageListener()
        if (page.width > CANVAS_MAX_SIZE) {
            page.width = CANVAS_MAX_SIZE
        }
        if (page.height > CANVAS_MAX_SIZE) {
            page.height = CANVAS_MAX_SIZE
        }
    },
}
page.init()
window.onresize = function() {
    page.onWindowResize()
}
