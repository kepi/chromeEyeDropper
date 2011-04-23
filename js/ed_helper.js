var ED_HELPER_VERSION=3;

var edHelper = {
  version: null,
  options: null,

  // listen for incoming messages
  messageListener: function() {
    chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
      switch(req.type) {
        // ed-helper-options require options in req
        case 'ed-helper-options':  
          edHelper.options = req.options; 
          edHelper.hotKeyStart();
          break;
      }
    });
  },

  hotKeyStart: function() {
    if ( edHelper.options.hotkeyActivate != null ) {
      // activate web page picker
      shortcut.add(edHelper.options.hotkeyActivate, function() {
        edHelper.sendMessage({type: "activate2"}, function() {});
      });
    }
  },

  // start helper
  init: function() {
    edHelper.version = ED_HELPER_VERSION;
    edHelper.messageListener();
    // load options
    edHelper.sendMessage({type: "ed-helper-options"}, function() {});
  },

  // helper for sending message to bg
  sendMessage: function(message) {
    message.version = edHelper.version;
    chrome.extension.connect().postMessage(message);
  }
}

edHelper.init();

