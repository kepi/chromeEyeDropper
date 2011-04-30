var ED_HELPER_VERSION=5;

var edHelper = {
  version: ED_HELPER_VERSION,
  options: null,
  shortcuts: [],

  // listen for incoming messages
  messageListener: function(req, sender, sendResponse) {
      switch(req.type) {
        case 'helper-version':
          ////console.log('helper version ' + edHelper.version + ' in tabid ' + req.tabid);
          sendResponse({version: edHelper.version, tabid: req.tabid});
          break;
        case 'helper-change-shortcut':
          edHelper.changeShortcut(req.shortcut, req.key);
          break;
      }
  },

  // helper for adding shortcut
  addShortcut: function(shortcutName, key) {
    if ( key == null )
      return;

    // store used key so we can remove it later
    edHelper.shortcuts[shortcutName] = key;

    // add hotkey function
    shortcut.add(key, function() { edHelper.handleShortcut(shortcutName); });
  },

  // unset previous hotkey
  removeShortcut: function(shortcutName) {
    if ( edHelper.shortcuts[shortcutName] != undefined )
      shortcut.remove(edHelper.shortcuts[shortcutName]);
  },

  changeShortcut: function(shortcutName, key) {
    ////console.log("changing shortcut " + shortcutName + " to key " + key);
    edHelper.removeShortcut(shortcutName);
    edHelper.addShortcut(shortcutName, key);
  },

  handleShortcut: function(shortcutName) {
    switch(shortcutName) {
      case 'activate':
        chrome.extension.sendRequest({type: "activate-from-hotkey"});
        break;
    }
  },

  // handle hotkeys
  hotKeyStart: function() {
    // activate picker
    edHelper.addShortcut('activate', edHelper.options.hotkeyActivate);
  },

  // start helper
  init: function() {
    ////console.log('init helper version ' + edHelper.version);
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
