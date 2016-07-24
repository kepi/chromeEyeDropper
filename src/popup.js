const NEED_BG_VERSION = 12 // minimum version of bg script we need

let bgPage = null
let boxes = {}

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

/**
 * Init of all things needed in popup
 */
function init() {
    console.group('popup init')
    console.info('document ready')

    initTabs()
    initExternalLinks()

    console.info('getting background page')
    chrome.runtime.getBackgroundPage((backgroundPage) => {
        gotBgPage(backgroundPage)
    })

    console.groupEnd('popup init');
}

/**
 * Init links on tabs
 */
function initTabs() {
    for (let n of document.getElementsByClassName('ed-tab')) {
        n.onclick = () => {
            switchTab(`tab-${n.id}`)
        }
    }

    console.info('tabs initialized')
}

/**
 * Init function which activates external links.
 *
 * External link is one with class set to 'ed-external' and data-url
 * attribute present.
 *
 * Because we are using this from popup, we can't use simple
 * href attribute, we will create new tab with help of chrome api.
 */
function initExternalLinks() {    
    for (let n of document.getElementsByClassName('ed-external')) {
        if (n.dataset.url) {
            n.onclick = () => {
                chrome.tabs.create({
                    url: n.dataset.url
                })
            }
        }
    }
    console.info('external links initialized')
}

/**
 * Callback - second phase of popup initialization after we got
 * connection to background page
 *
 * @param {object} backgroundPage remote object for background page
 */
function gotBgPage(backgroundPage) {
    console.group('popup init phase 2')
    bgPage = backgroundPage
    console.info(`Connected to background page version ${bgPage.bg.version}`)

    // reload background if we need new version
    if (bgPage.bg.version === undefined || bgPage.bg.version < NEED_BG_VERSION) {
        console.warn(`Background page reload. Current version: ${bgPage.bg.version}, need version: ${NEED_BG_VERSION}`)
        chrome.runtime.sendMessage({
            type: "reload-background"
        })
        setTimeout(bgPageReady, 1000)
    } else {
        bgPageReady()
    }


    console.groupEnd('popup init phase 2')
}

function bgPageReady() {
    // init pick button with selected tab
    chrome.tabs.getSelected(null, (tab) => {
        initPickButton(tab)
    })

    initColorBoxes()
    initColorHistory()
}

/**
 * Callback - Init pick button if it is possible
 *
 * We need to check if we are not on one of special pages:
 * - protocol starts with 'chrome'
 * - chrome webstore
 * - local page
 *
 */
function initPickButton(tab) {
    let pickEnabled = true;

    // special chrome pages
    if (tab.url.indexOf('chrome') == 0) {
        message = "Chrome doesn't allow extensions to interact with special Chrome pages like this one.";
        pickEnabled = false;
    }
    // chrome gallery
    else if (tab.url.indexOf('https://chrome.google.com/webstore') == 0) {
        message = "Chrome doesn't allow extensions to interact with Chrome Web Store.";
        pickEnabled = false;
    }
    // local pages
    else if (tab.url.indexOf('file') == 0) {
        message = "Chrome doesn't allow extensions to interact with local pages.";
        pickEnabled = false;
    }

    if (pickEnabled) {
        document.getElementById('pick').onclick = () => {
            bgPage.bg.useTab(tab)
            bgPage.bg.activate()
            window.close()
        }
    }
}

function initColorBoxes() {
    boxes = {
        current: document.getElementById('box-current'),
        new: document.getElementById('box-new')
    }

    drawColorBoxes()
}

function drawColorBoxes() {
    colorBox('current', bgPage.bg.getColor())
    colorBox('new', bgPage.bg.getColor())
}

function clearHistory() {
    console.info("Clearing color history")
    chrome.runtime.sendMessage({
        type: "clear-history"
    }, () => {
        console.info("History cleared")
        console.log(bgPage.bg.getPalette())
        drawColorHistory()
        drawColorBoxes()
    })
}

function drawColorHistory() {
    console.info("Drawing color history")
        // find element for colors history squares and instructions
    let history_el = document.getElementById('colors-history')
    let instructions_el = document.getElementById('colors-history-instructions')
    let toolbar_el = document.getElementById('colors-history-toolbar')

    // first load history from palette and assemble html
    let html = ''
    let history = bgPage.bg.getPalette()
    for (let color of history) {
        html += colorSquare(color.hex)
    }
    history_el.innerHTML = html

    // attach javascript onmouseover and onclick events
    for (let n of document.getElementsByClassName('colors-history-square')) {
        n.onmouseover = () => {
            colorBox('new', n.dataset.color)
        }

        n.onclick = () => {
            colorBox('current', n.dataset.color)
            bgPage.bg.setColor(n.dataset.color, false)
        }
    }

    if (history.length > 0) {
        instructions_el.innerHTML = 'Hover over squares to preview, click to select and copy to clipboard.'
        toolbar_el.style.display = ''
    } else {
        instructions_el.innerHTML = 'History is empty, try to pick some colors first.'
        toolbar_el.style.display = 'none'
    }
}

function initColorHistory() {
    drawColorHistory()

    // attach events to history buttons
    document.getElementById('colors-history-clear').onclick = () => {
        clearHistory()
    }

    // export colors history
    document.getElementById('colors-history-export').onclick = () => {
        exportHistory()
    }
}

function exportHistory() {
    console.warn("TODO: export history not implemented")
}

/**
 * TODO: Handle tab switching
 *
 * TODO: handle ajax loading
 * TODO: handle pamatovani si jestli uz je nacteny nebo ne
 *
 * @param {string} tabId id of tab to switch to
 *
 */
function switchTab(tabId) {
    console.warn(`TODO: Switch to ${tabId}`)
}

function colorBox(type, color) {
    if (boxes[type]) {
        color = pusher.color(color)
        console.info(`Setting ${type} box color to ${color.hex6()}`)

        let formats = [color.hex6(), color.hex3(), color.html('keyword'), color.html('hsl'), color.html('rgb')];

        let html = ''
        for (let key in formats) {
            html += `<span class="fl mr3 bg-white br1 ph1 mb1"><code>${formats[key]}</code></span>`
        }
        boxes[type].innerHTML = html

        boxes[type].style = `background: ${color.hex6()}`
    }
}

function colorSquare(color) {
    return `<div class="fl dib dim mr1 br1 ba b--gray colors-history-square" data-color="${color}" style="background-color: ${color}">&nbsp;</div>`
}

// open options page
// chrome.runtime.openOptionsPage()
