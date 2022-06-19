import { EdColor } from './ed-color'
import { mscConfirm, mscPrompt } from 'medium-style-confirm'
import ColorPicker from 'simple-color-picker'
import { copyToClipboard } from './clipboard'

const NEED_BG_VERSION = 18 // minimum version of bg script we need

let bgPage = null

type boxes = {
    "current": HTMLElement | null
    "new": HTMLElement | null
}

let boxes: boxes = {
    current: null,
    new: null,
}
let tab_ins = {}

// section elements
let sec_color_boxes = null
let sec_color_history = null
let sec_content = null

// palettes
let sec_color_palette = null
let span_palette_name = null

// plus
let badge = null

// cpicker elements
let cpicker : ColorPicker | null = null
let cpicker_input = null

ready(init) // call init when ready

/**
 * Call function when document is ready
 *
 * @param {function} fn function to call when document is ready
 */
function ready(fn: () => void) {
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

    console.groupEnd()

    sec_content = document.getElementById('content')
    sec_color_boxes = document.getElementById('color-boxes')
    sec_color_history = document.getElementById('color-history')
    badge = document.getElementById('plus-badge')
    badge.style.display = 'none'
}

function initPlus() {
    let colors_palette_change = document.getElementById('colors-palette-change')

    if (bgPage.bg.plus()) {
        colors_palette_change.style.display = 'inline'

        badge.innerHTML = '<span class="small-caps b">Plus</span>'
        badge.className =
            'ed-external link hint--right hint--no-animate block pv1 ph2 mt1 db silver no-underline'

        let badge_hint = 'You unlocked Plus. Thanks!'
        if (bgPage.bg.plus() === 'free') {
            badge_hint = 'Unlocked for free. Want to donate for future development?'
        }
        badge.setAttribute('aria-label', badge_hint)
    } else {
        switchToDefaultPalette()
        colors_palette_change.style.display = 'none'
    }

    badge.style.display = 'block'
}

/**
 * Init links on tabs
 */
