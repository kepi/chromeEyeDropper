var EDROPPER_VERSION = 11;
const CANVAS_MAX_SIZE = 32767 - 20
const DEBUG = false

var page = {
    width: $(document).width(),
    height: $(document).height(),
    imageData: null,
    canvasBorders: 20,
    canvasData: null,
    dropperActivated: false,
    screenWidth: 0,
    screenHeight: 0,
    options: {
        cursor: 'default',
        enableColorToolbox: true,
        enableColorTooltip: true,
        enableRightClickDeactivate: true
    },

    defaults: function() {
        page.canvas = document.createElement("canvas");
        page.rects = [];
        page.screenshoting = false;
    },

    // ---------------------------------
    // MESSAGING
    // ---------------------------------
    messageListener: function() {
        // Listen for pickup activate
        console.log('dropper: page activated');
        chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
            switch (req.type) {
                case 'edropper-version':
                    sendResponse({
                        version: EDROPPER_VERSION,
                        tabid: req.tabid
                    });
                    break;
                case 'pickup-activate':
                    page.options = req.options;
                    page.dropperActivate();
                    break;
                case 'pickup-deactivate':
                    page.dropperDeactivate();
                    break;
                case 'update-image':
                    console.log('dropper: background send me updated screenshot');
                    page.imageData = req.data;
                    page.capture();
                    break;
            }
        });
    },

    sendMessage: function(message) {
        chrome.extension.connect().postMessage(message);
    },

    // ---------------------------------
    // DROPPER CONTROL
    // ---------------------------------

    dropperActivate: function() {
        if (page.dropperActivated)
            return;

        // load external css for cursor changes
        var injectedCss = '<link id="eye-dropper-css-cursor" rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('inject/anchor-cursor-' + page.options.cursor + '.css?0.3.0') + '" /><link id="eye-dropper-css" rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('inject/edropper2.css?0.3.0') + '" />';

        if ($("head").length == 0) { // rare cases as i.e. image page
            $("body").before(injectedCss);
        } else {
            $("head").append(injectedCss);
        }

        // create overlay div
        $("body").before('<div id="eye-dropper-overlay" style="position: absolute; width: ' + page.width + 'px; height: ' + page.height + 'px; opacity: 1; background: none; border: none; z-index: 5000;"></div>');

        // insert tooltip and toolbox
        var inserted = ''
        if (page.options.enableColorTooltip === true) {
            inserted += '<div id="color-tooltip"> </div>';
        }
        if (page.options.enableColorToolbox === true) {
            inserted += '<div id="color-toolbox"><div id="color-toolbox-color"></div><div id="color-toolbox-text"></div></div>';
        }
        $("#eye-dropper-overlay").append(inserted);

        if (page.options.enableColorTooltip === true) {
            page.elColorTooltip = $('#color-tooltip');
        }
        if (page.options.enableColorToolbox === true) {
            page.elColorToolbox = $('#color-toolbox');
            page.elColorToolboxColor = $('#color-toolbox-color');
            page.elColorToolboxText = $('#color-toolbox-text');
        }

        console.log('dropper: activating page dropper');
        page.defaults();

        page.dropperActivated = true;
        page.screenChanged();

        // set listeners
        $(document).bind('scrollstop', page.onScrollStop);
        document.addEventListener("mousemove", page.onMouseMove, false);
        document.addEventListener("click", page.onMouseClick, false);
        if (page.options.enableRightClickDeactivate === true) {
            document.addEventListener("contextmenu", page.onContextMenu, false);
        }
        // enable keyboard shortcuts
        page.shortcuts(true);
    },

    dropperDeactivate: function() {
        if (!page.dropperActivated)
            return;

        // disable keyboard shortcuts
        page.shortcuts(false);

        // reset cursor changes
        $("#eye-dropper-overlay").css('cursor', 'default');
        $("#eye-dropper-css").remove();
        $("#eye-dropper-css-cursor").remove();

        page.dropperActivated = false;

        console.log('dropper: deactivating page dropper');
        document.removeEventListener("mousemove", page.onMouseMove, false);
        document.removeEventListener("click", page.onMouseClick, false);
        if (page.options.enableRightClickDeactivate === true) {
            document.removeEventListener("contextmenu", page.onContextMenu, false);
        }
        $(document).unbind('scrollstop', page.onScrollStop);

        if (page.options.enableColorTooltip === true) {
            page.elColorTooltip.remove();
        }
        if (page.options.enableColorToolbox === true) {
            page.elColorToolbox.remove();
        }
        $("#eye-dropper-overlay").remove();
    },

    // ---------------------------------
    // EVENT HANDLING
    // ---------------------------------

    onMouseMove: function(e) {
        if (!page.dropperActivated)
            return;

        page.tooltip(e);
    },

    onMouseClick: function(e) {
        if (!page.dropperActivated)
            return;

        e.preventDefault();

        page.dropperDeactivate();
        page.sendMessage({
            type: "set-color",
            color: page.pickColor(e)
        });
    },

    onScrollStop: function() {
        if (!page.dropperActivated)
            return;

        console.log("dropper: Scroll stop");
        page.screenChanged();
    },

    onScrollStart: function() {
        if (!page.dropperActivated)
            return;

    },

    // keyboard shortcuts
    // enable with argument as true, disable with false
    shortcuts: function(start) {
        // enable shortcuts
        if (start == true) {
            shortcut.add('Esc', function(evt) {
                page.dropperDeactivate();
            });
            shortcut.add('U', function(evt) {
                page.screenChanged(true);
            });

            // disable shortcuts
        } else {
            shortcut.remove('U');
            shortcut.remove('Esc');
        }
    },


    // right click
    onContextMenu: function(e) {
        if (!page.dropperActivated)
            return;

        e.preventDefault();

        page.dropperDeactivate();
    },

    // window is resized
    onWindowResize: function(e) {
        if (!page.dropperActivated)
            return;

        console.log('dropper: window resized');

        // set defaults
        page.defaults();

        // width and height changed so we have to get new one
        page.width = $(document).width();
        page.height = $(document).height();
        //page.screenWidth = window.innerWidth;
        //page.screenHeight = window.innerHeight;

        // also don't forget to set overlay
        $("#eye-dropper-overlay").css('width', page.width).css('height', page.height);

        // call screen chaned
        page.screenChanged();
    },

    // ---------------------------------
    // MISC
    // ---------------------------------

    tooltip: function(e) {
        if (!page.dropperActivated || page.screenshoting)
            return;

        var color = page.pickColor(e);
        var fromTop = -15;
        var fromLeft = 10;

        if ((e.pageX - page.XOffset) > page.screenWidth / 2)
            fromLeft = -20;
        if ((e.pageY - page.YOffset) < page.screenHeight / 2)
            fromTop = 15;

        // set tooltip
        if (page.options.enableColorTooltip === true) {
            page.elColorTooltip.css({
                'background-color': '#' + color.rgbhex,
                'top': e.pageY + fromTop,
                'left': e.pageX + fromLeft,
                'border-color': '#' + color.opposite
            }).show();
        }

        // set toolbox
        if (page.options.enableColorToolbox === true) {
            page.elColorToolboxColor.css({
                'background-color': '#' + color.rgbhex
            });
            page.elColorToolboxText.html('#' + color.rgbhex + '<br />rgb(' + color.r + ',' + color.g + ',' + color.b + ')');
            page.elColorToolbox.show();
        }
    },

    // return true if rectangle A is whole in rectangle B
    rectInRect: function(A, B) {
        if (A.x >= B.x && A.y >= B.y && (A.x + A.width) <= (B.x + B.width) && (A.y + A.height) <= (B.y + B.height))
            return true;
        else
            return false;
    },

    // found out if two points and length overlaps
    // and merge it if needed. Helper method for
    // rectMerge
    rectMergeGeneric: function(a1, a2, length) {
        // switch them if a2 is above a1
        if (a2 < a1) {
            tmp = a2;
            a2 = a1;
            a1 = tmp;
        }

        // shapes are overlaping
        if (a2 <= a1 + length)
            return {
                a: a1,
                length: (a2 - a1) + length
            };
        else
            return false;

    },

    // merge same x or y positioned rectangles if overlaps
    // width (or height) of B has to be equal to A
    rectMerge: function(A, B) {
        var t;

        // same x position and same width
        if (A.x == B.x && A.width == B.width) {
            t = page.rectMergeGeneric(A.y, B.y, A.height);

            if (t != false) {
                A.y = t.a;
                A.height = length;
                return A;
            }

            // same y position and same height
        } else if (A.y == B.y && A.height == B.height) {
            t = page.rectMergeGeneric(A.x, B.x, A.width);

            if (t != false) {
                A.x = t.a;
                A.width = length;
                return A;
            }
        }

        return false;
    },

    // ---------------------------------
    // COLORS
    // ---------------------------------

    pickColor: function(e) {
        if (page.canvasData === null)
            return;

        var canvasIndex = (e.pageX + e.pageY * page.canvas.width) * 4;
        ////console.log(e.pageX + ' ' + e.pageY + ' ' + page.canvas.width);

        var color = {
            r: page.canvasData[canvasIndex],
            g: page.canvasData[canvasIndex + 1],
            b: page.canvasData[canvasIndex + 2],
            alpha: page.canvasData[canvasIndex + 3]
        };

        color.rgbhex = page.rgbToHex(color.r, color.g, color.b);
        ////console.log(color.rgbhex);
        color.opposite = page.rgbToHex(255 - color.r, 255 - color.g, 255 - color.b);
        return color;
    },

    // i: color channel value, integer 0-255
    // returns two character string hex representation of a color channel (00-FF)
    toHex: function(i) {
        if (i === undefined) return 'FF'; // TODO this shouldn't happen; looks like offset/x/y might be off by one
        var str = i.toString(16);
        while (str.length < 2) {
            str = '0' + str;
        }
        return str;
    },

    // r,g,b: color channel value, integer 0-255
    // returns six character string hex representation of a color
    rgbToHex: function(r, g, b) {
        return page.toHex(r) + page.toHex(g) + page.toHex(b);
    },

    // ---------------------------------
    // UPDATING SCREEN
    // ---------------------------------

    checkCanvas: function() {
        // we have to create new canvas element
        if (page.canvas.width != (page.width + page.canvasBorders) || page.canvas.height != (page.height + page.canvasBorders)) {
            console.log('dropper: creating new canvas');
            page.canvas = document.createElement('canvas');
            page.canvas.width = page.width + page.canvasBorders;
            page.canvas.height = page.height + page.canvasBorders;
            page.canvasContext = page.canvas.getContext('2d');
            page.canvasContext.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
            page.rects = [];
        }
    },

    screenChanged: function(force) {
        if (!page.dropperActivated)
            return;

        console.log("dropper: screenChanged");
        page.YOffset = $(document).scrollTop();
        page.XOffset = $(document).scrollLeft();

        var rect = {
            x: page.XOffset,
            y: page.YOffset,
            width: page.screenWidth,
            height: page.screenHeight
        };

        // don't screenshot if we already have this one
        if (!force && page.rects.length > 0) {
            for (index in page.rects) {
                if (page.rectInRect(rect, page.rects[index])) {
                    console.log('dropper: already shoted, skipping');
                    return;
                }
            }
        }

        page.screenshoting = true;

        $("#eye-dropper-overlay").css('cursor', 'progress')

        console.log('dropper: screenshoting');
        // TODO: this is terrible. It have to be done better way
        if (page.options.enableColorTooltip === true && page.options.enableColorToolbox === true) {
            page.elColorTooltip.hide(1, function() {
                page.elColorToolbox.hide(1, function() {
                    page.sendMessage({
                        type: 'screenshot'
                    }, function() {});
                });
            });
        } else if (page.options.enableColorTooltip === true) {
            page.elColorTooltip.hide(1, function() {
                page.sendMessage({
                    type: 'screenshot'
                }, function() {});
            });
        } else if (page.options.enableColorToolbox === true) {
            page.elColorToolbox.hide(1, function() {
                page.sendMessage({
                    type: 'screenshot'
                }, function() {});
            });
        } else {
            page.sendMessage({
                type: 'screenshot'
            }, function() {});
        }

    },

    // capture actual Screenshot
    capture: function() {
        page.checkCanvas();
        ////console.log(page.rects);

        //    var image = new Image();
        var image = document.createElement('img');

        image.onload = function() {
            page.screenWidth = image.width;
            page.screenHeight = image.height;

            var rect = {
                x: page.XOffset,
                y: page.YOffset,
                width: image.width,
                height: image.height
            };
            var merged = false;

            // if there are already any rectangles
            if (page.rects.length > 0) {
                // try to merge shot with others
                for (index in page.rects) {
                    var t = page.rectMerge(rect, page.rects[index]);

                    if (t != false) {
                        console.log('dropper: merging');
                        merged = true;
                        page.rects[index] = t;
                    }
                }
            }

            // put rectangle in array
            if (merged == false)
                page.rects.push(rect);

            page.canvasContext.drawImage(image, page.XOffset, page.YOffset);
            page.canvasData = page.canvasContext.getImageData(0, 0, page.canvas.width, page.canvas.height).data;
            // TODO - je nutne refreshnout ctverecek a nastavit mu spravnou barvu

            page.screenshoting = false;
            $("#eye-dropper-overlay").css('cursor', page.options.cursor);

            // re-enable tooltip and toolbox
            if (page.options.enableColorTooltip === true) {
                page.elColorTooltip.show(1);
            }
            if (page.options.enableColorToolbox === true) {
                page.elColorToolbox.show(1);
            }

            if ( DEBUG ) {
                page.sendMessage({type: 'debug-tab', image: page.canvas.toDataURL()}, function() {});
                debugger
            }
        }

        if (page.imageData) {
            image.src = page.imageData;
        } else {
            console.error('ed: no imageData');
        }
    },

    init: function() {
        page.messageListener();

        if ( page.width > CANVAS_MAX_SIZE ) {
            page.width = CANVAS_MAX_SIZE
        }
        if ( page.height > CANVAS_MAX_SIZE ) {
            page.height = CANVAS_MAX_SIZE
        }

    }
}

page.init();

window.onresize = function() {
    page.onWindowResize();
}
