const BG_VERSION = 12
const NEED_DROPPER_VERSION = 10
const DEFAULT_COLOR = "#b48484"

// jQuery like functions

// for get element by id
function $(id) {
    return document.getElementById(id)
}

// Returns -1 if value isn't in array.
// Return position starting from 0 if found
function inArray(value, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == value) return i
    }
    return -1
}

// base bg object
var bg = {
    tab: 0,
    tabs: [],
    version: BG_VERSION,
    screenshotData: '',
    screenshotFormat: 'png',
    canvas: document.createElement("canvas"),
    canvasContext: null,
    debugImage: null,
    debugTab: 0,
    history: {
        version: BG_VERSION,
        last_color: DEFAULT_COLOR,
        current_palette: 'default',
        palettes: {
            default: []
        }
    },
    defaultSettings: {
        autoClipboard: false,
        autoClipboardNoGrid: false,
        enableColorToolbox: true,
        enableColorTooltip: true,
        enableRightClickDeactivate: true,
        dropperCursor: 'default'
    },
    settings: {},
    edCb: null,

    // use selected tab
    // need to null all tab-specific variables
    useTab(tab) {
        bg.tab = tab
        bg.screenshotData = ''
        bg.canvas = document.createElement("canvas")
        bg.canvasContext = null
    },

    checkDropperScripts() {
        console.log('bg: checking dropper version')
        bg.sendMessage({
            type: 'edropper-version'
        }, function(res) {
            console.log('bg: checking dropper version 2')
            if (res) {
                if (res.version < NEED_DROPPER_VERSION) {
                    bg.refreshDropper()
                } else {
                    bg.pickupActivate()
                }
            } else {
                bg.injectDropper()
            }
        })
    },

    // FIXME: try to handle this better, maybe some consolidation
    injectDropper() {
        console.log("bg: injecting dropper scripts")

        chrome.tabs.executeScript(bg.tab.id, {
            allFrames: false,
            file: "inc/jquery-2.1.0.min.js"
        }, function() {
            console.log('bg: jquery injected')
            chrome.tabs.executeScript(bg.tab.id, {
                allFrames: false,
                file: "inc/jquery.scrollstop.js"
            }, function() {
                console.log('bg: jquery.scrollstop injected')
                chrome.tabs.executeScript(bg.tab.id, {
                    allFrames: false,
                    file: "inc/shortcut.js"
                }, function() {
                    console.log('bg: shortcuts injected')
                    chrome.tabs.executeScript(bg.tab.id, {
                        allFrames: false,
                        file: "edropper2.js"
                    }, function() {
                        console.log('bg: edropper2 injected')
                        bg.pickupActivate()
                    })
                })
            })
        })
    },

    refreshDropper() {
        console.log("bg: refreshing dropper scripts")

        chrome.tabs.executeScript(bg.tab.id, {
            allFrames: true,
            file: "edropper2.js"
        }, function() {
            console.log('bg: edropper2 updated')
            bg.pickupActivate()
        })
    },

    sendMessage(message, callback) {
        chrome.tabs.sendMessage(bg.tab.id, message, callback)
    },

    shortcutListener() {
        chrome.commands.onCommand.addListener(function(command) {
            console.log('bg: command: ', command)
            switch (command) {
                case 'activate':
                    bg.activate2()
                    break
            }
        })
    },

    messageListener() {
        // simple messages
        chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
            switch (req.type) {
                case 'activate-from-hotkey':
                    bg.activate2()
                    sendResponse({})
                    break

                    // Reload background script
                case 'reload-background':
                    window.location.reload()
                    break

                    // Clear colors history
                case 'clear-history':
                    bg.clearHistory(sendResponse)
                    break
            }
        })

        // longer connections
        chrome.extension.onConnect.addListener(function(port) {
            port.onMessage.addListener(function(req) {
                switch (req.type) {
                    // Taking screenshot for content script
                    case 'screenshot':
                        ////console.log('received screenshot request')
                        bg.capture()
                        break

                        // Creating debug tab
                    case 'debug-tab':
                        ////console.log('received debug tab')
                        bg.debugImage = req.image
                        bg.createDebugTab()
                        break

                        // Set color given in req
                        // FIXME: asi lepší z inject scriptu posílat jen rgbhex, už to tak máme stejně skoro všude
                    case 'set-color':
                        bg.setColor(`#${req.color.rgbhex}`)
                        break

                }
            })
        })
    },

    // function for injecting new content
    inject(file, tab) {
        if (tab == undefined)
            tab = bg.tab.id

        ////console.log("Injecting " + file + " into tab " + tab)
        chrome.tabs.executeScript(tab, {
            allFrames: false,
            file: file
        }, function() {})
    },

    setBadgeColor(color) {
        console.info(`Setting badge color to ${color}`)
        chrome.browserAction.setBadgeBackgroundColor({
            color: [parseInt(color.substr(1, 2), 16), parseInt(color.substr(3, 2), 16), parseInt(color.substr(5, 2), 16), 255]
        })
    },

    // method for setting color. It set bg color, update badge and save to history if possible
    setColor(color, history = true) {
        console.group('setColor')
        console.info(`Received color ${color}, history: ${history}`)
        if (!color || !color.match(/^#[0-9a-f]{6}$/)) {
            console.error('error receiving collor from dropper')
            console.groupEnd('setColor')
            return
        } // we are storing color with first # character

        bg.setBadgeColor(color)

        if (bg.settings.autoClipboard) {
            console.info("Copying color to clipboard")
            bg.copyToClipboard(color)
        }

        if (history) {
            console.info("Saving color to history")
            bg.saveToHistory(color)
        }

        console.groupEnd('setColor')
    },

    saveToHistory(color, palette = 'default') {
        if (!bg.history.palettes[palette].find(x => x.hex == color)) {
            bg.history.palettes[palette].push(bg.historyColorItem(color))
            bg.history.last_color = color
            console.info(`Color ${color} saved to palette ${palette}`)

            // FIXME: would be better to sync once in five secs or so instead of every time color change
            bg.saveHistory()
        } else {
            console.info(`Color ${color} already in palette ${palette}`)
        }
    },

    copyToClipboard(color) {
        bg.edCb.value = bg.settings.autoClipboardNoGrid ? color.substring(1) : color
        bg.edCb.select()
        document.execCommand("copy", false, null)
    },

    // activate from content script
    activate2() {
        chrome.tabs.getSelected(null, function(tab) {
            bg.useTab(tab)
            bg.activate()
        })
    },

    // activate Pick
    activate() {
        console.log('bg: received pickup activate')
            // check scripts and activate pickup
        bg.checkDropperScripts()
    },

    pickupActivate() {
        // load options
        cursor = (window.localStorage.dropperCursor === 'crosshair') ? 'crosshair' : 'default'
        enableColorToolbox = (window.localStorage.enableColorToolbox === "false") ? false : true
        enableColorTooltip = (window.localStorage.enableColorTooltip === "false") ? false : true
        enableRightClickDeactivate = (window.localStorage.enableRightClickDeactivate === "false") ? false : true

        // activate picker
        bg.sendMessage({
            type: 'pickup-activate',
            options: {
                cursor: cursor,
                enableColorToolbox: enableColorToolbox,
                enableColorTooltip: enableColorTooltip,
                enableRightClickDeactivate: enableRightClickDeactivate
            }
        }, function() {})

        console.log('bg: activating pickup')
    },

    // capture actual Screenshot
    capture() {
        ////console.log('capturing')
        try {
            chrome.tabs.captureVisibleTab(null, {
                    format: 'png'
                }, bg.doCapture)
                // fallback for chrome before 5.0.372.0
        } catch (e) {
            chrome.tabs.captureVisibleTab(null, bg.doCapture)
        }
    },

    getColor() {
        return bg.history.last_color
    },

    doCapture(data) {
        if (data) {
            console.log('bg: sending updated image')
            bg.sendMessage({
                type: 'update-image',
                data: data
            }, function() {})
        } else {
            console.error('bg: did not receive data from captureVisibleTab')
        }
    },

    createDebugTab() {
        // DEBUG
        if (bg.debugTab != 0) {
            chrome.tabs.sendMessage(bg.debugTab, {
                type: 'update'
            })
        } else
            chrome.tabs.create({
                url: 'debugimage.html',
                selected: false
            }, function(tab) {
                bg.debugTab = tab.id
            })
    },

    tabOnChangeListener() {
        // deactivate dropper if tab changed
        chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
            if (bg.tab.id == tabId)
                bg.sendMessage({
                    type: 'pickup-deactivate'
                }, function() {})
        })

    },

    getPalette() {
        return bg.history.palettes[bg.history.current_palette]
    },

    clearHistory(sendResponse) {
        console.info(`Clearing history for palette ${bg.history.current_palette}`)
        bg.history.palettes[bg.history.current_palette] = []
        bg.history.last_color = DEFAULT_COLOR
        bg.setBadgeColor(DEFAULT_COLOR)
        bg.saveHistory()

        if (sendResponse != undefined) {
            sendResponse({
                state: 'OK'
            })
        }
    },

    /**
     * When Eye Dropper is just installed, we want to display nice
     * page to user with some instructions
     */
    pageInstalled() {
        // only if we have support for localStorage
        if (window.localStorage != null) {

            // show installed or updated page
            // do not display if localStorage is not supported - we don't want to spam user
            if (window.localStorage && !window.localStorage.seenInstalledPage) {
                console.info("Just installed: opening installed page in new tab.")
                window.localStorage.seenInstalledPage = true
                chrome.tabs.create({
                    url: 'pages/installed.html',
                    selected: true
                })
            }
        }
    },

    /**
     * Load history from storage on extension start
     */
    loadHistory() {
        console.info("Loading history from storage")
        chrome.storage.sync.get('history', (items) => {
            if (items.history) {
                console.info("History loaded")
                bg.history = items.history
            } else {
                console.warn("No history in storage")
                bg.tryConvertOldHistory()
            }
        })
    },

    /**
     * Load settings from storage on extension start
     */
    loadSettings() {
        console.info("Loading settings from storage")
        chrome.storage.sync.get('settings', (items) => {
            if (items.settings) {
                console.info("Settings loaded")
                bg.settings = items.settings
            } else {
                console.warn("No settings in storage")
                bg.tryConvertOldSettings()
            }
        })
    },

    historyColorItem(color, timestamp = Date.now(), favorite = false) {
        return {
            hex: color,
            timestamp: timestamp,
            name: color,
            favorite: false
        }
    },

    /**
     * FIXME: dořešit tady jsem skončil
     */
    tryConvertOldHistory() {
        if (window.localStorage.history) {
            let oldHistory = JSON.parse(window.localStorage.history)

            // add every color from old history to new schema with current timestamp
            let timestamp = Date.now()
            for (let key in oldHistory) {
                let color = oldHistory[key]

                // in versions before 0.3.0 colors were stored without # in front
                if (color[0] != '#') {
                    color = '#' + color
                }

                // push color to default palette
                bg.history.palettes.default.push(bg.historyColorItem(color, timestamp))

                // set this color as last
                bg.history.last_color = color
            }
        }

        // sync history
        bg.saveHistory()

        // remove old history from local storage
        localStorage.removeItem('history')
    },

    tryConvertOldSettings() {
        // load default settings first
        bg.settings = bg.defaultSettings

        // convert old settings
        bg.settings.autoClipboard = (window.localStorage.autoClipboard === "true") ? true : false
        bg.settings.autoClipboardNoGrid = (window.localStorage.autoClipboardNoGrid === "true") ? true : false
        bg.settings.enableColorToolbox = (window.localStorage.enableColorToolbox === "false") ? false : true
        bg.settings.enableColorTooltip = (window.localStorage.enableColorTooltip === "false") ? false : true
        bg.settings.enableRightClickDeactivate = (window.localStorage.enableRightClickDeactivate === "false") ? false : true
        bg.settings.dropperCursor = (window.localStorage.dropperCursor === 'crosshair') ? 'crosshair' : 'default'

        // sync settings
        bg.saveSettings()

        // remove old settings from local storage
        let setting_keys = ['autoClipboard', 'autoClipboardNoGrid', 'enableColorTooltip', 'enableColorToolbox', 'enableRightClickDeactivate', 'dropperCursor']
        for (let setting_name of setting_keys) {
            localStorage.removeItem(setting_name)
        }
        console.info("Removed old settings from locale storage.")
    },

    saveHistory() {
        chrome.storage.sync.set({
            'history': bg.history
        }, () => {
            console.info("History synced to storage")
        })
    },

    saveSettings() {
        chrome.storage.sync.set({
            'settings': bg.settings
        }, () => {
            console.info("Settings synced to storage")
        })
    },

    init() {
        console.group("init")

        bg.pageInstalled()

        bg.edCb = document.getElementById('edClipboard')

        bg.loadSettings()
        bg.loadHistory()

        // set default badge text to empty string
        // we are comunicating with users only through badge background color
        chrome.browserAction.setBadgeText({
            text: ' '
        })

        // we have to listen for messages
        bg.messageListener()

        // act when tab is changed
        // TODO: call only when needed? this is now used also if picker isn't active
        bg.tabOnChangeListener()

        // listen for shortcut commands
        bg.shortcutListener()

        console.groupEnd('init')
    }
}

document.addEventListener('DOMContentLoaded', function() {
    bg.init()
})
