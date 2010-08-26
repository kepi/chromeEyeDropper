// Used variables
var version = 2;
var debug = true;
var dropper_activated = false;
var screenshotTaken = false;
var screenshoting = false;
var screenshotingScroll = false;

var imgWidth = 0;
var imgHeight = 0;
var canvasWidth = 0;
var canvasHeight = 0;
var pageXOffset = 0;
var pageYOffset = 0;
var imageData = null;
var canvasElement = null;
var canvasContext = null;

var Rects = [];

var debugTab = null;

// Listen for pickup activate
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.reqtype == "pickup-activate") {
      if ( request.version == version )
        activateDropper();

      sendResponse({version: version});

    } else {
      sendResponse({});
    }
});

// Turn Dropper On
function activateDropper() { 
  if(dropper_activated == true)
    return;

  if (debug)
    console.log("activating dropper");

  dropper_activated = true;

  // Status rectangle with actual color under cursor
  $("body").append('<div id="color-tooltip" style="z-index: 1000; width:10px; height: 10px; border: 1px solid #000; display:none; font-size: 15px;"> </div>');

  // set some events
  document.addEventListener("mousemove", mouseMove, false);
  document.addEventListener("click", mouseClick, false);
  document.addEventListener("keydown", keyDown, false);
  $(document).bind('scrollstop', scrollStop);

  // create canvas
  var canvasBorders = 20;

  canvasWidth = $(document).width() + canvasBorders;
  canvasHeight = $(document).height() + canvasBorders;

  canvasElement = document.createElement('canvas');
  canvasElement.width = canvasWidth; 
  canvasElement.height = canvasHeight;

  canvasContext = canvasElement.getContext('2d');
}

// update screenshot on scroll stop event
function scrollStop() {
  if(dropper_activated == false)
    return;

  if (debug)
    console.log("Scroll stop");

  updateCanvas();
}

// update screnshot on mouse move
function mouseMove(e) {
  if(dropper_activated == false)
    return;

  // FIXME: while scrolling through the page, only first update is done so
  // canvas is old :/ try update faster?
  // hmm tak mozna to bude necim jinym, tak zitra
  if(screenshotTaken == false) {
    if(screenshoting == false) {
      screenshoting = true;
      updateCanvas();
    }
    return;
  }

  tooltip(e);
}

// get color from mouse position
function pickColor(e) {
  var canvasIndex = canvasIndexFromEvent(e, canvasWidth);
  return colorFromData(canvasIndex, imageData.data);
}

// show tooltip
function tooltip(e) {
  var color = pickColor(e);
  var fromTop = -15;
  var fromLeft = 10;

  if ( (e.pageX-pageXOffset) > imgWidth/2 )
    fromLeft = -20;
  if ( (e.pageY-pageYOffset) < imgHeight/2 )
    fromTop = 15;

  $('#color-tooltip').css({ 
      'background-color': '#'+color.rgbhex,
      'color': 'black',
      'position': 'absolute',
      'top': e.pageY+fromTop, 
      'left': e.pageX+fromLeft,
      'border-color': '#'+color.opposite
      }).show();
}

// turn dropper off
function deactivateDropper() { 
  if(!dropper_activated)
    return;

  dropper_activated = false;
  screenshotTaken = false;
  screenshoting = false;

  document.removeEventListener("mousemove", mouseMove, false);
  document.removeEventListener("click", mouseClick, false);
  document.removeEventListener("keydown", keyDown, false);

  $('#color-tooltip').remove();
}

// turn dropper on mouse click and send color to background
// so badge can be changed
function mouseClick(e) {
  if(!dropper_activated)
    return;

  if (debug)
    console.log("Event: mouse click");

  deactivateDropper();      // turn dropper off
  e.preventDefault();       // disable follow link
  var color = pickColor(e); // get color

  // save picked color
  chrome.extension.sendRequest({reqtype: "set-color", color: color}, function response(response) {
    if (debug)
      console.log("Picked: "+response.text);  
  });
}

