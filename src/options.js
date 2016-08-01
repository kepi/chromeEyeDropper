const NEED_BG_VERSION = 11 // minimum version of bg script we need

let bgPage = null

ready(init) // call init when ready

/**
 * Call function when document is ready
 *
 * @param {function} fn function to call when document is ready
 */
function ready(fn) {
    if (document.readyState != 'loading') {
        fn()
    } else {
        document.addEventListener('DOMContentLoaded', fn)
    }
}

function isChecked(elementId) {
    return document.getElementById(elementId).checked
}

// Saves options to localStorage.
function save_options() {
    console.group("Saving options to storage")

    for (setting in bgPage.bg.settings) {
        let element = document.getElementById(setting)
        if (element) {
            bgPage.bg.settings[setting] = element.checked
            console.info(`Setting ${setting}: ${bgPage.bg.settings[setting]}`)
        }
    }

    // cursor has multiple values (radio) - special handling needed
    bgPage.bg.settings.dropperCursor = document.getElementById('dropperCursorcrosshair').checked ? 'crosshair' : 'default'
    console.info(`Setting dropperCursor: ${bgPage.bg.settings.dropperCursor}`)

    bgPage.bg.saveSettings()

    // Update status to let user know options were saved.
    let status = document.getElementById("status")
    status.innerHTML = "Options Saved."
    setTimeout(function() {
        status.innerHTML = ""
    }, 750)

    console.groupEnd("Saving options to storage")
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    console.group("Restoring options from storage")
    for (setting in bgPage.bg.settings) {
        let element = document.getElementById(setting)
        if (element) {
            element.checked = bgPage.bg.settings[setting]
            console.info(`Setting ${setting}: ${bgPage.bg.settings[setting]}`)
        }
    }

    // cursor has multiple values (radio) - special handling needed
    document.getElementById(`dropperCursor${bgPage.bg.settings.dropperCursor}`).checked = true
    console.info(`Setting dropperCursor: ${bgPage.bg.settings.dropperCursor}`)

    console.groupEnd("Restoring options from storage")
}

function init() {
    chrome.runtime.getBackgroundPage((backgroundPage) => {
        gotBgPage(backgroundPage)
    })
}

function bgPageReady() {
    restore_options()

    document.getElementById('saveButton').onclick = () => {
        save_options()
    }
}

function gotBgPage(backgroundPage) {
    bgPage = backgroundPage
    if (bgPage.bg.version === undefined || bgPage.bg.version < NEED_BG_VERSION) {
        console.warn(`Background page reload. Current version: ${bgPage.bg.version}, need version: ${NEED_BG_VERSION}`)
        chrome.runtime.sendMessage({
            type: "reload-background"
        })
        setTimeout('bgPageReady', 1000)
    } else {
        bgPageReady()
    }
}
