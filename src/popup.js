const NEED_BG_VERSION = 12 // minimum version of bg script we need

let bgPage = null
let boxes = {}
let tab_ins = {}

// section elements
let sec_color_boxes = null
let sec_color_history = null
let sec_content = null

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

    sec_content = document.getElementById('content')
    sec_color_boxes = document.getElementById('color-boxes')
    sec_color_history = document.getElementById('color-history')
}

/**
 * Init links on tabs
 */
function initTabs() {
    for (let n of document.getElementsByClassName('ed-tab')) {
        n.onclick = () => {
            switchTab(n.id)
        }
    }

    for (let n of document.getElementsByClassName('ed-tab-in')) {
        tab_ins[n.id] = n
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
    let message = ''

    // special chrome pages
    if (tab.url.indexOf('chrome') == 0) {
        message = "Chrome doesn't allow <i>extensions</i> to play with special Chrome pages like this one. <pre>chrome://...</pre>";
        pickEnabled = false;
    }
    // chrome gallery
    else if (tab.url.indexOf('https://chrome.google.com/webstore') == 0) {
        message = "Chrome doesn't allow its <i>extensions</i> to play on Web Store.";
        pickEnabled = false;
    }
    // local pages
    else if (tab.url.indexOf('file') == 0) {
        message = "Chrome doesn't allow its <i>extensions</i> to play with your local pages.";
        pickEnabled = false;
    }

    let pick_el = document.getElementById('pick')
    if (pickEnabled) {
        pick_el.onclick = () => {
            bgPage.bg.useTab(tab)
            bgPage.bg.activate()
            window.close()
        }
    } else {
        let message_el = document.getElementById('pick-message')
        message_el.innerHTML = `<h3 class="normal">&#128542; Whoops. Can't pick from this page</h3><p>${message}</p>`
        message_el.style.display = 'block'
        pick_el.style.display = 'none'
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
        instructions_el.innerHTML = 'Hover over squares to preview.'
        toolbar_el.style.display = ''
    } else {
        instructions_el.innerHTML = 'History is empty, try to pick some colors first.'
        toolbar_el.style.display = 'none'
    }

    history_el.onmouseenter = () => {
        instructions_el.innerHTML = 'Click on square to select and copy to clipboard.'
    }
    history_el.onmouseleave = () => {
        instructions_el.innerHTML = 'Hover over squares to preview..'
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
    let history = bgPage.bg.getPalette()
    let csv = 'data:text/csv;charset=utf-8,'


    csv += '"Name","Date","RGB Hex","RGB Hex3","HTML Keyword","HSL","RGB"'
    csv += "\n"

    for (let color of history) {
        let d = new Date(color.timestamp)
        let datestring = `${d.getFullYear()}-${("0"+(d.getMonth()+1)).slice(-2)}-${("0" + d.getDate()).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}:${("0" + d.getSeconds()).slice(-2)}`;

        csv += `"${color.name}","${datestring}"`

        color = pusher.color(color.hex)
        let formats = [color.hex6(), color.hex3(), color.html('keyword'), color.html('hsl'), color.html('rgb')];
        for (let format of formats) {
            csv += `,"${format}"`
        }
        csv += "\n"
    }

    let data = encodeURI(csv)

    console.group("csvExport")
    console.log(csv)
    console.groupEnd("csvExport")

    let link = document.createElement('a')
    link.setAttribute('href', data)
    link.setAttribute('download', 'export.csv')
    link.click()
}

/**
 * Handle tab switching
 *
 * TODO: handle ajax loading
 * TODO: handle pamatovani si jestli uz je nacteny nebo ne
 *
 * FIXME: change to something sane and not so ugly
 *
 * @param {string} tabId id of tab to switch to
 *
 */
function switchTab(tabId) {
    // on button-about hide history and color boxes
    if (tabId === 'button-about') {
        sec_color_boxes.style.display = 'none'
        sec_color_history.style.display = 'none'

        // display them on others
    } else {
        sec_color_boxes.style.display = 'block'
        sec_color_history.style.display = 'block'
    }

    for (let tab_id in tab_ins) {

        if ((tab_id.match(/-active$/) && tab_id !== `${tabId}-active`) || (tab_id.match(/-link$/) && tab_id === `${tabId}-link`)) {
            tab_ins[tab_id].style.display = 'none'
        } else {
            tab_ins[tab_id].style.display = 'inline-block'
        }
    }

    // tab_ins[`${tabId}-active`].style.display = 'inline-block'
    // tab_ins[`${tabId}-link`].style.display = 'none'

    loadTab(tabId)
}

function loadTab(tabId) {
    console.group("tabSwitch")
    let content_found = false
    for (let n of document.getElementsByClassName('content-page')) {
        console.info(`found tab content ${n.id}`)
        if (n.id === `${tabId}-content`) {
            n.style.display = 'block'
            content_found = true
            console.info(`Found content for ${n.id}, switching.`)
        } else {
            n.style.display = 'none'
            console.info(`Hiding content for tab ${n.id}`)
        }
    }

    if (!content_found) {
        console.info("XMLHttp: No content found, loading through AJAX")
        let request = new XMLHttpRequest()
        request.open('GET', `/html/${tabId}.html`)

        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                sec_content.insertAdjacentHTML('afterend', request.responseText)
                initExternalLinks()
            } else {
                console.error(`Error loading ${tab.id} content through AJAX: ${request.status}`)
            }
        }

        request.send()
    }
    console.groupEnd('tabSwitch')
}

function colorBox(type, color) {
    if (boxes[type]) {
        color = pusher.color(color)
        console.info(`Setting ${type} box color to ${color.hex6()}`)

        let formats = [color.hex6(), color.hex3(), color.html('keyword'), color.html('hsl'), color.html('rgb')];

        let html = ''
        for (let value of formats) {
            html += `<span class="mr1 bg-white br1 ph1 mb1 dib"><code>${value}</code></span>`
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
