// Saves options to localStorage.
    function save_options() {
        if (!window.localStorage) {
            alert("Error local storage is unavailable.");
            window.close();
        }

        window.localStorage.autoClipboard =
            document.getElementById("autoClipboard").checked ? true : false;

        window.localStorage.autoClipboardNoGrid =
            document.getElementById("autoClipboardNoGrid").checked ? true : false;

        window.localStorage.disableColorpicker =
            document.getElementById("disableColorpicker").checked ? true : false;

        window.localStorage.enableColorToolbox =
            document.getElementById("enableColorToolbox").checked ? true : false;

        window.localStorage.enableColorTooltip =
            document.getElementById("enableColorTooltip").checked ? true : false;

        window.localStorage.enableRightClickDeactivate =
            document.getElementById("enableRightClickDeactivate").checked ? true : false;

        cursor = document.getElementById('dropperCursorcrosshair').checked ? 'crosshair' : 'default';
        window.localStorage.dropperCursor =  cursor;

        window.localStorage.keyActivate = $("#keyActivate").html();

        // Update status to let user know options were saved.
        var status = document.getElementById("status");
        status.innerHTML = "Options Saved.";
        setTimeout(function() {
            status.innerHTML = "";
        }, 750);
    }

// Restores select box state to saved value from localStorage.
function restore_options() {
    document.getElementById("autoClipboard").checked =
        (window.localStorage.autoClipboard === "true") ? true : false;
    document.getElementById("autoClipboardNoGrid").checked =
        (window.localStorage.autoClipboardNoGrid === "true") ? true : false;
    document.getElementById("disableColorpicker").checked =
        (window.localStorage.disableColorpicker === "true") ? true : false;
    document.getElementById("enableColorToolbox").checked =
        (window.localStorage.enableColorToolbox === "false") ? false : true;
    document.getElementById("enableColorTooltip").checked =
        (window.localStorage.enableColorTooltip === "false") ? false : true;
    document.getElementById("enableRightClickDeactivate").checked =
        (window.localStorage.enableRightClickDeactivate === "false") ? false : true;

    cursor = (window.localStorage.dropperCursor === 'crosshair') ? 'crosshair' : 'default';
    document.getElementById('dropperCursor'+cursor).checked = true;

    key = window.localStorage.keyActivate;
    if ( key == undefined || key == "" )
        key = "none";

    $("#keyActivate").html( key );
}

function keysStartListening() {
    console.log('starting listener');
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keypress", function(e) { e.preventDefault(); return false; }, false);
}

function keysStopListening() {
    console.log('stoping listener');
    document.removeEventListener("keydown", keyDown, false);
}

function keyDown(e) {
    console.log('key down');
    var k = KeyCode;

    $("#shortKeyActivate").html(k.hot_key(k.translate_event(e)));
    e.preventDefault();
}

function changeShortcut(shortcutName, key) {
    console.log('changing shortcut');
    chrome.windows.getAll({'populate':true}, function(windows){
        windows.forEach(function(win) {
            win.tabs.forEach(function(tab) {
                if ( tab != undefined && tab.url.indexOf('http') == 0 ) {
                    chrome.tabs.sendMessage(tab.id, {type: "helper-change-shortcut", shortcut: shortcutName, key: key});
                }
            });
        });
    });
}

// On document load
$(document).ready(function() {
    // show tabs
    $("#tabs").tabs();
    restore_options();

    $("#keycode-dialog").dialog({
        autoOpen: false,
        height: 220,
        width: 270,
        modal: true,
        title: "Set shortcut",
        buttons: {
            "Disable shortcut": function() {
                key = "none";
                $("#keyActivate").html(key);
                $(this).dialog("close");
            },
            "Save shortcut": function() {
                key = $("#shortKeyActivate").html();
                $("#keyActivate").html(key);
                window.localStorage.keyActivate = key;
                changeShortcut('activate', key);
                $(this).dialog("close");
            }
        },
        close: function() {
            keysStopListening();
        }
    });

    $("#addKeyActivate").click(function(){
        keysStartListening();
        $("#keycode-dialog").dialog('open');
    });

    $("#saveButton").click(function() { save_options() });

    FlattrLoader.setup();

});