function initTabs() {
    const tabs = document.getElementsByClassName('ed-tab') as HTMLCollectionOf<HTMLElement>

    for (let n of tabs) {
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

function initExternalLink(n: HTMLLinkElement) {
    if (n.dataset.url) {
        n.onclick = () => {
            chrome.tabs.create({
                url: n.dataset.url,
            })
        }
    }
}
function initExternalLinks() {
    for (let n of document.getElementsByClassName('ed-external') as HTMLCollectionOf<HTMLLinkElement>) {
        initExternalLink(n)
    }
    console.info('external links initialized')
}

/**
 * Callback - second phase of popup initialization after we got
 * connection to background page
 *
 * @param {object} backgroundPage remote object for background page
 */
function gotBgPage(backgroundPage: Window) {
    console.group('popup init phase 2')
    bgPage = backgroundPage
    console.info(`Connected to background page version ${bgPage.bg.version}`)

    // reload background if we need new version
    if (bgPage.bg.version === undefined || bgPage.bg.version < NEED_BG_VERSION) {
        console.warn(
            `Background page reload. Current version: ${bgPage.bg.version}, need version: ${NEED_BG_VERSION}`,
        )
        chrome.runtime.sendMessage({
            type: 'reload-background',
        })
        setTimeout(bgPageReady, 1000)
    } else {
        bgPageReady()
    }

    console.groupEnd()
}

function bgPageReady() {
    // init pick button with selected tab
    chrome.tabs.query({active: true, currentWindow: true}, ((tabs: [chrome.tabs.Tab]) => {
        initPickButton(tabs[0])
    }))

    initColorBoxes()
    initColorHistory()
    initPlus()
}

/**
 * Add Pick Button with enabled or disabled state and appropriate message
 *
 */

function pickButton(tab: chrome.tabs.Tab, enabled: boolean, message = '') {
    let pick_el = document.getElementById('pick')
    if (enabled) {
        pick_el.onclick = () => {
            bgPage.bg.useTab(tab)
            bgPage.bg.activate()
            window.close()
        }
    } else {
        let message_el = document.getElementById('pick-message')
        message_el.innerHTML = `<h3 class="normal">&#128542; Whoops. Can't pick from this page</h3><p class="lh-copy">${message}</p>`
        message_el.style.display = 'block'
        pick_el.style.display = 'none'
    }
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
function initPickButton(tab: chrome.tabs.Tab) {
    // special chrome pages
    if (tab.url === undefined || tab.url.indexOf('chrome') == 0) {
        pickButton(
            tab,
            false,
            "Chrome doesn't allow <i>extensions</i> to play with special Chrome pages like this one. <pre>chrome://...</pre>",
        )
    }
    // chrome gallery
    else if (tab.url.indexOf('https://chrome.google.com/webstore') == 0) {
        pickButton(tab, false, "Chrome doesn't allow its <i>extensions</i> to play on Web Store.")
    }
    // local pages
    else if (tab.url.indexOf('file') === 0) {
        chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
            if (isAllowedAccess) {
                pickButton(tab, true)
            } else {
                pickButton(
                    tab,
                    false,
                    '<strong>Eye Dropper</strong> can\'t access local pages unless you grant it the permission. Check <a href="#" id="link-help-file-urls" data-url="https://eyedropper.org/help/file-urls">the instructions how to allow it</a>.',
                )
                initExternalLink(document.getElementById('link-help-file-urls') as HTMLLinkElement)
            }
        })
    } else {
        pickButton(tab, true)
    }
}

function initColorBoxes() {
    boxes = {
        current: document.getElementById('box-current'),
        new: document.getElementById('box-new'),
    }

    drawColorBoxes()
}

function drawColorBoxes() {
    colorBox('current', bgPage.bg.getColor())
    colorBox('new', bgPage.bg.getColor())
}

function clearPalette() {
    mscConfirm({
        title: 'Wipe It?',
        subtitle: `Really clear palette ${bgPage.bg.getPaletteName()}?`,
        okText: 'Yes, Wipe It!',
        cancelText: 'No',
        onOk: () => {
            console.info('Clearing color history')
            chrome.runtime.sendMessage(
                {
                    type: 'clear-history',
                },
                () => {
                    console.info('History cleared')
                    drawColorHistory()
                    drawColorBoxes()
                },
            )
        },
    })
}

function destroyPalette(palette_name: string) {
    mscConfirm({
        title: `Destroy Palette '${palette_name}'?`,
        subtitle: `Really destroy palette ${palette_name}?`,
        okText: 'Yes, Destroy It!',
        cancelText: 'No',
        onOk: () => {
            let destroying_current = palette_name === bgPage.bg.getPaletteName()
            bgPage.bg.destroyPalette(palette_name)
            if (destroying_current) {
                switchColorPalette('default')
            } else {
                drawColorPalettes()
            }
        },
    })
}

function drawColorHistory() {
    console.info('Drawing color history')
    // find element for colors history squares and instructions
    let history_el = document.getElementById('colors-history')
    let instructions_el = document.getElementById('colors-history-instructions')

    const history_tool_noempty_els = document.getElementsByClassName(
        'eb-history-tool-noempty',
    ) as HTMLCollectionOf<HTMLElement>

    // first load history from palette and assemble html
    let html = ''
    let palette = bgPage.bg.getPalette()
    for (let color of palette.colors) {
        html += colorSquare(color.h)
    }
    history_el.innerHTML = html

    // attach javascript onmouseover and onclick events
    const squares = document.getElementsByClassName(
        'colors-history-square',
    ) as HTMLCollectionOf<HTMLElement>
    for (let n of squares) {
        n.onmouseover = () => {
            colorBox('new', n.dataset.color)
        }

        n.onclick = () => {
            colorBox('current', n.dataset.color)
            setColor(n.dataset.color, false)
            changeColorPicker(n.dataset.color)
        }
    }

    if (palette.colors.length > 0) {
        instructions_el.innerHTML = 'Hover over squares to preview.'
        for (let n of history_tool_noempty_els) {
            n.style.display = ''
        }
    } else {
        instructions_el.innerHTML = 'History is empty, try to pick some colors first.'
        for (let n of history_tool_noempty_els) {
            n.style.display = 'none'
        }
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
        clearPalette()
    }

    // export colors history
    document.getElementById('colors-history-export').onclick = () => {
        exportHistory()
    }

    // color palette switching
    drawColorPaletteSwitching()
}

function drawColorPaletteSwitching() {
    let colors_palette_change = document.getElementById('colors-palette-change')

    sec_color_palette = document.getElementById('colors-palette')
    span_palette_name = document.getElementById('palette-name')

    colors_palette_change.onclick = () => {
        sec_color_palette.style.display =
            sec_color_palette.style.display === 'none' ? 'inline-block' : 'none'
    }

    drawColorPalettes()
}

function drawColorPalettes() {
    let palettes =
        '<a href="#" class="dib link dim ph2 ml1 white bg-dark-green br1 b--dark-green mb1" id="new-palette">new</a>'

    let palette_name = bgPage.bg.getPaletteName()

    // change palette name in popup display and set data-palette attribute
    span_palette_name.innerHTML = palette_name
    span_palette_name.dataset.palette = palette_name

    for (let palette of bgPage.bg.getPaletteNames()) {
        palettes += `<span class="nowrap dib"><a href="#" class="ed-palette dib link dim pl2 pr1 ml1 white bg-light-purple br1 b--light-purple mb1" data-palette="${palette}">${palette}`

        let colors = bgPage.bg.getPalette(palette).colors.length
        if (colors > 0) {
            palettes += `<span class="dib pink pl1">${colors}</span>`
        }

        if (palette !== 'default') {
            palettes += `
                <a class="ed-palette-destroy link dib w1 hint--top hint--no-animate hint--rounded" aria-label="Destroy Palette ${palette}!" data-palette="${palette}" href="#">
                <svg class="dim v-mid" viewBox="0 0 1792 1792" style="fill:gray;width:14px;">
                <use xlink:href="/img/icons.svg#fa-ban">
                </svg>
                </a>`
        }
        palettes += '</a></span>'
    }

    sec_color_palette.innerHTML = palettes

    // Support for palette click
    const paletes = document.getElementsByClassName('ed-palette') as HTMLCollectionOf<HTMLElement>
    for (let n of paletes) {
        n.onclick = () => {
            let palette = n.dataset.palette
            console.info(`Asked to switch to palette ${palette}`)
            if (palette !== palette_name) {
                switchColorPalette(palette)
            }
        }
    }

    // Support for palete destroy click
    const palette_destroys = document.getElementsByClassName(
        'ed-palette-destroy',
    ) as HTMLCollectionOf<HTMLElement>
    for (let n of palette_destroys) {
        n.onclick = () => {
            let palette = n.dataset.palette
            console.info(`Asked to destroy palette ${palette}`)
            destroyPalette(palette)
        }
    }

    document.getElementById('new-palette').onclick = () => {
        mscPrompt({
            title: 'Name the Color Palette',
            // subtitle: "No worries, you can rename it any time.",
            okText: 'Create Palette',
            cancelText: 'Cancel',
            placeholder: 'palette',
            onOk: (name: string) => {
                createColorPalette(name)
            },
        })
    }
}

function createColorPalette(name: string) {
    if (name !== null) {
        switchColorPalette(bgPage.bg.createPalette(name).name)
    }
}

function switchToDefaultPalette() {
    switchColorPalette(bgPage.bg.defaultPalette)
}

function switchColorPalette(palette: string) {
    console.info(`Switching to palette ${palette}`)
    bgPage.bg.changePalette(palette)
    console.info('Redrawing history and boxes')
    drawColorPalettes()
    drawColorHistory()
}

function exportHistory() {
    let history = bgPage.bg.getPalette().colors
    let csv = ''

    if (bgPage.bg.plus()) {
        csv += '"RGB Hex","Date","Source","RGB Hex3","HSL","RGB","HTML Keyword"'
        csv += '\n'

        for (let color of history) {
            let d = typeof color.t === 'function' ? new Date(color.t()) : new Date(color.t)
            let datestring = `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${(
                '0' + d.getDate()
            ).slice(-2)} ${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${(
                '0' + d.getSeconds()
            ).slice(-2)}`

            csv += `"${color.h}","${datestring}","${bgPage.bg.color_sources[color.s]}"`

            color = new EdColor(color.h)
            let formats = [
                color.toHex3String(),
                color.toHslString(),
                color.toRgbString(),
                color.toName(),
            ]
            for (let format of formats) {
                csv += `,"${format}"`
            }
            csv += '\n'
        }
    } else {
        csv += '"RGB Hex","RGB Hex3","HSL","RGB","HTML Keyword"'
        csv += '\n'

        for (let color of history) {
            csv += `"${color.h}"`

            color = new EdColor(color.h)
            let formats = [
                color.toHex3String(),
                color.toHslString(),
                color.toRgbString(),
                color.toName(),
            ]
            for (let format of formats) {
                csv += `,"${format}"`
            }
            csv += '\n'
        }
    }

    let data = 'data:text/csv;base64,' + btoa(csv)

    console.group('csvExport')
    console.log(csv)
    console.groupEnd()

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
function switchTab(tabId: string) {
    // on button-about hide history and color boxes
    if (tabId === 'button-about') {
        sec_color_boxes.style.display = 'none'
        sec_color_history.style.display = 'none'

        // display them on others
    } else {
        sec_color_boxes.style.display = 'block'
        sec_color_history.style.display = 'block'
    }

    // color picker tab
    if (cpicker) {
        cpicker.remove()
    }

    for (let tab_id in tab_ins) {
        if (
            (tab_id.match(/-active$/) && tab_id !== `${tabId}-active`) ||
            (tab_id.match(/-link$/) && tab_id === `${tabId}-link`)
        ) {
            tab_ins[tab_id].style.display = 'none'
        } else {
            tab_ins[tab_id].style.display = 'inline-block'
        }
    }

    loadTab(tabId)
}

function loadTab(tabId: string) {
    console.group('tabSwitch')
    let content_found = false
    const content_pages = document.getElementsByClassName(
        'content-page',
    ) as HTMLCollectionOf<HTMLElement>
    for (let n of content_pages) {
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
        console.info('XMLHttp: No content found, loading through AJAX')
        let request = new XMLHttpRequest()
        request.open('GET', `/${tabId}.html`)

        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                sec_content.insertAdjacentHTML('afterend', request.responseText)

                initExternalLinks()
                if (tabId === 'tab-cp') {
                    loadColorPicker()
                }
            } else {
                console.error(`Error loading ${tabId} content through AJAX: ${request.status}`)
            }
        }

        request.send()
    } else {
        // color picker tab
        if (tabId === 'tab-cp') {
            showColorPicker()
        }
    }
    console.groupEnd()
}

