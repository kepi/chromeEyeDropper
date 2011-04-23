var ED_HELPER_VERSION=1;

var edHelper = {
  options: null,

  // ---------------------------------
  // MESSAGING 
  // ---------------------------------
  messageListener: function() {
    chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
      switch(req.type) {
        case 'ed-helper-loaded': sendResponse({version: ED_HELPER_VERSION}); break;
        case 'ed-helper-options':  
          edHelper.options = req.options; 
          edHelper.optionsSet(); 
          break;
      }
    });
  },

  hotKeyStart: function() {
    if ( edHelper.options.hotkeyActivate != null ) {
      shortcut.add(edHelper.options.hotkeyActivate, function() {
        edHelper.sendMessage({type: "activate2"}, function() {});
      });
    }
  },

  optionsSet: function() {
    edHelper.hotKeyStart();
  },
  
  sendMessage: function(message) {
    chrome.extension.connect().postMessage(message);
  },

  init: function() {
    edHelper.messageListener();
    // load options
    edHelper.sendMessage({type: "ed-helper-options"}, function() {});
  }
}

edHelper.init();

