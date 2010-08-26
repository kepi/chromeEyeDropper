// Listen for pickup activate
console.log('page activated');
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  console.log('listener activated');
    if(request.reqtype == "pickup-activate") {
        activateDropper();
    } else {
      sendResponse({});
    }
});

function activateDropper() { 
  console.log('activating page dropper');
  document.addEventListener("mousemove", mouseMove, false);
  document.addEventListener("click", mouseClick, false);
  console.log('activating page dropper done');
}

function mouseMove(e) {
  console.log('mooooving');
}

function mouseClick(e) {
  console.log('clicking');
}

