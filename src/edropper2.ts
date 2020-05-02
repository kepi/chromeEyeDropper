import shortcut from './vendor/shortcut'
import scrollStop from './vendor/scrollStop'
import { createNode } from './helpers'
import Overlay from './overlay'
import Color from './Color.d'

var EDROPPER_VERSION = 12
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
        cursor: 'default',
        enableColorToolbox: true,
        enableColorTooltip: true,
        enableRightClickDeactivate: true,
    },

    canvas: null,
    canvasData: null,
    canvasContext: null,
    canvasBorders: 20,
    imageData: null,

    rects: null,

    screenshoting: false,
    dropperActivated: false,

    // function to set defaults - used during init and later for reset
    defaults: function() {
        page.screenWidth = window.innerWidth
        page.screenHeight = window.innerHeight

        page.canvas = document.createElement('canvas')
        page.rects = []
        page.screenshoting = false
        page.width = Math.round(document.documentElement.scrollWidth)
        page.height = Math.round(document.documentElement.scrollHeight)

        // TODO: check if this is needed
        if (page.width > CANVAS_MAX_SIZE) {
            page.width = CANVAS_MAX_SIZE
            console.warn('Page width is larger then maximum Canvas width.')
        }
        if (page.height > CANVAS_MAX_SIZE) {
            page.height = CANVAS_MAX_SIZE
            console.warn('Page height is larger then maximum Canvas height.')
        }
    },

    // ---------------------------------
    // MESSAGING
    // ---------------------------------
    messageListener: function() {
        // Listen for pickup activate
        console.log('dropper: page activated')
        console.log(`dropper: debug page at ${chrome.runtime.getURL('debug-tab.html')}`)
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

        page.overlay = new Overlay({
            width: page.width,
            height: page.height,
            enableToolbox: page.options.enableColorToolbox,
            enableTooltip: page.options.enableColorTooltip,
            cursor: page.options.cursor,
        })

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

        page.dropperActivated = false
        console.log('dropper: deactivating page dropper')
        document.removeEventListener('mousemove', page.onMouseMove, false)
        document.removeEventListener('click', page.onMouseClick, false)
        if (page.options.enableRightClickDeactivate === true) {
            document.removeEventListener('contextmenu', page.onContextMenu, false)
        }

        scrollStop(page.onScrollStop, 'stop')

        page.overlay.deactivate()
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
            color: page.pickColor(e.pageX, e.pageY),
        })
    },
    onScrollStop: function() {
        if (!page.dropperActivated) return
        console.log('dropper: scroll stopped')
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

        // call screen chaned
        page.screenChanged()
        page.overlay.resized({ width: page.width, height: page.height })
    },
    // ---------------------------------
    // MISC
    // ---------------------------------
    tooltip: function(e: MouseEvent) {
        if (!page.dropperActivated || page.screenshoting) return

        const x = e.pageX
        const y = e.pageY

        var color = page.pickColor(x, y)

        page.overlay.tooltip({
            screenWidth: page.screenWidth,
            screenHeight: page.screenHeight,
            x,
            y,
            color,
        })
    },
    // return true if rectangle A is whole in rectangle B
    rectInRect: function(A, B) {
        if (
            A.x >= B.x &&
            A.y >= B.y &&
            A.x + A.width <= B.x + B.width &&
            A.y + A.height <= B.y + B.height
        )
            return true
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
    pickColor: function(x, y) {
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
        const scale = window.devicePixelRatio

        // width and height with borders
        // const widthWB = page.width * scale + page.canvasBorders
        // const heightWB = page.height * scale + page.canvasBorders
        const widthWB = page.width + page.canvasBorders
        const heightWB = page.height + page.canvasBorders

        // we have to create new canvas element
        if (page.canvas.width != widthWB || page.canvas.height != heightWB) {
            page.canvas = document.createElement('canvas')
            page.canvas.width = widthWB
            page.canvas.height = heightWB

            console.log(
                `dropper: creating new canvas ${page.canvas.width}x${page.canvas.height}. Pixel Ratio: ${window.devicePixelRatio}`,
            )

            page.canvasContext = page.canvas.getContext('2d')
            page.canvasContext.scale(1 / scale, 1 / scale)
            // page.canvasContext.scale(scale, scale)
            page.rects = []
        }
    },
    setScreenshoting: function(state) {
        if (page.screenshoting && state) {
            return
        }
        page.screenshoting = state
        page.overlay.screenshoting(state)
    },
    screenChanged: function(force = false) {
        if (!page.dropperActivated) return
        console.log('dropper: screenChanged')
        var rect = {
            x: xOffset,
            y: yOffset,
            width: page.screenWidth,
            height: page.screenHeight,
        }
        page.yOffset = Math.round(document.documentElement.scrollTop)
        page.xOffset = Math.round(document.documentElement.scrollLeft)
        // don't screenshot if we already have this one
        if (!force && page.rects.length > 0) {
            for (let index in page.rects) {
                if (page.rectInRect(rect, page.rects[index])) {
                    console.log('dropper: already shoted, skipping')
                    return
                }
            }
        }

        page.setScreenshoting(true)
        setTimeout(function() {
            page.sendMessage({
                type: 'screenshot',
            })
        }, 50)
    },
    // capture actual Screenshot
    capture: function() {
        page.checkCanvas()
        ////console.log(page.rects);
        //    var image = new Image();
        console.log('dropper: creating image element and waiting on load')
        var image = document.createElement('img')
        image.onload = function() {
            console.log(`dropper: got new screenshot ${image.width}x${image.height}`)
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
            page.canvasContext.drawImage(image, xOffset, yOffset)
            // page.screenWidth = image.width
            // page.screenHeight = image.height
            page.canvasData = page.canvasContext.getImageData(
                0,
                0,
                page.canvas.width,
                page.canvas.height,
            ).data

            page.setScreenshoting(false)

            if (DEV_MODE) {
                page.sendMessage({ type: 'debug-tab', image: page.canvas.toDataURL() })
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
        }
    },
}
page.init()
window.onresize = function() {
    page.onWindowResize()
}
