const NEED_BG_VERSION = 14 // minimum version of bg script we need

let bgPage = undefined
let el_products = undefined

let sec_plus_locked = undefined
let sec_plus_unlocked = undefined
let div_plus_type = undefined
let div_edplus_failed = undefined

ready(init)

function ready(fn) {
    if (document.readyState != 'loading') {
        fn()
    } else {
        document.addEventListener('DOMContentLoaded', fn)
    }
}

function init() {
    el_products = document.getElementById('edplus-products')
    sec_plus_locked = document.getElementById('plus-locked')
    sec_plus_unlocked = document.getElementById('plus-unlocked')
    div_plus_type = document.getElementById('plus-type')
    div_edplus_failed = document.getElementById('edplus-failed')

    chrome.runtime.getBackgroundPage((bg_page) => {
        bgPage = bg_page

        if (bgPage.bg.version === undefined || bgPage.bg.version < NEED_BG_VERSION) {
            console.warn(`Background page reload. Current version: ${bgPage.bg.version}, need version: ${NEED_BG_VERSION}`)
            chrome.runtime.sendMessage({
                type: "reload-background"
            })
            setTimeout(bgPageLoaded, 1000)
        } else {
            bgPageLoaded()
        }
    })

    donateBitcoinButton()
    unlockButtons()
}

function donateBitcoinButton() {
    $('#donate-bitcoin').coinTipper({
        type: 'donate',
        currency: 'bitcoin',
        iso: 'BTC',
        address: '19HekXcETbG8VWdywbEkKxzxp4fFm5YCUc',
        label: 'Eye Dropper'
    });
}

function showHideBlocks() {
    if (bgPage.bg.plus()) {
        sec_plus_locked.style.display = 'none'
        sec_plus_unlocked.style.display = 'block'

        if (bgPage.bg.plus() != 'free' && bgPage.bg.plus() != 'donation') {
            div_plus_type.innerHTML = `${bgPage.bg.plus()[0].toUpperCase() + bgPage.bg.plus().slice(1)} Patron`
            div_plus_type.className = `pa2 b white bg-${bgPage.bg.plusColor()}`
        }

    } else {
        sec_plus_locked.style.display = 'block'
        sec_plus_unlocked.style.display = 'none'
    }
}

function bgPageLoaded(bgPage) {
    showHideBlocks()
    getSkuDetails()
}

function getPurchases() {
    google.payments.inapp.getPurchases({
        'parameters': {
            'env': 'prod'
        },
        'success': onLicenseUpdate,
        'failure': (res) => {
            console.error(`Error retrieving purchases: ${res.response.errorType}`)
        }
    });
}

function onLicenseUpdate(res) {
    console.info('Got Purchases')

    for (let product of res.response.details) {
        console.info(`Product ${product.sku} state ${product.state}`)

        if (bgPage.bg.plus() === product.sku) {
            if (product.state !== 'ACTIVE' && product.state !== 'PENDING') {
                lockPlus()
            }
        } else {
            if (product.state === 'ACTIVE' || product.state === 'PENDING') {
                unlockPlus(product.sku)
            }
        }
    }
}

function getSkuDetails() {
    google.payments.inapp.getSkuDetails({
        'parameters': {
            'env': 'prod'
        },
        'success': onSkuDetails,
        'failure': (res) => {

            if (res.response.errorType == 'TOKEN_MISSING_ERROR') {
                // FIXME: zobrazit hezčí hlášku a možná howto?
                el_products.innerHTML = '<p class="bg-light-red pa3 b">You have to <a href="https://support.google.com/chrome/answer/185277" target="_blank">Sign-in to Chrome</a> to be able to purchase Plus version.</p>'
            } else {
                console.error(
                    `Error retrieving product list: ${res.response.errorType}`)
                console.log(res)

                el_products.innerHTML = "Can't connect to Chrome Web Store now"
            }
        }
    })
}

function unlockButtons() {
    document.getElementById('unlock-free').onclick = () => {
        unlockPlus('free')
    }

    document.getElementById('unlock-donations').onclick = () => {
        unlockPlus('donation')
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

function productRow(prod) {
    let price = (prod.prices[0].valueMicros / 1000000);
    let currency_code = prod.prices[0].currencyCode;

    let fmt_price = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency_code
    }).format(price)

    let title = prod.localeData[0].title;
    let desc = prod.localeData[0].description;

    return `<div id="${prod.sku}" class="product cf pa2 mb1 bg-${bgPage.bg.plusColor(prod.sku)}"><span class="fl f5 b white w-50">${title}</span><button class="dib fr w-50 tr">Unlock for ${fmt_price}</button></div>`
}

function buy(sku) {
    google.payments.inapp.buy({
        'parameters': {
            'env': 'prod'
        },
        'sku': sku,
        'success': onPurchase,
        'failure': onPurchaseFail
    })
}

function onPurchase(res) {
    unlockPlus('patron')
    // FIXME: unlock
    console.log("purchase done")
    console.log(res)
}

function onPurchaseFail(res) {
    div_edplus_failed.innerHTML = 'Sorry, purchase from Google Store failed. Please try again or use donate option.'
    div_edplus_failed.className += "pa3 bg-yellow red mb2 b"

    bgPage.bg.settings.plus = false;
    console.log("purchase failed")
    console.log(res)
}

function onSkuDetails(res) {
    getPurchases()
    let output = ''

    console.info(res.response.details.inAppProducts)

    res.response.details.inAppProducts.sort((a, b) => {
        return b.prices[0].valueMicros - a.prices[0].valueMicros
    })

    for (let product of res.response.details.inAppProducts) {
        output += productRow(product)
    }

    el_products.innerHTML = output

    for (let n of document.getElementsByClassName('product')) {
        n.onclick = () => {
            console.log(`Unlocking ${n.id} started`)
            buy(n.id)
        }
    }
}
