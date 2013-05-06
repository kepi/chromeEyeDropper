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
            output += '<div class="label historySquare" style="background: ' + history[c] + '" title="' + history[c] + '">&nbsp;</div>';
        }
        $("#historyColors").html(output+'<br class="clearfix" /><em class="muted">Hover your cursor over color boxes to preview color.<br>Click to set as selected and copy to clipboard.</em>');

        $('.historySquare').hover(function() {
            setColor('new', this.title);
        });

        $('.historySquare').click(function() {
            setColor('cur', this.title);
        });

        $("#clearHistory").show().click(function() { clearHistory() });
    } else {
        $("#clearHistory").hide();
        check_support('history');
        $("#historyColors").html("No history yet. Try to pick some colors from web or color picker.");

    }
}

$(document).ready(function() {
    // initialize script
    init();

    $("a.ext").click(function() { goto(this.href); });
    $("button.ext").click(function() { goto(this.data-href); });

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

    $("#buttonAbout").click(function() {
        $("#eyeDropperMain").toggle();
        $("#eyeDropperAbout").toggle();
    })
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

    var out;
//    out = '<div class="preview pull-left" style="background-color: '+color.hex6()+'; color: '+color.contrastWhiteBlack().hex6()+'">&nbsp;</div>';
//    out += '<div class="hex pull-left">'+color.hex6()+'<br>'+color.hex3()+'<br>'+color.html('keyword');
//    out += '<br>'
//    out += color.html('hsl');
//    out += '<br>'
//    out += color.html('rgb');
//    out += '</div>'

//    out = '<div style="background-color: '+color.hex6()+';">';
//    out += '<div class="pull-left cprev">';
//    out += color.hex6();
//    out += '<br>';
//    out += color.hex3();
//    out += '<br>';
//    out += color.html('keyword');
//    out += '</div>';
//
//    out += '<div class="pull-left cpreview cpreviewRight">';
//    out += color.html('hsl');
//    out += '<br>';
//    out += color.html('rgb');
//    out += '</div>';
//    out += '<br class="clear">';
//    out += '</div>';

    formats = [color.hex6(), color.hex3(), color.html('keyword'), color.html('hsl'), color.html('rgb')];

    var out = '';
    out = '<div class="colorPreviewBox" style="background-color: '+color.hex6()+';">';
    for ( key in formats ) {
        format = formats[key];
        out += '<span class="label">' + format + '</span>&nbsp;';
        out += key > 0 ? '<br>' : '&nbsp;'
    }
    out += '</div>';

    $("#"+what+"Color").html(out);
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