function colorBox(type: "new" | "current", color_hex: string) {
    if (boxes[type]) {
        const color = new EdColor(color_hex)

        let formats = [
            color.toHexString(),
            color.toHex3String(),
            color.toName(),
            color.toHslString(),
            color.toRgbString(),
        ]

        let html = ''
        for (let value of formats) {
            if (value) {
                html += `<span class="mr1 bg-white br1 ph1 mb1 dib"><code>${value}</code></span>`
            } else {
                html += `<span class="mr1 br1 ph1 mb1 dib" style="min-width: 3em;">&nbsp;</span>`
            }
        }
        boxes[type].innerHTML = html
        boxes[type].setAttribute("style", `background: ${color.toHexString()}`)
    }
}

function colorSquare(color_hex: string) {
    return `<div class="fl dib dim mr1 br1 mb1 ba b--gray colors-history-square" data-color="${color_hex}" style="background-color: ${color_hex}">&nbsp;</div>`
}

function loadColorPicker() {
    console.info('Showing cpicker')
    cpicker_input = document.getElementById('colorpicker-input')
    cpicker_input.value = bgPage.bg.getColor()

    showColorPicker()

    document.getElementById('colorpicker-select').onclick = () => {
        let color = cpicker_input.value.toLowerCase()
        colorBox('current', color)
        setColor(color, true, 2)
        drawColorHistory()
    }

    // Listen for changes from input field
    cpicker_input.addEventListener('input', () => {
        // no color format can be smaller then 3 chars
        if (cpicker_input.value.length >= 3) {
            // try to create new EdColor instance
            const c = new EdColor(cpicker_input.value)
            // if it is working, change color in picker
            if (c) {
                cpicker.setColor(c.toHexString())
            }
        }
    })
}

function setColor(color: string, history = true, source = 1, url?: string) {
    // save color to clipboard
    if (bgPage.bg.settings.autoClipboard) {
        const color_with_o_wo_grid = bgPage.bg.settings.autoClipboardNoGrid ? color.substring(1) : color
        copyToClipboard(color_with_o_wo_grid)
    }

    bgPage.bg.setColor(color, history, source, url)
}

function showColorPicker() {
    // create new cpicker instance
    cpicker = new ColorPicker({
        el: document.getElementById('colorpicker'),
        color: cpicker_input.value,
    })

    // listen on picker changes
    cpicker.onChange(() => {
        const color = cpicker.getHexString().toLowerCase()

        // do not change input value if color change was caused externally
        if (cpicker.isChoosing) {
            cpicker_input.value = color
        }

        // always change new colorBox to new color
        colorBox('new', color)
    })
}

function changeColorPicker(color_hex: string) {
    if (cpicker) {
        cpicker_input.value = color_hex
        cpicker.setColor(color_hex)
    }
}
