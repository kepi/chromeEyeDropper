
var page = {
  width: $(document).width(),
  height: $(document).height(),
  imageData: null,
  canvas: document.createElement("canvas"),
  canvasBorders: 20,
  canvasData: null,
  dropperActivated: false,
  screenshoting: false,
  scrolling: false,

  // ---------------------------------
  // MESSAGING 
  // ---------------------------------
  messageListener: function() {
    // Listen for pickup activate
    console.log('page activated');
    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        if(request.reqtype == "pickup-activate") {
            page.dropperActivate();
        } else if (request.reqtype == 'update-image' ) {
          console.log('setting image data');
          page.imageData = request.data;
          page.updateCanvas();
        } else if (request.reqtype == 'tooltip' ) {
          page.tooltip(request.color, request.x, request.y);
        } else {
          sendResponse({});
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

    page.dropperActivated = true;
    page.screenChanged();
    console.log('activating page dropper');
    $(document).bind('scrollstart', page.onScrollStart);
    $(document).bind('scrollstop', page.onScrollStop);
    document.addEventListener("mousemove", page.onMouseMove, false);
    document.addEventListener("click", page.onMouseClick, false);
    document.addEventListener("keydown", page.onKeyDown, false);
    console.log('activating page dropper done');

    $("body").append('<div id="color-tooltip" style="z-index: 1000; width:10px; height: 10px; border: 1px solid #000; display:none; font-size: 15px;"> </div>');
    $("head").append('<style type="text/css" id="edropper-css">* { cursor: default !important}</style>');
  },

  dropperDeactivate: function() {
    if (!page.dropperActivated)
      return;

    page.dropperActivated = false;
    console.log('deactivating page dropper');
    document.removeEventListener("mousemove", page.onMouseMove, false);
    document.removeEventListener("click", page.onMouseClick, false);
    document.removeEventListener("keydown", page.onKeyDown, false);
    $(document).unbind('scrollstop', page.onScrollStop);
    $(document).unbind('scrollstop', page.onScrollStart);

    $('#color-tooltip').remove();
    $("#edropper-css").remove();
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

    console.log("Deactivating dropper");
    // TODO
    //chrome.extension.sendRequest({reqtype: "set-color", color: color}, function response(response) {
    page.dropperDeactivate();
  },
  
  onScrollStop: function() {
    if (!page.dropperActivated)
     return;
    
    page.scrolling = false;

    console.log("Scroll stop");
    page.screenChanged();
  },

  onScrollStart: function() {
    if (!page.dropperActivated)
     return;

    page.scrolling = true;
    console.log("Scroll start");

    $('#color-tooltip').hide();
    $("#edropper-css").html('* { cursor: wait !important}');
  },

  onKeyDown: function(e) {
    if (!page.dropperActivated)
      return;

    switch (e.keyCode) {
      case 85: // u - Update
        console.error('update canvas not implemented');
        page.screenChanged();
        break;
      case 80: // p - pickUp color  
        // FIXME: do mouseClick je potreba predat spravne pozici, ne takto
        mouseClick(e); break;
      case 27: // Esc - stop picking
        deactivateDropper(); break;
    }
  },

  onWindowResize: function(e) {
    if (!page.dropperActivated)
      return;

    console.log('window resized');
  },

  // ---------------------------------
  // MISC
  // ---------------------------------

  tooltip: function(e) {
    if (!page.dropperActivated || page.screenshoting || page.scrolling)
      return;

    var color = page.pickColor(e);
    var fromTop = -15;
    var fromLeft = 10;

    /*
    if ( (e.pageX-pageXOffset) > imgWidth/2 )
      fromLeft = -20;
    if ( (e.pageY-pageYOffset) < imgHeight/2 )
      fromTop = 15;
      */

    $('#color-tooltip').css({ 
        'background-color': '#'+color.rgbhex,
        'color': 'black',
        'position': 'absolute',
        'top': e.pageY+fromTop, 
        'left': e.pageX+fromLeft,
        'border-color': '#'+color.opposite
        }).show();
  },

  // ---------------------------------
  // COLORS
  // ---------------------------------
  
  pickColor: function(e) {
    if ( page.canvasData === null )
      return;

    var canvasIndex = (e.pageX + e.pageY * page.canvas.width) * 4;

    var color = {
      r: page.canvasData[canvasIndex],
      g: page.canvasData[canvasIndex+1],
      b: page.canvasData[canvasIndex+2],
      alpha: page.canvasData[canvasIndex+3]
    };

    color.rgbhex = page.rgbToHex(color.r,color.g,color.b);
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

  screenChanged: function() {
    if (!page.dropperActivated)
      return;

    page.screenshoting = true;

    page.sendMessage({reqtype: 'screenshot', 
      pageWidth: page.width, 
      pageHeight: page.height, 
      canvasBorders: page.canvasBorders,
      pageYOffset: $(document).scrollTop(),
      pageXOffset: $(document).scrollLeft()
    });
  },
  
  updateCanvas: function() {
    var image = new Image();
    image.onload = function() {
      console.log('updating canvas');
      page.canvas.width = image.width;
      page.canvas.height = image.height;

      var context = page.canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      page.canvasData = context.getImageData(0, 0, image.width, image.height).data;

      page.screenshoting = false;
      $("#edropper-css").html('* { cursor: default !important}');
      $('#color-tooltip').show();
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
