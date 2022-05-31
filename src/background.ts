const BG_VERSION = 18
const NEED_DROPPER_VERSION = 13
const DEFAULT_COLOR = '#b48484'

interface BgSettings {
    autoClipboard: boolean
    autoClipboardNoGrid: boolean
    enableColorToolbox: boolean
    enableColorTooltip: boolean
    enableRightClickDeactivate: boolean
    dropperCursor: string
    plus: boolean
    plus_type: string
}

interface HistoryColorItem {
    h: string
    n: string
    s: number
    t: number
    f: number
}

interface Palette {
    name: string
    created: number
    colors: Array<string>
}

// base bg object
var bg = {
    tab: null as chrome.tabs.Tab,
    tabs: [] as Array<chrome.tabs.Tab>,
    version: BG_VERSION,
    screenshotData: '',
    screenshotFormat: 'png',
    canvas: document.createElement('canvas'),
    canvasContext: null,
    debugImage: null,
    debugTab: 0,
    history: {
        version: BG_VERSION,
        last_color: DEFAULT_COLOR,
        current_palette: 'default',
        palettes: [] as Array<Palette>,
    },
    defaultSettings: {
        autoClipboard: false,
        autoClipboardNoGrid: false,
        enableColorToolbox: true,
        enableColorTooltip: true,
        enableRightClickDeactivate: true,
        dropperCursor: 'default',
        plus: false,
        plus_type: null,
    },
    defaultPalette: 'default',
    settings: {} as BgSettings,
    edCb: null,
    color_sources: {
        1: 'Web Page',
        2: 'Color Picker',
        3: 'Old History',
    },
    // use selected tab
    // need to null all tab-specific variables
    useTab: function (tab: chrome.tabs.Tab) {
        bg.tab = tab
        bg.screenshotData = ''
        bg.canvas = document.createElement('canvas')
        bg.canvasContext = null
    },
    checkDropperScripts: function () {
        console.log('bg: checking dropper version')
        bg.sendMessage(
            {
                type: 'edropper-version',
            },
            function (res: { version: number; tabid: number }) {
                console.log('bg: checking dropper version 2')
                if (chrome.runtime.lastError || !res) {
                    bg.injectDropper()
                } else {
                    if (res.version < NEED_DROPPER_VERSION) {
                        bg.refreshDropper()
                    } else {
                        bg.pickupActivate()
                    }
                }
            },
        )
    },
    injectDropper: function () {
        console.log('bg: injecting dropper scripts')
        chrome.tabs.executeScript(
            bg.tab.id,
            {
                file: '/js/edropper2.js',
            },
            function (_results: Array<any>) {
                console.log('bg: edropper2 injected')
                bg.pickupActivate()
            },
        )
    },
    refreshDropper: function () {
        console.log('bg: refreshing dropper scripts')
        chrome.tabs.executeScript(
            bg.tab.id,
            {
                allFrames: true,
                file: '/js/edropper2.js',
            },
            function (_results: Array<any>) {
                console.log('bg: edropper2 updated')
                bg.pickupActivate()
            },
        )
    },
    sendMessage: function (message: any, callback?: (response: any) => void) {
        chrome.tabs.sendMessage(bg.tab.id, message, callback)
    },
    shortcutListener: function () {
        chrome.commands.onCommand.addListener((command) => {
            console.log('bg: command: ', command)
            switch (command) {
                case 'activate':
                    bg.activate2()
                    break
            }
        })
    },
    messageListener: function () {
        // simple messages
        chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
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
        chrome.runtime.onConnect.addListener((port) => {
            port.onMessage.addListener((req, sender) => {
                switch (req.type) {
                    // Taking screenshot for content script
                    case 'screenshot':
                        ////console.log('received screenshot request')
                        bg.capture()
                        break
                    // Creating debug tab
                    case 'debug-tab':
                        console.info('Received debug tab request')
                        bg.debugImage = req.image
                        bg.createDebugTab()
                        break
                    // Set color given in req
                    // FIXME: asi lepší z inject scriptu posílat jen rgbhex, už to tak máme stejně skoro všude
                    case 'set-color':
                        console.log(sender.sender)
                        console.log(req.color)
                        bg.setColor('#' + req.color.rgbhex, true, 1, sender.sender.url)
                        break
                }
            })
        })

        /**
         * When Eye Dropper is just installed, we want to display nice
         * page to user with some instructions
         */
        chrome.runtime.onInstalled.addListener((object: chrome.runtime.InstalledDetails) => {
            if (object.reason === 'install') {
                chrome.tabs.create({
                    url: 'https://eyedropper.org/installed',
                    selected: true,
                })
            }
        })
    },
    setBadgeColor: function (color: string) {
        console.info('Setting badge color to ' + color)
        chrome.browserAction.setBadgeBackgroundColor({
            color: [
                parseInt(color.substr(1, 2), 16),
                parseInt(color.substr(3, 2), 16),
                parseInt(color.substr(5, 2), 16),
                255,
            ],
        })
    },
    // method for setting color. It set bg color, update badge and save to history if possible
    // source - see historyColorItem for description
    setColor: function (color: string, history = true, source = 1, url?: string) {
        console.group('setColor')
        console.info('Received color ' + color + ', history: ' + history)
        if (!color || !color.match(/^#[0-9a-f]{6}$/)) {
            console.error('error receiving collor from dropper')
            console.groupEnd()
            return
        } // we are storing color with first # character
        bg.setBadgeColor(color)
        bg.history.last_color = color
        if (history) {
            console.info('Saving color to history')
            bg.saveToHistory(color, source, url)
        }
        console.groupEnd()
    },
    saveToHistory: function (color: string, source = 1, url?: string) {
        var palette = bg.getPalette()
        if (
            !palette.colors.find((x: HistoryColorItem) => {
                return x.h == color
            })
        ) {
            palette.colors.push(bg.historyColorItem(color, Date.now(), source, false, url))
            console.info('Color ' + color + ' saved to palette ' + bg.getPaletteName())
            bg.saveHistory()
        } else {
            console.info('Color ' + color + ' already in palette ' + bg.getPaletteName())
        }
    },
    // activate from content script
    activate2: function () {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: Array<chrome.tabs.Tab>) => {
            bg.useTab(tabs[0])
            bg.activate()
        })
    },
    // activate Pick
    activate: function () {
        console.log('bg: received pickup activate')
        // check scripts and activate pickup
        bg.checkDropperScripts()
    },
    pickupActivate: function () {
        // activate picker
        bg.sendMessage({
            type: 'pickup-activate',
            options: {
                cursor: bg.settings.dropperCursor,
                enableColorToolbox: bg.settings.enableColorToolbox,
                enableColorTooltip: bg.settings.enableColorTooltip,
                enableRightClickDeactivate: bg.settings.enableRightClickDeactivate,
                autoClipboard: bg.settings.autoClipboard,
                autoClipboardNoGrid: bg.settings.autoClipboardNoGrid,
            },
        })
        console.log('bg: activating pickup')
    },
    // capture actual Screenshot
    capture: function () {
        ////console.log('capturing')
        try {
            chrome.tabs.captureVisibleTab(
                null,
                {
                    format: 'png',
                },
                bg.doCapture,
            )
            // fallback for chrome before 5.0.372.0
        } catch (e) {
            chrome.tabs.captureVisibleTab(null, bg.doCapture)
        }
    },
    getColor: function () {
        return bg.history.last_color
    },
    doCapture: function (data: string) {
        if (data) {
            console.log('bg: sending updated image')
            bg.sendMessage({
                type: 'update-image',
                data: data,
            })
        } else {
            console.error('bg: did not receive data from captureVisibleTab')
        }
    },
    createDebugTab: function () {
        // DEBUG
        if (bg.debugTab != 0) {
            chrome.tabs.sendMessage(bg.debugTab, {
                type: 'update',
            })
        } else
            chrome.tabs.create(
                {
                    url: '/debug-tab.html',
                    selected: false,
                },
                function (tab) {
                    bg.debugTab = tab.id
                },
            )
    },
    tabOnChangeListener: function () {
        // deactivate dropper if tab changed
        chrome.tabs.onSelectionChanged.addListener((tabId, _selectInfo) => {
            if (bg.tab && bg.tab.id == tabId)
                bg.sendMessage({
                    type: 'pickup-deactivate',
                })
        })
    },
    getPaletteName: function () {
        return bg.getPalette().name
    },
    isPalette: function (name: string) {
        return bg.history.palettes.find((x: Palette) => {
            return x.name == name
        })
            ? true
            : false
    },
    getPalette: function (name?: string) {
        if (name === undefined) {
            name =
                bg.history.current_palette === undefined ||
                !bg.isPalette(bg.history.current_palette)
                    ? 'default'
                    : bg.history.current_palette
        }
        return bg.history.palettes.find((x: Palette) => {
            return x.name == name
        })
    },
    changePalette: function (palette_name: string) {
        if (bg.history.current_palette === palette_name) {
            console.info('Not switching, already on palette ' + palette_name)
        } else if (bg.isPalette(palette_name)) {
            bg.history.current_palette = palette_name
            console.info('Switched current palette to ' + palette_name)
            bg.saveHistory()
        } else {
            console.error('Cannot switch to palette ' + palette_name + '. Palette not found.')
        }
    },
    getPaletteNames: function () {
        return bg.history.palettes.map((x: Palette) => {
            return x.name
        })
    },
    uniquePaletteName: function (name: string) {
        // default name is palette if we receive empty or undefined name
        if (name === undefined || !name || name.length < 1) {
            console.info('uniquePaletteName: ' + name + " empty, trying 'palette'")
            return bg.uniquePaletteName('palette')
            // if there is already palette with same name
        } else if (
            bg.getPaletteNames().find((x: string) => {
                return x == name
            })
        ) {
            var matches = name.match(/^(.*[^\d]+)(\d+)?$/)
            // doesn't end with number, we will add 1
            if (matches[2] === undefined) {
                console.info('uniquePaletteName: ' + name + " occupied, trying '" + name + "1'")
                return bg.uniquePaletteName(name + '1')
                // ends with number
            } else {
                var new_name = '' + matches[1] + (parseInt(matches[2]) + 1)
                console.info('uniquePaletteName: ' + name + " occupied, trying '" + new_name + "'")
                return bg.uniquePaletteName(new_name)
            }
        } else {
            console.info('uniquePaletteName: ' + name + " is free'")
            return name
        }
    },
    createPalette: function (name: string) {
        var palette_name = bg.uniquePaletteName(name)
        console.info('Creating new palette ' + name + '. Unique name: ' + palette_name)
        bg.history.palettes.push({
            name: palette_name,
            created: Date.now(),
            colors: [],
        })
        bg.saveHistory()
        return bg.getPalette(palette_name)
    },
    destroyPalette: function (name: string) {
        if (!bg.isPalette(name)) {
            return
        }
        if (name === 'default') {
            console.info("Can't destroy default palette. Clearing only.")
            bg.getPalette(name).colors = []
        } else {
            console.info('Destroying palette ' + name)
            var destroying_current = name === bg.getPalette().name
            bg.history.palettes = bg.history.palettes.filter((obj: Palette) => {
                return obj.name !== name
            })
            // if we are destroying current palette, switch to default one
            if (destroying_current) {
                bg.changePalette('default')
            }
        }
        bg.saveHistory(false)
        chrome.storage.sync.remove('palette.' + name)
    },
    clearHistory: function (sendResponse: ({ state: string }) => void) {
        var palette = bg.getPalette()
        console.info('Clearing history for palette ' + palette.name)
        palette.colors = []
        bg.saveHistory()
        if (sendResponse != undefined) {
            sendResponse({
                state: 'OK',
            })
        }
    },
    /**
     * Load history from storage on extension start
     */
    loadHistory: function () {
        console.info('Loading history from storage')
        chrome.storage.sync.get((items) => {
            if (items.history) {
                bg.history.current_palette = items.history.cp
                bg.history.last_color = items.history.lc
                console.info('History info loaded. Loading palettes.')
                console.info('Default palette before loading: ' + bg.defaultPalette)
                var count_default_1 = 0
                var count_converted_1 = 0
                Object.keys(items).forEach((key, _index) => {
                    var matches = key.match(/^palette\.(.*)$/)
                    if (matches) {
                        var palette = items[key]
                        bg.history.palettes.push({
                            name: matches[1],
                            colors: palette.c,
                            created: palette.t,
                        })
                        if (matches[1] === 'default') {
                            count_default_1 = palette.c.length
                        }
                        if (matches[1] === 'converted') {
                            count_converted_1 = palette.c.length
                        }
                    }
                })
                if (count_default_1 === 0 && count_converted_1 > 0) {
                    bg.defaultPalette = 'converted'
                    console.info('Default palette after loading: ' + bg.defaultPalette)
                }
                if (items.history.v < bg.history.version) {
                    bg.checkHistoryUpgrades(items.history.v)
                }
            } else {
                console.log('No history in storage')
                bg.createPalette('default')
            }
            // in any case we will try to convert local history
            bg.tryConvertOldHistory()
        })
    },
    /**
     * Check if there are needed upgrades to history and exec if needed
     **/
    checkHistoryUpgrades: function (version: number) {
        // Wrong timestamp saved before version 14
        //
        // There was error in bg versions before 14 that caused saving
        // history color timestamp as link tu datenow function instead of
        // current date in some cases.
        //
        // We will check for such times and set them to start of epoch
        if (version < 14) {
            console.log('History version is pre 14: Fixing color times')
            for (var _i = 0, _a = bg.history.palettes; _i < _a.length; _i++) {
                var palette = _a[_i]
                for (var _b = 0, _c = palette.colors; _b < _c.length; _b++) {
                    var color = _c[_b]
                    if (typeof color.t !== 'number') {
                        color.t = 0
                    }
                }
            }
            bg.saveHistory()
        }
    },
    /**
     * Load settings from storage on extension start
     */
    loadSettings: function () {
        console.info('Loading settings from storage')
        chrome.storage.sync.get('settings', function (items) {
            if (items.settings) {
                console.info('Settings loaded')
                bg.settings = items.settings
            } else {
                console.log('No settings in storage')
                bg.tryConvertOldSettings()
            }
        })
    },
    /**
     * sources:
     *    1: eye dropper
     *    2: color picker
     *    3: converted from old history
     *
     * FIXME:
     * url is not saved now because of quotas
     * favorite not implemented yet
     *
     * h = hex
     * n = name
     * s = source
     * t = timestamp when taken
     * f = favorite
     */
    historyColorItem: function (
        color: string,
        timestamp = Date.now(),
        source = 1,
        favorite = false,
        _url?: string,
    ) {
        return {
            h: color,
            n: '',
            s: source,
            t: timestamp,
            f: favorite ? 1 : 0,
        }
    },
    /**
     * Convert pre 0.4 Eye Dropper local history to synced storage
     *
     * Backup of old history is stored in local storage in _history_backup
     * in case something goes south.
     */
    tryConvertOldHistory: function () {
        if (window.localStorage.history) {
            var oldHistory = JSON.parse(window.localStorage.history)
            var converted_palette = bg.createPalette('converted')
            console.warn(converted_palette)
            // add every color from old history to new schema with current timestamp
            var timestamp = Date.now()
            for (var key in oldHistory) {
                var color = oldHistory[key]
                // in versions before 0.3.0 colors were stored without # in front
                if (color[0] != '#') {
                    color = '#' + color
                }
                // push color to our converted palette
                converted_palette.colors.push(bg.historyColorItem(color, timestamp, 3))
                // set this color as last
                bg.history.last_color = color
            }
            // make backup of old history
            window.localStorage._history_backup = window.localStorage.history
            // remove old history from local storage
            window.localStorage.removeItem('history')
            // sync history
            bg.saveHistory()
            // change to converted history if current palette is empty
            if (bg.getPalette().colors.length < 1) {
                bg.changePalette(converted_palette.name)
            }
        }
    },
    /**
     * Convert pre 0.4 Eye Dropper local settings to synced storage
     *
     * Synced storage is much better because it finally allows as to store objects and not
     * strings only.
     *
     */
    tryConvertOldSettings: function () {
        // load default settings first
        bg.settings = bg.defaultSettings
        // convert old settings
        bg.settings.autoClipboard = window.localStorage.autoClipboard === 'true' ? true : false
        bg.settings.autoClipboardNoGrid =
            window.localStorage.autoClipboardNoGrid === 'true' ? true : false
        bg.settings.enableColorToolbox =
            window.localStorage.enableColorToolbox === 'false' ? false : true
        bg.settings.enableColorTooltip =
            window.localStorage.enableColorTooltip === 'false' ? false : true
        bg.settings.enableRightClickDeactivate =
            window.localStorage.enableRightClickDeactivate === 'false' ? false : true
        bg.settings.dropperCursor =
            window.localStorage.dropperCursor === 'crosshair' ? 'crosshair' : 'default'
        // sync settings
        bg.saveSettings()
        // remove old settings from local storage
        var setting_keys = [
            'autoClipboard',
            'autoClipboardNoGrid',
            'enableColorTooltip',
            'enableColorToolbox',
            'enableRightClickDeactivate',
            'dropperCursor',
        ]
        for (var _i = 0, setting_keys_1 = setting_keys; _i < setting_keys_1.length; _i++) {
            var setting_name = setting_keys_1[_i]
            localStorage.removeItem(setting_name)
        }
        console.info('Removed old settings from locale storage.')
    },
    saveHistory: function (all_palettes = true) {
        var saved_object = {
            history: {
                v: bg.history.version,
                cp: bg.history.current_palette,
                lc: bg.history.last_color,
            },
        }
        if (all_palettes) {
            for (var _i = 0, _a = bg.history.palettes; _i < _a.length; _i++) {
                const palette = _a[_i]
                saved_object['palette.' + palette.name] = {
                    c: palette.colors,
                    t: palette.created,
                }
            }
        }
        chrome.storage.sync.set(saved_object, function () {
            console.info('History synced to storage')
        })
    },
    saveSettings: function () {
        chrome.storage.sync.set(
            {
                settings: bg.settings,
            },
            function () {
                console.info('Settings synced to storage')
            },
        )
    },
    unlockPlus: function (type: string) {
        bg.settings.plus = true
        bg.settings.plus_type = type
        bg.saveSettings()
    },
    lockPlus: function () {
        bg.settings.plus = false
        bg.settings.plus_type = null
        bg.saveSettings()
    },
    plus: function () {
        return bg.settings.plus ? bg.settings.plus_type : false
    },
    plusColor: function (color = bg.settings.plus_type) {
        switch (color) {
            case 'free':
                return 'gray'
            case 'alpha':
                return 'silver'
            default:
                return color
        }
    },
    init: function () {
        console.group('init')
        bg.edCb = document.getElementById('edClipboard')
        bg.loadSettings()
        bg.loadHistory()
        // set default badge text to empty string
        // we are comunicating with users only through badge background color
        chrome.browserAction.setBadgeText({
            text: ' ',
        })
        // we have to listen for messages
        bg.messageListener()
        // act when tab is changed
        // TODO: call only when needed? this is now used also if picker isn't active
        bg.tabOnChangeListener()
        // listen for shortcut commands
        bg.shortcutListener()
        console.groupEnd()
    },
}

document.addEventListener('DOMContentLoaded', function () {
    bg.init()
})
;(<any>window).bg = bg
