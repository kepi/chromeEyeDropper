var BG_VERSION=10;
var NEED_DROPPER_VERSION=10;
var DEFAULT_COLOR="#b48484";

// jQuery like functions

// for get element by id
function $(id) {
    return document.getElementById(id);
}

// Returns -1 if value isn't in array.
// Return position starting from 0 if found
function inArray(value, array) {
  for(var i=0; i<array.length; i++) {
    if (array[i] == value) return i;
  }
  return -1;
}

// base bg object
var bg = {
  tab: 0,
  tabs: [],
  version: BG_VERSION,
  screenshotData: '',
  screenshotFormat: 'png',
  canvas: document.createElement("canvas"),
  canvasContext: null,
  debugImage: null,
  debugTab: 0,
  color: null,

  // use selected tab
  // need to null all tab-specific variables
  useTab: function(tab) {
    bg.tab = tab;
    bg.screenshotData = '';
    bg.canvas = document.createElement("canvas");
    bg.canvasContext = null;
  },

  checkDropperScripts: function() {
    console.log('bg: checking dropper version');
    bg.sendMessage({type: 'edropper-version'}, function(res) {
      console.log('bg: checking dropper version 2');
      if ( res ) {
        if ( res.version < NEED_DROPPER_VERSION ) {
          bg.refreshDropper();
        } else {
          bg.pickupActivate();
        }
      } else {
        bg.injectDropper();
      }
    });
  },

  // FIXME: try to handle this better, maybe some consolidation
  injectDropper: function() {
    console.log("bg: injecting dropper scripts");

    chrome.tabs.executeScript(bg.tab.id, {allFrames: false, file: "inc/jquery-2.1.0.min.js"}, function() {
      console.log('bg: jquery injected');
      chrome.tabs.executeScript(bg.tab.id, {allFrames: false, file: "inc/jquery.scrollstop.js"}, function() {
        console.log('bg: jquery.scrollstop injected');
        chrome.tabs.executeScript(bg.tab.id, {allFrames: false, file: "inc/shortcut.js"}, function() {
          console.log('bg: shortcuts injected');
          chrome.tabs.executeScript(bg.tab.id, {allFrames: false, file: "edropper2.js"}, function() {
            console.log('bg: edropper2 injected');
            bg.pickupActivate();
          });
        });
      });
    });
  },

  refreshDropper: function() {
    console.log("bg: refreshing dropper scripts");

    chrome.tabs.executeScript(bg.tab.id, {allFrames: true, file: "edropper2.js"}, function() {
      console.log('bg: edropper2 updated')
      bg.pickupActivate();
    });
  },

  sendMessage: function(message, callback) {
    chrome.tabs.sendMessage(bg.tab.id, message, callback);
  },

  shortcutListener: function() {
    chrome.commands.onCommand.addListener(function(command) {
      console.log('bg: command: ', command);
      switch(command) {
        case 'activate':
          bg.activate2();
          break;
      }
    });
  },

  messageListener: function() {
    // simple messages
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
      switch(req.type) {
        case 'activate-from-hotkey':
          bg.activate2();
          sendResponse({});
          break;

        // Define what background script supports
        case 'supports': bg.supports(req.what, sendResponse); break;

        // Reload background script
        case 'reload-background': window.location.reload(); break;

        // Clear colors history
        case 'clear-history': bg.clearHistory(sendResponse); break;
      }
    });

    // longer connections
    chrome.extension.onConnect.addListener(function(port) {
      port.onMessage.addListener(function(req) {
        switch(req.type) {
          // Taking screenshot for content script
          case 'screenshot': 
            ////console.log('received screenshot request');
            bg.capture(); break;
          
          // Creating debug tab
          case 'debug-tab':
            ////console.log('received debug tab');
            bg.debugImage = req.image;
            bg.createDebugTab();
            break;

          // Set color given in req
          case 'set-color': bg.setColor(req); break;

        }
      });
    });
  },

  // function for injecting new content
  inject: function(file, tab) {
    if ( tab == undefined )
      tab = bg.tab.id;

    ////console.log("Injecting " + file + " into tab " + tab);
    chrome.tabs.executeScript(tab, {allFrames: false, file: file}, function() {});
  },

  supports: function(what, sendResponse) {
    var state = 'no';
    if ( what == 'dummy' || what == 'history' )
      state = 'ok';

    sendResponse({state: state});
  },

  // method for setting color. It set bg color, update badge and save to history if possible
  setColor: function(req) {
    if ( ! req.color ) {
      console.log('bg: error receiving collor from dropper.');
      return;
    }
    // we are storing color with first # character
    if ( ! req.color.rgbhex.match(/^#/) )
        req.color.rgbhex = '#' + req.color.rgbhex;

    bg.color = req.color.rgbhex;
    chrome.browserAction.setBadgeText({text: ' '});
    chrome.browserAction.setBadgeBackgroundColor({color: [req.color.r, req.color.g, req.color.b, 255]});

    // local storage only if available
    if ( window.localStorage != null ) {
      // save to clipboard through small hack
      if ( window.localStorage['autoClipboard'] === "true" ) {
        var edCb = $('edClipboard');
        edCb.value = window.localStorage['autoClipboardNoGrid'] === "true" ? bg.color.substring(1) : bg.color;
        edCb.select();
        document.execCommand("copy", false, null);
      }

      // history can be disabled i.e when setting color from
      // history itself
      if ( req.history == undefined || req.history != 'no' ) {
        var history = JSON.parse(window.localStorage.history);
        // first check if there isn't same color in history
        if ( inArray(bg.color, history) < 0 ) {
          history.push(bg.color);
          window.localStorage.history = JSON.stringify(history);
        }
      }
    }
  },

  // activate from content script
  activate2: function() {
    chrome.tabs.getSelected(null, function(tab) {
      bg.useTab(tab);
      bg.activate();
    });
  },

  // activate Pick
  activate: function() {
    console.log('bg: received pickup activate');
    // check scripts and activate pickup
    bg.checkDropperScripts();
  },

  pickupActivate: function() {
    // load options
    cursor = (window.localStorage.dropperCursor === 'crosshair') ? 'crosshair' : 'default';
    enableColorToolbox = (window.localStorage.enableColorToolbox === "false") ? false : true;
    enableColorTooltip = (window.localStorage.enableColorTooltip === "false") ? false : true;
    enableRightClickDeactivate = (window.localStorage.enableRightClickDeactivate === "false") ? false : true;

    // activate picker
    bg.sendMessage({type: 'pickup-activate', options: { cursor: cursor, enableColorToolbox: enableColorToolbox, enableColorTooltip: enableColorTooltip, enableRightClickDeactivate: enableRightClickDeactivate}}, function() {});

    console.log('bg: activating pickup');
  },

  // capture actual Screenshot
  capture: function() {
    ////console.log('capturing');
    try {
      chrome.tabs.captureVisibleTab(null, {format: 'png'}, bg.doCapture);
    // fallback for chrome before 5.0.372.0
    } catch(e) {
      chrome.tabs.captureVisibleTab(null, bg.doCapture);
    }
  },

  getColor: function() {
      return bg.color;
  },

  doCapture: function(data) {
      if ( data ) {
        console.log('bg: sending updated image');
        bg.sendMessage({type: 'update-image', data: data}, function() {});
      } else {
        console.error('bg: did not receive data from captureVisibleTab');
      }
  },

  createDebugTab: function() {
    // DEBUG
    if ( bg.debugTab != 0 ) {
      chrome.tabs.sendMessage(bg.debugTab, {type: 'update'});
    } else
      chrome.tabs.create({url: 'debugimage.html', selected: false}, function(tab) { bg.debugTab = tab.id });
  },

  isThisPlatform: function(operationSystem) {
    return navigator.userAgent.toLowerCase().indexOf(operationSystem) > -1;
  },

  tabOnChangeListener: function() {
    // deactivate dropper if tab changed
    chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
      if ( bg.tab.id == tabId )
        bg.sendMessage({type: 'pickup-deactivate'}, function() {});
    });

  },

  clearHistory: function(sendResponse) {
      ////console.log('clearing history');
      window.localStorage.history = "[]";
      bg.color = DEFAULT_COLOR;

      if ( sendResponse != undefined ) {
          sendResponse({state: 'OK'});
      }
  },
  
  init: function() {
    // only if we have support for localStorage
    if ( window.localStorage != null ) {

      // show installed or updated page
      if ( window.localStorage.seenInstalledPage == undefined || window.localStorage.seenInstalledPage === "false" ) {
        window.localStorage.seenInstalledPage = true;
        chrome.tabs.create({url: 'pages/installed.html', selected: true});
      }
    }

    // settings from local storage
    if ( window.localStorage.history == undefined ) {
        bg.clearHistory();
    } else if ( window.localStorage.history.length > 3 ) {
      var history = JSON.parse(window.localStorage.history);
      history = bg.addHashesToColorsInHistory(history);
      bg.color = history[history.length-1];
    } else {
      bg.color = DEFAULT_COLOR;
    }

    // we have to listen for messages
    bg.messageListener();
    
    // act when tab is changed
    // TODO: call only when needed? this is now used also if picker isn't active
    bg.tabOnChangeListener();

    // listen for shortcut commands
    bg.shortcutListener();
  },

  // in versions before 0.3.0 colors were stored without # hash in front
  // this fixes it
  addHashesToColorsInHistory: function(history) {
      if ( history[0][0] != '#' ) {
          for ( key in history ) {
              history[key] = '#' + history[key];
          }
      }
      window.localStorage.history = JSON.stringify(history);
      return history;
  }
};

document.addEventListener('DOMContentLoaded', function () {
    bg.init()
});

