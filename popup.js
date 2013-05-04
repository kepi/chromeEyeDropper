var NEED_BG_VERSION=6;
var bg = null;
var pickupDisabled = false;

chrome.runtime.getBackgroundPage(function(backgroundPage) {
    bg = backgroundPage;

    // reload background if we need new version
    if ( bg.version == undefined || bg.version < NEED_BG_VERSION ) {
        chrome.runtime.sendMessage({reqtype: "reload-background"});
    }
});

// init tab
function init() {
    // find current tab
    chrome.tabs.getSelected(null, function(tab) {
        var message = '';
        // special chrome pages
        if (tab.url.indexOf('chrome') == 0) {
            message = "Sorry, but because of Google Chrome policy you can't pick color from special Chrome pages.";
            pickupDisabled = true;
        }
        // chrome gallery
        else if (tab.url.indexOf('https://chrome.google.com/webstore') == 0) {
            message = "Sorry, but because of Google Chrome policy you can't pick color from Google Chrome extension gallery.";
            pickupDisabled = true;
        }
        // local pages
        else if (tab.url.indexOf('file') == 0) {
            message = "Sorry, but because of Google Chrome policy you can't pick color from local pages.";
            pickupDisabled = true;
        }

        // disable or enable pickup button
        if ( pickupDisabled === true ) {
            $("#pickButton").attr("disabled","disabled");
            $("#pickupMessage").html(message).show();
        } else {
            bg.bg.useTab(tab);
            $("#pickButton").click(activatePick);
        }

    });
}

function activatePick() {
    if ( pickupDisabled === false ) {
        bg.bg.activate();
        window.close();
    }
}

function goto(url) {
    chrome.tabs.create({url: url});

    if ( typeof arguments[1] != "undefined" && arguments[1] === true )
        window.close();
}

$(document).ready(function() {
    // initialize script
    init();

    // show tabs
    $("#tabs").tabs().bind('tabsshow', function(event, ui) {
        if ( ui.panel.id == 'tab-pick' ) {
            $("#eyeDropperBody").css('height', '250px');
            $("html").css('height', '250px');
        }
    });


    $("a.ext").click(function() { goto(this.href); });

    // Color Picker
    disableColorpicker = window.localStorage.disableColorpicker;
    if ( disableColorpicker !== "true" ) {
        $("head").append('<link "text/css" rel="stylesheet" href="inc/jPicker/css/jPicker-1.1.6.min.css" />');
        $.getScript('inc/jPicker/jpicker-1.1.6.js', function() { setTimeout('showJPicker()', 250); });

    }

    // History
    if ( window.localStorage.history != undefined && window.localStorage.history.length > 3 ) {
        var history = JSON.parse(window.localStorage.history);
        output = ''
        for ( c in history ) {
            output += '<div class="historySquare" style="background: #' + history[c] + '" title="' + history[c] + '">&nbsp;</div>';
        }
        $("#history").html(output+'<br class="clear" /><div id="pickedColorDiv">Color: <span id="pickedColor">Move mouse over history squares to display hex</div><div id="clearHistory"><input type="button" onClick="clearHistory()" value="Clear colors history" />');

        $('.historySquare').hover(function() { $('#pickedColor').html('#'+this.title) });
        $('.historySquare').click(function() {
            var color = {
                r: parseInt(this.title.substring(0, 2), 16),
                g: parseInt(this.title.substring(2, 4), 16),
                b: parseInt(this.title.substring(4, 6), 16),
                alpha: 0
            };
            color.rgbhex = this.title;
            bg.bg.setColor({color: color, history: 'no'});
            setPickerColor(color);
        });

    } else {
        check_support('history');
        $("#history").html("No history yet. Try to pick some colors from web.");

    }
});

function setPickerColor(color)
{
    $.jPicker.List[0].color.active.val('rgb', {r: color.r, g: color.g, b: color.b});
}

function clearHistory()
{
    window.localStorage.history = '[]';
    window.location.reload();
}

function check_support(what)
{
    chrome.runtime.sendMessage({reqtype: "supports", what: what}, function(response) {
        if ( !response || response.state != 'ok' ) {
            ////console.log("Doesn't support " + what + ". Reloading background.");
            chrome.runtime.sendMessage({reqtype: "reload-background"});
        }
    });
}

// show jPicker tab and set color
function showJPicker()
{
    $("#li-colorpicker").show(); //css.display = 'block';
    $("#tab-colorpicker").show(); //css.display = 'block';

    var color = 'ffc000';
    if ( bg.bg.color != null )
        color = bg.bg.color;

    var active = new $.jPicker.Color({hex: color});
    $('#colorpicker').jPicker({window: {title: '&nbsp;'}, color: {active: active}, images: {clientPath: 'inc/jPicker/images/'}});
}

/*
(function() {
 var s = document.createElement('script'), t = document.getElementsByTagName('script')[0];
 s.type = 'text/javascript';
 s.async = true;
 s.src = 'http://api.flattr.com/js/0.6/load.js?mode=auto';
 t.parentNode.insertBefore(s, t);
})();

*/
