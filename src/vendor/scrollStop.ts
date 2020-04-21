/*!
 * Modified scrollStop.js from https://vanillajstoolkit.com/helpers/scrollstop/
 * Original author: (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
 *
 */
const scrollStop = function(callback, action='start'): void {
    // Make sure a valid callback was provided
    if (!callback || typeof callback !== 'function') return

    // Setup scrolling variable
    let isScrolling
    let scrollEvent = function(event) {
        // Clear our timeout throughout the scroll
        window.clearTimeout(isScrolling)

        // Set a timeout to run after scrolling ends
        isScrolling = setTimeout(function() {
            // Run the callback
            callback()
        }, 250)
    }

    if ( action == 'start') {
        // Listen for scroll events
        window.addEventListener(
            'scroll',
            scrollEvent,
            false,
        )
    } else {
        // Listen for scroll events
        window.removeEventListener(
            'scroll',
            scrollEvent,
            false,
        )
    }
}

export default scrollStop
