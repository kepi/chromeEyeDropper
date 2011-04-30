var ED_HELPER_VERSION=4;

var edHelper = {
  version: ED_HELPER_VERSION,
  options: null,

  // listen for incoming messages
  messageListener: function(req, sender, sendResponse) {
      switch(req.type) {
        case 'helper-version':
          console.log('helper version ' + edHelper.version);
          sendResponse({version: edHelper.version, tabid: req.tabid});
          break;
      }
  },

  // handle hotkeys
  hotKeyStart: function() {
    if ( edHelper.options.hotkeyActivate != null ) {
      // activate web page picker
      shortcut.add(edHelper.options.hotkeyActivate, function() {
        chrome.extension.sendRequest({type: "activate-from-hotkey"});
      });
    }
  },

  // start helper
  init: function() {
    console.log('init helper version ' + edHelper.version);
    // load options
    chrome.extension.sendRequest({type: "ed-helper-options"}, function(response) {
      edHelper.options = response.options;
      edHelper.hotKeyStart();
    });
  }
}

// init
edHelper.init();

// add listener if missing
if ( !chrome.extension.onRequest.hasListeners() )
  chrome.extension.onRequest.addListener(function(req, sender, sendResponse) { edHelper.messageListener(req, sender, sendResponse); });
