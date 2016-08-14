ready(init)

function ready(fn) {
    if (document.readyState != 'loading') {
        fn()
    } else {
        document.addEventListener('DOMContentLoaded', fn)
    }
}

function init() {
    chrome.runtime.getBackgroundPage((bgPage) => {
        document.getElementById('debugImage').src = bgPage.bg.debugImage
    })

    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        console.info("got req")
        console.info(req)
        if (req.reqtype == "update")
            console.info("reloading")
            window.location.reload()
    })
}
