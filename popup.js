var NEED_BG_VERSION=10;
var bgPage = null;
var pickupDisabled = false;

chrome.runtime.getBackgroundPage(function(backgroundPage) {
    bgPage = backgroundPage;

    // reload background if we need new version
    if ( bgPage.bg.version == undefined || bgPage.bg.version < NEED_BG_VERSION ) {
        console.log('Background version not ok, reloading.');
        console.log(bgPage.version);
        chrome.runtime.sendMessage({type: "reload-background"});
    }
});

// init tab
function init() {
    // find current tab
    chrome.tabs.getSelected(null, function (tab) {
        var message = '';
        // special chrome pages
        if (tab.url.indexOf('chrome') == 0) {
            message = "Chrome doesn't allow extensions to interact with special Chrome pages like this one.";
            pickupDisabled = true;
        }
        // chrome gallery
        else if (tab.url.indexOf('https://chrome.google.com/webstore') == 0) {
            message = "Chrome doesn't allow extensions to interact with Chrome Web Store.";
            pickupDisabled = true;
        }
        // local pages
        else if (tab.url.indexOf('file') == 0) {
            message = "Chrome doesn't allow extensions to interact with local pages.";
            pickupDisabled = true;
        }

        setDefaultColors();

        // disable or enable pickup button
        if (pickupDisabled === true) {
            $("#pickupButton").addClass("disabled");
//            $("#disableMessageHelp").attr('title',message);
            $("#disableMessageHelp").tooltip({title: message, placement: 'bottom'});
            $("#pickupMessage").show();
        } else {
            bgPage.bg.useTab(tab);
            $("#pickupButton").click(activatePick);
        }
    });
}

function setDefaultColors() {
    var activeColor = bgPage.bg.getColor();
    // set color boxes
    setColor('cur', activeColor, true);
    setColor('new', activeColor);

    showColorPicker(activeColor);
}

function activatePick() {
    if ( pickupDisabled === false ) {
        bgPage.bg.activate();
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
        var output = '';
        for ( var c in history ) {
            output += '<div class="historySquare" style="background: ' + history[c] + '" title="' + history[c] + '">&nbsp;</div>';
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
        $("#historyColors").html('<em class="muted">No history yet. Try to pick some colors from web or color picker.</em>');

    }
}


function setColor(what, color, dontsave, history) {
    color = pusher.color(color);
    // TODO jak se bude chovat kdyz je undefined?
    if ( what == 'cur'&& color !== undefined ) {
        if ( dontsave !== true  ) {
            var color_arr = color.rgba8();
            bgPage.bg.setColor({color: { r: color_arr[0], g: color_arr[1], b: color_arr[2], rgbhex: color.hex6() }, history: history});
            if ( history === true ) { drawHistory(); }
        }

        $("#colorpicker").spectrum("set", color.hex6());
    }

    formats = [color.hex6(), color.hex3(), color.html('keyword'), color.html('hsl'), color.html('rgb')];

    var out = '';
    out = '<div class="colorPreviewBox" style="background-color: '+color.hex6()+';">';
    for ( key in formats ) {
        format = formats[key];
        out += '<code>' + format + '</code>&nbsp;';
        out += key > 0 ? '<br>' : '&nbsp;'
    }
    out += '</div>';

    $("#"+what+"Color").html(out);
}

function clearHistory()
{
    chrome.runtime.sendMessage({type: "clear-history"}, function() {
        drawHistory();
        setDefaultColors();
    });
}

function check_support(what)
{
    chrome.runtime.sendMessage({type: "supports", what: what}, function(response) {
        if ( !response || response.state != 'ok' ) {
            ////console.log("Doesn't support " + what + ". Reloading background.");
            chrome.runtime.sendMessage({type: "reload-background"});
        }
    });
}

// show jPicker tab and set color
function showColorPicker(color)
{
    $("#colorpicker").spectrum({
        flat: true,
        showInput: true,
        showInitial: false,
        preferredFormat: "hex",
        chooseText: "select",
        color: color,
        move: function(tinycolor) {
            setColor('new', tinycolor.toHexString());
        },
        change: function(tinycolor) {
            setColor('cur', tinycolor.toHexString(), false, true);
        }
    });

    $(".sp-input").after('<em class="muted" id="inputTip" style="display: none;">You can enter color in hex, rgb, html name or hsl - all formats as you can see in boxes on right.</em>').focusin(function() { $("#inputTip").show()}).focusout(function() { $("#inputTip").hide()});

}

$(document).ready(function() {
    // initialize script
    init();

    $("a.ext").click(function() { goto(this.href); });
    $("button.ext").click(function() { goto(this.data-href); });

    drawHistory();

    FlattrLoader.setup();

    $("[data-toggle=tooltip]").tooltip();

    $("#buttonAbout").click(function() {
        $("#eyeDropperMain").toggle();
        $("#eyeDropperAbout").toggle();
    })
});