// respond to some keys when dropper activated
function keyDown(e) {
  if(!dropper_activated)
    return;

  if ( e.keyCode == 85 ) // u - Update
    updateCanvas(true);
  // FIXME: do mouseClick je potreba predat spravne pozici, ne takto
  else if ( e.keyCode == 80 ) // p - Pick Up Color
    mouseClick(e);
  else if ( e.keyCode == 27 ) // Esc - stop picking
    deactivateDropper();
}

// e: click event object
// w: width of canvas element
// returns canvas index
var canvasIndexFromEvent = function(e,w) {
  var x = e.pageX; // - pageXOffset;
  var y = e.pageY; // - pageYOffset;
  return (x + y * w) * 4; 
}; 

// colorData: array containing canvas-style data for a pixel in order: r, g, b, alpha transparency
// return color object
var colorFromData = function(canvasIndex,data) {
  var color = {
    r: data[canvasIndex],
    g: data[canvasIndex+1],
    b: data[canvasIndex+2],
    alpha: data[canvasIndex+3]
  };

  color.rgbhex = rgbToHex(color.r,color.g,color.b);
  color.opposite = rgbToHex(255-color.r,255-color.g,255-color.b);
  return color;
};

// i: color channel value, integer 0-255
// returns two character string hex representation of a color channel (00-FF)
var toHex = function(i) {
  if(i === undefined) return 'FF'; // TODO this shouldn't happen; looks like offset/x/y might be off by one
  var str = i.toString(16);
  while(str.length < 2) { str = '0' + str; }
  return str;
};

// r,g,b: color channel value, integer 0-255
// returns six character string hex representation of a color
var rgbToHex = function(r,g,b) {
  return toHex(r)+toHex(g)+toHex(b);
};

// return true if rectangle A is whole in rectangle B
function rectInRect(A, B) {
  if ( A.x >= B.x && A.y >= B.y && (A.x+A.width) <= (B.x+B.width) && (A.y+A.height) <= (B.y+B.height) )
    return true;
  else
    return false;
}

// merge same x or y positioned rectangles if overlaps
// width (or height)  of B has to be bigger or equal to A
function rectMerge(A, B) {
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
}

// Update Canvas with screenshots
function updateCanvas() {
  var forced = false;

  if ( typeof arguments[0] != "undefined" )
    forced = arguments[0];

  if(dropper_activated == false)
    return;

  // ask background script to take screenshot and put it to canvas
  chrome.extension.sendRequest({reqtype: "get-shot"}, function(response) {
      var dataURL = response.dataURL;

      // screenshot
      var imgElement = document.createElement('img');
      imgElement.src = dataURL;

      imgElement.onload = function() {

        // set some needed vars
        imgWidth = imgElement.width;
        imgHeight = imgElement.height;

        pageYOffset = $(document).scrollTop();
        pageXOffset = $(document).scrollLeft();

        var rect = {x: pageXOffset, y: pageYOffset, width: imgWidth, height: imgHeight};
        var merged = false;

        // if there are already any rectangles
        if ( Rects.length > 0 ) {
          // if we already have this shot, return
          if ( forced == false ) {
            for ( index in Rects ) {
              if ( rectInRect(rect, Rects[index]) )
              {
                screenshotTaken = true;
                return;
              }
            }
          }

          // try to merge shot with others
          for ( index in Rects ) {
            var t = rectMerge(rect, Rects[index]);

            if ( t != false ) {
              if (debug)
                console.log('merging');
              merged = true;
              Rects[index] = t;
            }
          }
        }

        // put rectangle in array
        if (merged == false)
          Rects.push(rect);

        // draw image to canvas
        canvasContext.drawImage(imgElement,pageXOffset,pageYOffset);
        imageData=canvasContext.getImageData(0, 0, canvasWidth, canvasHeight);
        screenshotTaken = true;

        if ( debug ) {
          console.log("taking screenshot "+imgWidth+'x'+imgHeight+' posun: '+pageXOffset+'x'+pageYOffset+' # '+canvasWidth+'x'+canvasHeight+' # '+window.innerWidth+'x'+window.innerHeight);

          chrome.extension.sendRequest({reqtype: "debug-image", data: imageData});
        }
      }
  });
}
