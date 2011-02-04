var EDROPPER_VERSION=4;

var page = {
  width: $(document).width(),
  height: $(document).height(),
  imageData: null,
  canvasBorders: 20,
  canvasData: null,
  dropperActivated: false,
  screenWidth: 0,
  screenHeight: 0,
  options: {cursor: 'default', enableColorToolbox: true, enableColorTooltip: true, enableRightClickDeactivate: true},

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
    ////console.log('page activated');
    chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
      switch(req.type) {
        case 'edropper-loaded': sendResponse({version: EDROPPER_VERSION}); break;
        case 'pickup-activate': page.options = req.options; page.dropperActivate(); break;
        case 'pickup-deactivate': page.dropperDeactivate(); break;
        case 'update-image':
          ////console.log('background send me updated screenshot');
          page.imageData = req.data;
          page.capture();
          break;
        default: sendResponse({}); break;
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
    $("head").append('<link id="eye-dropper-css-cursor" rel="stylesheet" type="text/css" href="'+chrome.extension.getURL('inject/anchor-cursor-'+page.options.cursor+'.css?0.2.3')+'" />');
    $("head").append('<link id="eye-dropper-css" rel="stylesheet" type="text/css" href="'+chrome.extension.getURL('inject/edropper2.css?0.2.3')+'" />');

    // insert tooltip and toolbox
    var inserted = ''
    if ( page.options.enableColorTooltip === true ) {
      inserted += '<div id="color-tooltip"> </div>';
    }
    if ( page.options.enableColorToolbox === true ) {
      inserted += '<div id="color-toolbox"><div id="color-toolbox-color" style="background-color: #ffbbca">&nbsp;</div><div id="color-toolbox-text">&nbsp;</div></div>';
    }
    $("body").append(inserted);

    if ( page.options.enableColorTooltip === true ) {
      page.elColorTooltip = $('#color-tooltip');
    }
    if ( page.options.enableColorToolbox === true ) {
      page.elColorToolbox = $('#color-toolbox');
      page.elColorToolboxColor = $('#color-toolbox-color');
      page.elColorToolboxText = $('#color-toolbox-text');
    }

    ////console.log('activating page dropper');
    page.defaults();

    page.dropperActivated = true;
    page.screenChanged();

    // set listeners
    $(document).bind('scrollstop', page.onScrollStop);
    document.addEventListener("mousemove", page.onMouseMove, false);
    document.addEventListener("click", page.onMouseClick, false);
    document.addEventListener("keydown", page.onKeyDown, false);
    if ( page.options.enableRightClickDeactivate === true ) {
      document.addEventListener("contextmenu", page.onContextMenu, false);
    }
  },

  dropperDeactivate: function() {
    if (!page.dropperActivated)
      return;

    // reset cursor changes
    document.body.style.cursor = 'default';
    $("#eye-dropper-css").remove();
    $("#eye-dropper-css-cursor").remove();

    page.dropperActivated = false;

    ////console.log('deactivating page dropper');
    document.removeEventListener("mousemove", page.onMouseMove, false);
    document.removeEventListener("click", page.onMouseClick, false);
    document.removeEventListener("keydown", page.onKeyDown, false);
    if ( page.options.enableRightClickDeactivate === true ) {
      document.removeEventListener("contextmenu", page.onContextMenu, false);
    }
    $(document).unbind('scrollstop', page.onScrollStop);

    if ( page.options.enableColorTooltip === true ) {
      page.elColorTooltip.remove();
    }
    if ( page.options.enableColorToolbox === true ) {
      page.elColorToolbox.remove();
    }
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
    page.sendMessage({type: "set-color", color: page.pickColor(e)});
  },
  
  onScrollStop: function() {
    if (!page.dropperActivated)
     return;
    
    ////console.log("Scroll stop");
    page.screenChanged();
  },

  onScrollStart: function() {
    if (!page.dropperActivated)
     return;

  },

  onKeyDown: function(e) {
    if (!page.dropperActivated)
      return;

    switch (e.keyCode) {
      // u - Update
      case 85: page.screenChanged(true); break;
      // p - pickUp color
      case 80:   
        // FIXME: do mouseClick je potreba predat spravne pozici, ne takto
        mouseClick(e); break;
      // Esc - stop picking
      case 27: page.dropperDeactivate(); break;
    }
  },

  // right click
  onContextMenu: function(e) {
    if (!page.dropperActivated)
      return;

    e.preventDefault();

    page.dropperDeactivate();
  },

  onWindowResize: function(e) {
    if (!page.dropperActivated)
      return;

    ////console.log('window resized');
    page.defaults();
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

    if ( (e.pageX-page.XOffset) > page.screenWidth/2 )
      fromLeft = -20;
    if ( (e.pageY-page.YOffset) < page.screenHeight/2 )
      fromTop = 15;

    // set tooltip
    if ( page.options.enableColorTooltip === true ) {
      page.elColorTooltip.css({ 
        'background-color': '#'+color.rgbhex,
        'top': e.pageY+fromTop, 
        'left': e.pageX+fromLeft,
        'border-color': '#'+color.opposite
      }).show();
    }
    
    // set toolbox
    if ( page.options.enableColorToolbox === true ) {
      page.elColorToolboxColor.css({'background-color': '#'+color.rgbhex});
      page.elColorToolboxText.html('#'+color.rgbhex+'<br />rgb('+color.r+','+color.g+','+color.b+')');
      page.elColorToolbox.show();
    }
  },

  // return true if rectangle A is whole in rectangle B
  rectInRect: function(A, B) {
    if ( A.x >= B.x && A.y >= B.y && (A.x+A.width) <= (B.x+B.width) && (A.y+A.height) <= (B.y+B.height) )
      return true;
    else
      return false;
  },

  // merge same x or y positioned rectangles if overlaps
  // width (or height)  of B has to be bigger or equal to A
  rectMerge: function(A, B) {
    if ( A.x == B.x && A.width <= B.width ) {
      if ( A.y < B.y ) {
        B.y = A.y;
        B.height = B.height + B.y - A.y;
      } else {
        B.height = B.height + A.y - B.y;
      }
      return B;

    } else if ( A.y == B.y && A.height <= B.height ) {
      if ( A.x < B.x ) {
        B.x = A.x;
        B.width = B.width + B.x - A.x;
      } else {
        B.width = B.width + A.x - B.x;
      }

      return B;
    }

    return false;
  },

  // ---------------------------------
  // COLORS
  // ---------------------------------
  
  pickColor: function(e) {
    if ( page.canvasData === null )
      return;

    var canvasIndex = (e.pageX + e.pageY * page.canvas.width) * 4;
    ////console.log(e.pageX + ' ' + e.pageY + ' ' + page.canvas.width);

    var color = {
      r: page.canvasData[canvasIndex],
      g: page.canvasData[canvasIndex+1],
      b: page.canvasData[canvasIndex+2],
      alpha: page.canvasData[canvasIndex+3]
    };

    color.rgbhex = page.rgbToHex(color.r,color.g,color.b);
    ////console.log(color.rgbhex);
    color.opposite = page.rgbToHex(255-color.r,255-color.g,255-color.b);
    return color;
  },

  // i: color channel value, integer 0-255
  // returns two character string hex representation of a color channel (00-FF)
  toHex: function(i) {
    if(i === undefined) return 'FF'; // TODO this shouldn't happen; looks like offset/x/y might be off by one
    var str = i.toString(16);
    while(str.length < 2) { str = '0' + str; }
    return str;
  },

  // r,g,b: color channel value, integer 0-255
  // returns six character string hex representation of a color
  rgbToHex: function(r,g,b) {
    return page.toHex(r)+page.toHex(g)+page.toHex(b);
  },

  // ---------------------------------
  // UPDATING SCREEN 
  // ---------------------------------

  checkCanvas: function() {
    // we have to create new canvas element 
    if ( page.canvas.width != (page.width+page.canvasBorders) || page.canvas.height != (page.height+page.canvasBorders) ) {
      ////console.log('creating new canvas');
      page.canvas = document.createElement('canvas');
      page.canvas.width = page.width + page.canvasBorders;
      page.canvas.height = page.height + page.canvasBorders;
      page.canvasContext = page.canvas.getContext('2d');
      page.rects = [];
    }
  },

  screenChanged: function(force) {
    if (!page.dropperActivated)
      return;

    page.YOffset = $(document).scrollTop(),
    page.XOffset = $(document).scrollLeft()

    var rect = {x: page.XOffset, y: page.YOffset, width: page.screenWidth, height: page.screenHeight};

    // don't screenshot if we already have this one
    if ( !force && page.rects.length > 0 ) {
      for ( index in page.rects ) {
        if ( page.rectInRect(rect, page.rects[index]) ) {
          ////console.log('uz mame, nefotim');
          return;
        }
      }
    }

    page.screenshoting = true;

    document.body.style.cursor = 'progress';

    ////console.log('I want new screenshot');
    // TODO: this is terrible. It have to be done better way
    if ( page.options.enableColorTooltip === true && page.options.enableColorToolbox === true) {
      page.elColorTooltip.hide(1, function() {
        page.elColorToolbox.hide(1, function() {
          page.sendMessage({type: 'screenshot'}, function() {});
        });
      });
    }
    else if ( page.options.enableColorTooltip === true ) {
      page.elColorTooltip.hide(1, function() {
        page.sendMessage({type: 'screenshot'}, function() {});
      });
    }
    else if ( page.options.enableColorToolbox === true ) {
      page.elColorToolbox.hide(1, function() {
        page.sendMessage({type: 'screenshot'}, function() {});
      });
    }
    else {
      page.sendMessage({type: 'screenshot'}, function() {});
    }

  },
  
  // capture actual Screenshot
  capture: function() {
    page.checkCanvas();
    ////console.log(page.rects);

    var image = new Image();

    image.onload = function() {
      page.screenWidth = image.width;
      page.screenHeight = image.height;

      var rect = {x: page.XOffset, y: page.YOffset, width: image.width, height: image.height};
      var merged = false;

      // if there are already any rectangles
      if ( page.rects.length > 0 ) {
        // try to merge shot with others
        for ( index in page.rects ) {
          var t = page.rectMerge(rect, page.rects[index]);

          if ( t != false ) {
            ////console.log('merging');
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
      document.body.style.cursor = page.options.cursor;

      // re-enable tooltip and toolbox
      if ( page.options.enableColorTooltip === true ) {
        page.elColorTooltip.show(1);
      }
      if ( page.options.enableColorToolbox === true ) {
        page.elColorToolbox.show(1);
      }

      //page.sendMessage({type: 'debug-tab', image: page.canvas.toDataURL()}, function() {});
    }
    image.src = page.imageData;
  },

  init: function() {
    page.messageListener();
  }
}

page.init();

window.onresize = function() {
  page.onWindowResize();
}
