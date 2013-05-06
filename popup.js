var NEED_BG_VERSION=6;
var bg = null;
var pickupDisabled = false;
var disableColorpicker = window.localStorage.disableColorpicker;

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
    chrome.tabs.getSelected(null, function (tab) {
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
        if (pickupDisabled === true) {
            $("#pickupButton").addClass("disabled");
            $("#pickupMessage").html(message).show();
        } else {
            bg.bg.useTab(tab);
            $("#pickupButton").click(activatePick);
        }

        if (disableColorpicker !== "true") { showColorPicker() }

        if ( bg.bg.color !== null ) {
            console.log(bg.bg.color);
            setColor('cur', bg.bg.color, true);
            setColor('new', bg.bg.color);
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

function drawHistory() {
    // History
    if ( window.localStorage.history != undefined && window.localStorage.history.length > 3 ) {
        var history = JSON.parse(window.localStorage.history);
        output = ''
        for ( c in history ) {
            output += '<div class="historySquare" style="background: ' + history[c] + '" title="' + history[c] + '">&nbsp;</div>';
        }
        $("#historyColors").html(output+'<br class="clearfix" /><div id="pickedColorDiv">Color: <span id="pickedColor">Move mouse over history squares to display hex</div><div id="clearHistory"><input type="button" id="clearHistoryButton" value="Clear colors history" />');

        $('.historySquare').hover(function() {
            setColor('new', this.title);
        });

        $('.historySquare').click(function() {
            setColor('cur', this.title);
        });

        $("#clearHistoryButton").click(function() { clearHistory() });

    } else {
        check_support('history');
        $("#historyColors").html("No history yet. Try to pick some colors from web.");

    }
}

$(document).ready(function() {
    // initialize script
    init();

    $("a.ext").click(function() { goto(this.href); });

    // Color Picker
    if ( disableColorpicker !== "true" ) {
        $("head").append('<link "text/css" rel="stylesheet" href="inc/bgrins-spectrum-6b5b0e9/spectrum.css">');
    }

    drawHistory();

    FlattrLoader.setup();
    $("[data-toggle=tooltip]").tooltip();
//    $("[data-toggle=tooltip-left]").tooltip({placement: 'left'});
//    $("[data-toggle=tooltip-bottom]").tooltip({placement: 'bottom'});
//    $("[data-toggle=tooltip-right]").tooltip({placement: 'right'});

});



function setColor(what, color, dontsave, history) {
    color = pusher.color(color);
    console.log(color.hex6());
    // TODO jak se bude chovat kdyz je undefined?
    if ( what == 'cur'&& color !== undefined ) {
        if ( dontsave !== true  ) {
            console.log('saving to bg');
            color_arr = color.rgba8();
            bg.bg.setColor({color: { r: color_arr[0], g: color_arr[1], b: color_arr[2], rgbhex: color.hex6() }, history: history});
            if ( history === true ) { drawHistory(); }
        }

        $("#colorpicker").spectrum("set", color.hex6());
    }

    obj = $("#"+what+"Color");

    out = '<div class="preview pull-left" style="background-color: '+color.hex6()+'; color: '+color.contrastWhiteBlack().hex6()+'">&nbsp;</div>';
    out += '<div class="hex pull-left">'+color.hex6()+'<br>'+color.hex3()+'<br>'+color.html('keyword');
    out += '<br>'
    out += color.html('hsl');
    out += '<br>'
    out += color.html('rgb');
    out += '</div>'

    obj.html(out);
}

function clearHistory()
{
    window.localStorage.history = '[]';
    drawHistory();
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
function showColorPicker()
{
    var activeColor = (bg.bg.color !== null) ? bg.bg.color : '000';

    $("#colorpicker").spectrum({
        flat: true,
        showInput: false,
        showInitial: true,
        preferredFormat: "hex",
        chooseText: "select",
        color: activeColor,
        move: function(tinycolor) {
            setColor('new', tinycolor.toHexString());
        },
        change: function(tinycolor) {
            setColor('cur', tinycolor.toHexString(), false, true);
        }
    });

}

