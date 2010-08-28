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

  // create canvas
  var canvasBorders = 20;

  canvasWidth = $(document).width() + canvasBorders;
  canvasHeight = $(document).height() + canvasBorders;

  canvasElement = document.createElement('canvas');
  canvasElement.width = canvasWidth; 
  canvasElement.height = canvasHeight;

  canvasContext = canvasElement.getContext('2d');

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
