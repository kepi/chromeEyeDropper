const NEED_BG_VERSION = 14 // minimum version of bg script we need

let bgPage = undefined
let el_products = undefined

let sec_plus_locked = undefined
let sec_plus_unlocked = undefined

ready(init)

function ready(fn) {
    if (document.readyState != 'loading') {
        fn()
    } else {
        document.addEventListener('DOMContentLoaded', fn)
    }
}

function init() {
    sec_plus_locked = document.getElementsByClassName('plus-locked')
    sec_plus_unlocked = document.getElementsByClassName('plus-unlocked')

    chrome.runtime.getBackgroundPage((bg_page) => {
        bgPage = bg_page

        if (bgPage.bg.version === undefined || bgPage.bg.version < NEED_BG_VERSION) {
            console.warn(
                `Background page reload. Current version: ${bgPage.bg.version}, need version: ${NEED_BG_VERSION}`,
            )
            chrome.runtime.sendMessage({
                type: 'reload-background',
            })
            setTimeout(bgPageLoaded, 1000)
        } else {
            bgPageLoaded()
        }
    })

    unlockButtons()
}

function showHideBlocks() {
    const plus = bgPage.bg.plus()

    for (let locked of sec_plus_locked) {
        locked.style.display = plus ? 'none' : 'block'
    }
    for (let unlocked of sec_plus_unlocked) {
        unlocked.style.display = plus ? 'block' : 'none'
    }
}

function bgPageLoaded() {
    showHideBlocks()
}

function unlockButtons() {
    document.getElementById('unlock-new').onclick = () => {
        unlockPlus('new')
    }
}

function lockPlus() {
    bgPage.bg.lockPlus()
    showHideBlocks()
}

function unlockPlus(type) {
    bgPage.bg.unlockPlus(type)
    showHideBlocks()
}
