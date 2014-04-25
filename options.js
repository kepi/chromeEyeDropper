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

        window.localStorage.enableColorToolbox =
            document.getElementById("enableColorToolbox").checked ? true : false;

        window.localStorage.enableColorTooltip =
            document.getElementById("enableColorTooltip").checked ? true : false;

        window.localStorage.enableRightClickDeactivate =
            document.getElementById("enableRightClickDeactivate").checked ? true : false;

        cursor = document.getElementById('dropperCursorcrosshair').checked ? 'crosshair' : 'default';
        window.localStorage.dropperCursor =  cursor;

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
    document.getElementById("enableColorToolbox").checked =
        (window.localStorage.enableColorToolbox === "false") ? false : true;
    document.getElementById("enableColorTooltip").checked =
        (window.localStorage.enableColorTooltip === "false") ? false : true;
    document.getElementById("enableRightClickDeactivate").checked =
        (window.localStorage.enableRightClickDeactivate === "false") ? false : true;

    cursor = (window.localStorage.dropperCursor === 'crosshair') ? 'crosshair' : 'default';
    document.getElementById('dropperCursor'+cursor).checked = true;
}

// On document load
$(document).ready(function() {
    // show tabs
    restore_options();

    $("#saveButton").click(function() { save_options() });

    FlattrLoader.setup();
});
