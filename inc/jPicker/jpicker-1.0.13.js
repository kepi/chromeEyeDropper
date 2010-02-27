/*
 * jPicker 1.0.13
 *
 * jQuery Plugin for Photoshop style color picker
 *
 * Copyright (c) 2010 Christopher T. Tillman
 * Digital Magic Productions, Inc. (http://www.digitalmagicpro.com/)
 * MIT style license, FREE to use, alter, copy, sell, and especially ENHANCE
 *
 * Painstakingly ported from John Dyers' excellent work on his own color picker based on the Prototype framework.
 *
 * John Dyers' website: (http://johndyer.name)
 * Color Picker page:   (http://johndyer.name/post/2007/09/PhotoShop-like-JavaScript-Color-Picker.aspx)
 *
 *
 * Known Issues
 * ______________
 * Attaching multiple jPicker objects on a single page will slow performance.
 *   jPicker creates a new instance of the picker for every element. Performance will suffer when binding dozens of instances.
 *
 * Internet Explorer 8 Standards Mode is slow on dragging markers.
 *   While profiling using IE8 Dev kit it indicates it takes MUCH longer to apply the style changes while dragging the markers.
 *   There is no current solution I am aware of to fix this.
 *
 *
 * Coming Soon
 * ______________
 * 1.1.0
 *     Will consider supporting jQuery ThemeRoller CSS API for theming the UI if demand exists.
 *
 *     Move the jPicker object to a single instance that all selection instances point to.
 *        - This will result in much faster operation and initialization for pages with multiple pickers.
 *        - This will also remove the requirement for Internet Explorer to hide the picker icons for elements higher in the DOM (IE calculates its own z-index for embedded, positioned elements).
 *
 *     Add activateCallback option for calling a callback function when the jPicker is activated or its binding is switched to a different picker element.
 *
 * Change Log
 * ______________
 * 1.0.13
 *   Updated transparency algorithm for red/green/blue color modes. The algorithm from John Dyers' color picker was close but incorrect. Bar colors are now pixel perfect with the new algorithm.
 *   Changed from using "background-position" on the color maps to an element of full height using the "top" attribute for image-map location using "overflow: hidden" to hide overdraw.
 *   IE7/8 ignores opacity on elements taller than 4096px. Image maps therefore no longer include a blank first map so the Bar is just under 4096. Blank is now accomplished by setting the "top" setting to below the map display.
 *   New colorBar picker image that does not draw outside of the element since the elements now hide overdraw.
 *   Added IE5.5/6 support for the picker. This is why it now uses maps of full height and the "top" attribute for map locations.
 *   Moved the images in the maps to 4 pixels apart from each other. IE7/8 change the first pixel of the bottom-border of 2px to partially transparent showing a portion of a different color map without this.
 *
 * 1.0.12
 *   Added minified CSS file.
 *   Added IE7/8 Quirks Mode support.
 *   Added configurable string constants for all text and tooltips. You can now change the default values for different languages.
 *   Privatized the RGBA values in the Color object for better NULL handling. YOU MUST USE THE NEW GET FUNCTIONS TO ACCESS THE COLOR PROPERTIES.
 *   Better NULL color handling and an additional "No Color Selected" quick pick color.
 *   More consistent behavior across multiple versions of browsers.
 *   Added alpha response to the binded color picker icon.
 *   Removed "alphaSupport" variable. It is now always supported.
 *
 * 1.0.11b
 *   Corrected NULL behavior in IE. jQuery was getting an exception when attempting to assign a backgroundColor style of '#'. Now assigns 'transparent' if color is NULL.
 *   Can now create new Color object WITH OR WITHOUT the '#' prefix.
 *
 * 1.0.11
 *   Added ability for NULL colors (delete the hex value). Color will be returned as color.hex == ''. Can set the default color to an empty hex string as well.
 *   cancelCallback now returns the original color for use in programming responses.
 *
 * 1.0.10
 *   Corrected table layout and tweaked display for more consisent presentation. Nice catch from Jonathan Pasquier.
 *
 * 1.0.9
 *   Added optional title variable for each jPicker window.
 *
 * 1.0.8
 *   Moved all images into a few sprites - now using backgroundPosition to change color maps and bars instead of changing the image - this should be faster to download and run.
 *   
 * 1.0.7
 *   RENAMED CSS FILE TO INCLUDE VERSION NUMBER!!! YOU MUST USE THIS VERSIONED CSS FILE!!! There will be no need to do your own CSS version number increments from now on.
 *   Added opacity feedback to color preview boxes.
 *   Removed reliance on "id" value of containing object. Subobjects are now found by class and container instead of id's. This drastically reduces injected code.
 *   Removed (jQuery).jPicker.getListElementById(id) function since "id" is no longer incorporated or required.
 *
 * 1.0.6
 *   Corrected picker bugs introduced with 1.0.5.
 *   Removed alpha slider bar until activated - default behavior for alpha is now OFF.
 *   Corrected Color constructor bug not allowing values of 0 for initial value (it was evaluating false and missing the init code - Thanks Pavol).
 *   Removed title tags (tooltips) from color maps and bars - They get in the way in some browsers (e.g. IE - dragging marker does NOT prevent or hide the tooltip).
 *   THERE WERE CSS FILE CHANGES WITH THIS UPDATE!!! IF YOU USE NEVER-EXPIRE HEADERS, YOU WILL NEED TO INCREMENT YOUR CSS FILE VERSION NUMBER!!!
 *
 * 1.0.5
 *   Added opacity support to picker and color/callback methods. New property "a" (alpha - range from 0-100) in all color objects now - defaults to 100% opaque. (Thank you Pavol)
 *   Added title attributes to input elements - gives short tooltip directions on what button or field does.
 *   Commit callback used to fire on control initialization (twice actually) - This has been corrected, it does not fire on initialization.
 *   THERE WERE CSS FILE CHANGES WITH THIS UPDATE!!! IF YOU USE NEVER-EXPIRE HEADERS, YOU WILL NEED TO INCREMENT YOUR CSS FILE VERSION NUMBER!!!
 *
 * 1.0.4
 *   Added ability for smaller picker icon with expandable window on any DOM element (not just input).
 *   "draggable" property renamed to "expandable" and its scope increased to create small picker icon or large static picker.
 *
 * 1.0.3
 *   Added cancelCallback function for registering an external function when user clicks cancel button. (Thank you Jeff and Pavol)
 *
 * 1.0.2
 *   Random bug fixes - speed concerns.
 *
 * 1.0.1
 *   Corrected closure based memeory leak - there may be others?
 *
 * 1.0.0
 *   First Release.
 *
 */
(function($, version)
{
  var
    Slider = // encapsulate slider functionality for the ColorMap and ColorBar - could be useful to use a jQuery UI draggable for this with certain extensions
      function(bar, options)
      {
        var $this = this, // private properties, methods, and events - keep these variables and classes invisible to outside code
          arrow = bar.find('img').eq(0), // the arrow image image to drag
          minX = 0,
          maxX = 100,
          rangeX = 100,
          minY = 0,
          maxY = 100,
          rangeY = 100,
          x = 0,
          y = 0,
          offset,
          barMouseDown = // bind the mousedown to the bar not the arrow for quick snapping to the clicked location
            function(e)
            {
              var off = bar.offset();
              offset = { left: off.left, top: off.top };
              setValuesFromMousePosition(e);
              $this.draw();
              // Bind mousemove and mouseup event to the document so it responds when dragged of of the bar - we will unbind these when on mouseup to save processing
              $(document).bind('mousemove', docMouseMove).bind('mouseup', docMouseUp);
              e.stopPropagation();
              e.preventDefault(); // don't try to select anything or drag the image to the desktop
              return false;
            },
          docMouseMove = // set the values as the mouse moves
            function(e)
            {
              setValuesFromMousePosition(e);
              $this.draw();
              e.stopPropagation();
              e.preventDefault();
              return false;
            },
          docMouseUp = // unbind the document events - they aren't needed when not dragging
            function(e)
            {
              $(document).unbind('mouseup', docMouseUp).unbind('mousemove', docMouseMove);
              e.stopPropagation();
              e.preventDefault();
              return false;
            },
          setValuesFromMousePosition = // calculate mouse position and set value within the current range
            function(e)
            {
              var locX = e.pageX - offset.left,
                  locY = e.pageY - offset.top,
                  barW = bar.w, // local copies for YUI compressor
                  barH = bar.h;
              // keep the arrow within the bounds of the bar
              if (locX < 0) locX = 0;
              else if (locX > barW) locX = barW;
              if (locY < 0) locY = 0;
              else if (locY > barH) locY = barH;
              // we will use Math.floor for ALL conversion to pixel lengths - parseInt takes a string as input so it boxes the number into a string THEN converts it
              // number.toFixed(0) spends time processing rounding which when dealing with imprecise pixels is unnecessary
              $this.set_X(((locX / barW) * rangeX) + minX);
              $this.set_Y(((locY / barH) * rangeY) + minY);
              // check if this.valuesChanged is a function and execute it if it is
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            };
        $.extend(true, $this, // public properties, methods, and event - these we need to access from other controls
          {
            settings: options, // we'll set map and arrow dimensions and image sources
            valuesChanged: $.isFunction(arguments[2]) && arguments[2] || null, // pass this argument or assign the variable to register for callbacks
            get_X:
              function()
              {
                return x;
              },
            set_X:
              function(newX)
              {
                newX = Math.floor(newX);
                if (x == newX) return;
                if (newX < minX) newX = minX;
                else if (newX > maxX) newX = maxX;
                x = newX;
              },
            get_Y:
              function()
              {
                return y;
              },
            set_Y:
              function(newY)
              {
                newY = Math.floor(newY);
                if (y == newY) return;                
                if (newY < minY) newY = minY;
                else if (newY > maxY) newY = maxY;
                y = newY;
              },
            set_RangeX:
              function(newMinX, newMaxX)
              {
                if (minX == newMinX && maxX == newMaxX) return;
                if (newMinX > newMaxX) return;
                minX = newMinX;
                maxX = newMaxX;
                rangeX = maxX - minX;
              },
            set_RangeY:
              function(newMinY, newMaxY)
              {
                if (minY == newMinY && maxY == newMaxY) return;
                if (newMinY > newMaxY) return;
                minY = newMinY;
                maxY = newMaxY;
                rangeY = maxY - minY;
              },
            draw:
              function()
              {
                var arrowOffsetX = 0,
                  arrowOffsetY = 0,
                  barW = bar.w,
                  barH = bar.h,
                  arrowW = arrow.w,
                  arrowH = arrow.h;
                if (rangeX > 0) // range is greater than zero
                {
                  // constrain to bounds
                  if (x == maxX) arrowOffsetX = barW;
                  else arrowOffsetX = Math.floor((x / rangeX) * barW);
                }
                if (rangeY > 0) // range is greater than zero
                {
                  // constrain to bounds
                  if (y == maxY) arrowOffsetY = barH;
                  else arrowOffsetY = Math.floor((y / rangeY) * barH);
                }
                // if arrow width is greater than bar width, center arrow and prevent horizontal dragging
                if (arrowW >= barW) arrowOffsetX = (barW >> 1) - (arrowW >> 1); // number >> 1 - superfast bitwise divide by two and truncate (move bits over one bit discarding lowest)
                else arrowOffsetX -= arrowW >> 1;
                // if arrow height is greater than bar height, center arrow and prevent vertical dragging
                if (arrowH >= barH) arrowOffsetY = (barH >> 1) - (arrowH >> 1);
                else arrowOffsetY -= arrowH >> 1;
                // set the arrow position based on these offsets
                arrow.css({ left: arrowOffsetX + 'px', top: arrowOffsetY + 'px' });
              },
            destroy:
              function()
              {
                // unbind all possible events and null objects
                $(document).unbind('mouseup', docMouseUp).unbind('mousemove', docMouseMove);
                bar.unbind('mousedown', barMouseDown);
                bar = null;
                arrow = null;
                $this.valuesChanged = null;
              }
          });
        var settings = $this.settings;
        // initialize this control
        arrow.src = settings.arrow && settings.arrow.image;
        arrow.w = settings.arrow && settings.arrow.width || arrow.width();
        arrow.h = settings.arrow && settings.arrow.height || arrow.height();
        bar.w = settings.map && settings.map.width || bar.width();
        bar.h = settings.map && settings.map.height || bar.height();
        // bind mousedown event
        bar.bind('mousedown', barMouseDown);
        $this.draw();
        // first callback to set initial values
        $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
      },
    ColorValuePicker = // controls for all the input elements for the typing in color values
      function(picker)
      {
        var $this = this, // private properties and methods 
          hsvKeyUp = // hue, saturation, or brightness input box key up - validate value and set color
            function(e)
            {
              if (e.target.value == '') return;
              if (!color.get_H() && fields.hue.val() == '') fields.hue.val(0);
              if (!color.get_S() && fields.saturation.val() == '') fields.saturation.val(100);
              if (!color.get_V() && fields.value.val() == '') fields.value.val(100);
              if (!color.get_A() && fields.alpha.val() == '') fields.alpha.val(100);
              validateHsva(e);
              $this.setValuesFromHsva();
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            },
          rgbaKeyUp = // red, green, blue, or alpha input box key up - validate and set color
            function(e)
            {
              if (e.target.value == '') return;
              if (!color.get_R() && fields.red.val() == '') fields.red.val(0);
              if (!color.get_G() && fields.green.val() == '') fields.green.val(0);
              if (!color.get_B() && fields.blue.val() == '') fields.blue.val(0);
              if (!color.get_A() && fields.alpha.val() == '') fields.alpha.val(100);
              validateRgba(e);
              $this.setValuesFromRgba();
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            },
          hsvBlur = // hue, saturation, or brightness input box blur - reset to original if value empty
            function(e)
            {
              $this.setValuesFromHsva();
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            },
          rgbaBlur = // red, green, blue, or alpha input box blur - reset to original value if empty
            function(e)
            {
              $this.setValuesFromRgba();
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            },
          hexKeyUp = // hex input box key up - validate and set color
            function(e)
            {
              validateHex(e);
              $this.setValuesFromHex();
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            },
          hexBlur = // hex input box blur - reset to original value if empty
            function(e)
            {
              if (e.target.value == '') $this.setValuesFromHex();
            },
          validateRgba = // validate rgb values
            function(e)
            {
              if (!validateKey(e)) return e;
              var red = setValueInRange(fields.red.val(), 0, 255),
                green = setValueInRange(fields.green.val(), 0, 255),
                blue = setValueInRange(fields.blue.val(), 0, 255),
                alpha = setValueInRange(fields.alpha.val(), 0, 100);
              fields.red.val(red != null ? red : '');
              fields.green.val(green != null ? green : '');
              fields.blue.val(blue != null ? blue : '');
              fields.alpha.val(alpha != null ? alpha : '');
            },
          validateHsva = // validate hsv values
            function(e)
            {
              if (!validateKey(e)) return e;
              var hue = setValueInRange(fields.hue.val(), 0, 360),
                saturation = setValueInRange(fields.saturation.val(), 0, 100),
                value = setValueInRange(fields.value.val(), 0, 100),
                alpha = setValueInRange(fields.alpha.val(), 0, 100);
              fields.hue.val(hue != null ? hue : '');
              fields.saturation.val(saturation != null ? saturation : '');
              fields.value.val(value != null ? value : '');
              fields.alpha.val(alpha != null ? alpha : '');
            },
          validateHex = // validate hex value
            function(e)
            {
              if (!validateKey(e)) return e;
              fields.hex.val(fields.hex.val().replace(/[^a-fA-F0-9]/g, '').toLowerCase().substring(0, 8));
            },
          validateKey = // validate key
            function(e)
            {
              switch(e.keyCode)
              {
                case 9:
                case 16:
                case 29:
                case 37:
                case 38:
                case 40:
                  return false;
                case 'c'.charCodeAt():
                case 'v'.charCodeAt():
                  if (e.ctrlKey) return false;
              }
              return true;
            },
          setValueInRange = // constrain value within range
            function(value, min, max)
            {
              if (value == '' || isNaN(value)) return min;
              if (value > max) return max;
              if (value < min) return min;
              return value;
            };
        $.extend(true, $this, // public properties and methods
          {
            color: new Color(),
            fields:
              {
                hue: picker.find('.jPicker_HueText').eq(0),
                saturation: picker.find('.jPicker_SaturationText').eq(0),
                value: picker.find('.jPicker_BrightnessText').eq(0),
                red: picker.find('.jPicker_RedText').eq(0),
                green: picker.find('.jPicker_GreenText').eq(0),
                blue: picker.find('.jPicker_BlueText').eq(0),
                hex: picker.find('.jPicker_HexText').eq(0),
                alpha: picker.find('.jPicker_AlphaText').eq(0)
              },
            valuesChanged: $.isFunction(arguments[1]) && arguments[1] || null,
            bindedHexKeyUp: // binded input element key up
              function(e)
              {
                hexKeyUp(e);
              },
            setValuesFromRgba: // set values when rgb changes
              function()
              {
                if (fields.red.val() == '' && fields.green.val() == '' && fields.blue.val() == '' && fields.alpha.val() == '') return;
                if (fields.red.val() == '') fields.red.val(0);
                if (fields.green.val() == '') fields.green.val(0);
                if (fields.blue.val() == '') fields.blue.val(0);
                if (fields.alpha.val() == '') fields.alpha.val(100);
                color.fromRgba(fields.red.val(), fields.green.val(), fields.blue.val(), fields.alpha.val());
                var rgba = color.get_Rgb(),
                  hue = color.get_H(),
                  saturation = color.get_S(),
                  value = color.get_V(),
                  alpha = color.get_A();
                fields.hex.val(rgba != null ? rgba : '');
                fields.hue.val(hue != null ? hue : '');
                fields.saturation.val(saturation != null ? saturation : '');
                fields.value.val(value != null ? value : '');
                fields.alpha.val(alpha != null ? alpha : '');
              },
            setValuesFromHsva: // set values when hsv changes
              function()
              {
                if (fields.hue.val() == '' && fields.saturation.val() == '' && fields.value.val() == '' && fields.alpha.val() == '') return;
                if (fields.hue.val() == '') fields.hue.val(0);
                if (fields.saturation.val() == '') fields.saturation.val(0);
                if (fields.value.val() == '') fields.value.val(0);
                if (fields.alpha.val() == '') fields.alpha.val(100);
                color.fromHsva(fields.hue.val(), fields.saturation.val(), fields.value.val(), fields.alpha.val());
                var rgba = color.get_Rgb(),
                  red = color.get_R(),
                  green = color.get_G(),
                  blue = color.get_B(),
                  alpha = color.get_A();
                fields.hex.val(rgba != null ? rgba : '');
                fields.red.val(red != null ? red : '');
                fields.green.val(green != null ? green : '');
                fields.blue.val(blue != null ? blue : '');
              },
            setValuesFromHex: // set values when hex changes
              function()
              {
                color.fromHex(fields.hex.val());
                var rgba = color.get_Rgb(),
                  red = color.get_R(),
                  green = color.get_G(),
                  blue = color.get_B(),
                  alpha = color.get_A(),
                  hue = color.get_H(),
                  saturation = color.get_S(),
                  value = color.get_V();
                fields.red.val(red != null ? red : '');
                fields.green.val(green != null ? green : '');
                fields.blue.val(blue != null ? blue : '');
                fields.alpha.val(alpha != null ? alpha : '');
                fields.hue.val(hue != null ? hue : '');
                fields.saturation.val(saturation != null ? saturation : '');
                fields.value.val(value != null ? value : '');
              },
            destroy:
              function()
              {
                // unbind all events and null objects
                fields.hue.add(fields.saturation).add(fields.value).unbind('keyup', events.hsvKeyUp).unbind('blur', hsvBlur);
                fields.red.add(fields.green).add(fields.blue).add(fields.alpha).unbind('keyup', events.rgbaKeyUp).unbind('blur', rgbaBlur);
                fields.hex.unbind('keyup', hexKeyUp);
                fields = null;
                color = null;
                $this.valuesChanged = null;
              }
          });
        var fields = $this.fields, color = $this.color; // local copies for YUI compressor
        fields.hue.add(fields.saturation).add(fields.value).bind('keyup', hsvKeyUp).bind('blur', hsvBlur);
        fields.red.add(fields.green).add(fields.blue).add(fields.alpha).bind('keyup', rgbaKeyUp).bind('blur', rgbaBlur);
        fields.hex.bind('keyup', hexKeyUp).bind('blur', hexBlur);
        if (fields.hex.val() != '')
        {
          color.fromHex(fields.hex.val());
          $this.setValuesFromHex();
        }
      };
  $.jPicker =
    {
      List: [], // array holding references to each active instance of the control
      Color: // color object - we will be able to assign by any color space type or retrieve any color space info
             // we want this public so we can optionally assign new color objects to initial values using inputs other than a string hex value (also supported)
        function(init)
        {
          var $this = this,
            r,
            g,
            b,
            a,
            h,
            s,
            v;
          $.extend(true, $this, // public properties and methods
            {
              get_R:
                function()
                {
                  return r;
                },
              get_G:
                function()
                {
                  return g;
                },
              get_B:
                function()
                {
                  return b;
                },
              get_A:
                function()
                {
                  return a;
                },
              get_Rgba:
                function()
                {
                  return r != null && g != null && b != null && a != null ? ColorMethods.rgbaToHex({ r: r, g: g, b: b, a: a }) : null;
                },
              get_Rgb:
                function()
                {
                  return r != null && g != null && b != null ? ColorMethods.rgbToHex({ r: r, g: g, b: b }) : null;
                },
              get_Hex:
                function()
                {
                  var ret = $this.get_Rgb();
                  return ret && ret.substring(0, 6) || null;
                },
              get_H:
                function()
                {
                  return h;
                },
              get_S:
                function()
                {
                  return s;
                },
              get_V:
                function()
                {
                  return v;
                },
              get_Hsv:
                function()
                {
                  return { h: h, s: s, v: v };
                },
              fromRgba:
                function(red, green, blue, alpha)
                {
                  r = Math.floor(red);
                  g = Math.floor(green);
                  b = Math.floor(blue);
                  a = Math.floor(alpha);
                  var hsv = ColorMethods.rgbToHsv({ r: red, g: green, b: blue });
                  h = Math.floor(hsv.h);
                  s = Math.floor(hsv.s);
                  v = Math.floor(hsv.v);
                },
              fromHsva:
                function(hue, saturation, value, alpha)
                {
                  h = Math.floor(hue);
                  s = Math.floor(saturation);
                  v = Math.floor(value);
                  a = Math.floor(alpha);
                  var rgb = ColorMethods.hsvToRgb({ h: hue, s: saturation, v: value });
                  r = Math.floor(rgb.r);
                  g = Math.floor(rgb.g);
                  b = Math.floor(rgb.b);
                },
              fromHex:
                function(hex)
                {
                  if (hex == null || hex == '')
                  {
                    r = null;
                    g = null;
                    b = null;
                    a = null;
                    h = null;
                    s = null;
                    v = null;
                    return;
                  }
                  var rgba = ColorMethods.hexToRgba(hex);
                  r = Math.floor(rgba.r);
                  g = Math.floor(rgba.g);
                  b = Math.floor(rgba.b);
                  a = Math.floor(rgba.a);
                  var hsv = ColorMethods.rgbToHsv({ r: rgba.r, g: rgba.g, b: rgba.b });
                  h = Math.floor(hsv.h);
                  s = Math.floor(hsv.s);
                  v = Math.floor(hsv.v);
                }
            });
          if (init)
          {
            if (init.hex != null && init.hex != '') $this.fromHex(init.hex);
            else if (!isNaN(init.r)) $this.fromRgba(init.r, init.g, init.b, init.a != null ? init.a : 100);
            else if (!isNaN(init.h)) $this.fromHsva(init.h, init.s, init.v, init.a != null ? init.a : 100);
          }
        },
      ColorMethods: // color conversion methods  - make public to give use to external scripts
        {
          hexToRgba:
            function(hex)
            {
              hex = this.validateHex(hex);
              if (hex == '') return { r: null, g: null, b: null, a: null };
              var r = '00', g = '00', b = '00', a = '100';
              if (hex.length == 6) hex += 'ff';
              if (hex.length > 6)
              {
                r = hex.substring(0, 2);
                g = hex.substring(2, 4);
                b = hex.substring(4, 6);
                a = hex.substring(6, hex.length);
              }
              else
              {
                if (hex.length > 4)
                {
                  r = hex.substring(4, hex.length);
                  hex = hex.substring(0, 4);
                }
                if (hex.length > 2)
                {
                  g = hex.substring(2, hex.length);
                  hex = hex.substring(0, 2);
                }
                if (hex.length > 0) b = hex.substring(0, hex.length);
              }
              return { r: this.hexToInt(r), g: this.hexToInt(g), b: this.hexToInt(b), a: Math.floor((this.hexToInt(a) * 100) / 255) };
            },
          validateHex:
            function(hex)
            {
              hex = hex.toLowerCase().replace(/[^a-f0-9]/g, '');
              if (hex.length > 8) hex = hex.substring(0, 8);
              return hex;
            },
          rgbaToHex:
            function(rgba)
            {
              return this.intToHex(rgba.r) + this.intToHex(rgba.g) + this.intToHex(rgba.b) + this.intToHex(Math.floor((rgba.a * 255) / 100));
            },
          rgbToHex:
            function(rgba)
            {
              return this.intToHex(rgba.r) + this.intToHex(rgba.g) + this.intToHex(rgba.b);
            },
          intToHex:
            function(dec)
            {
              var result = Math.floor(dec).toString(16);
              if (result.length == 1) result = ('0' + result);
              return result.toLowerCase();
            },
          hexToInt:
            function(hex)
            {
              return parseInt(hex, 16);
            },
          rgbToHsv:
            function(rgb)
            {
              var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255, hsv = { h: 0, s: 0, v: 0 }, min = 0, max = 0, delta;
              if (r >= g && r >= b)
              {
                max = r;
                min = g > b ? b : g;
              }
              else if (g >= b && g >= r)
              {
                max = g;
                min = r > b ? b : r;
              }
              else
              {
                max = b;
                min = g > r ? r : g;
              }
              hsv.v = max;
              hsv.s = max ? (max - min) / max : 0;
              if (!hsv.s) hsv.h = 0;
              else
              {
                delta = max - min;
                if (r == max) hsv.h = (g - b) / delta;
                else if (g == max) hsv.h = 2 + (b - r) / delta;
                else hsv.h = 4 + (r - g) / delta;
                hsv.h = parseInt(hsv.h * 60);
                if (hsv.h < 0) hsv.h += 360;
              }
              hsv.s = Math.floor(hsv.s * 100);
              hsv.v = Math.floor(hsv.v * 100);
              return hsv;
            },
          hsvToRgb:
            function(hsv)
            {
              var rgb = { r: 0, g: 0, b: 0, a: 100 }, h = hsv.h, s = hsv.s, v = hsv.v;
              if (s == 0)
              {
                if (v == 0) rgb.r = rgb.g = rgb.b = 0;
                else rgb.r = rgb.g = rgb.b = Math.floor(v * 255 / 100);
              }
              else
              {
                if (h == 360) h = 0;
                h /= 60;
                s = s / 100;
                v = v / 100;
                var i = Math.floor(h),
                    f = h - i,
                    p = v * (1 - s),
                    q = v * (1 - (s * f)),
                    t = v * (1 - (s * (1 - f)));
                switch (i)
                {
                  case 0:
                    rgb.r = v;
                    rgb.g = t;
                    rgb.b = p;
                    break;
                  case 1:
                    rgb.r = q;
                    rgb.g = v;
                    rgb.b = p;
                    break;
                  case 2:
                    rgb.r = p;
                    rgb.g = v;
                    rgb.b = t;
                    break;
                  case 3:
                    rgb.r = p;
                    rgb.g = q;
                    rgb.b = v;
                    break;
                  case 4:
                    rgb.r = t;
                    rgb.g = p;
                    rgb.b = v;
                    break;
                  case 5:
                    rgb.r = v;
                    rgb.g = p;
                    rgb.b = q;
                    break;
                }
                rgb.r = Math.floor(rgb.r * 255);
                rgb.g = Math.floor(rgb.g * 255);
                rgb.b = Math.floor(rgb.b * 255);
              }
              return rgb;
            }
        }
    };
  var Color = $.jPicker.Color, List = $.jPicker.List, ColorMethods = $.jPicker.ColorMethods; // local copies for YUI compressor
  $.fn.jPicker =
    function(options)
    {
      var $arguments = arguments;
      return this.each(
        function()
        {
          var $this = $(this), $settings = $.extend(true, {}, $.fn.jPicker.defaults, options); // local copies for YUI compressor
          if ($this.get(0).nodeName.toLowerCase() == 'input') // Add color picker icon if binding to an input element and bind the events to the input
          {
            $.extend(true, $settings,
              {
                window:
                {
                  bindToInput: true,
                  expandable: true,
                  input: $this
                }
              });
            if (ColorMethods.validateHex($this.val()))
            {
              $settings.color.active = new Color({ hex: $this.val(), a: $settings.color.active.get_A() });
              $settings.color.current = new Color({ hex: $this.val(), a: $settings.color.active.get_A() });
            }
          }
          if ($settings.window.expandable)
            $this.after('<span class="jPicker_Picker"><span class="jPicker_Color">&nbsp;</span><span class="jPicker_Alpha">&nbsp;</span><span class="jPicker_Icon" title="Click To Open Color Picker">&nbsp;</span><span class="jPicker_Container">&nbsp;</span></span>');
          else $settings.window.liveUpdate = false; // Basic control binding for inline use - You will need to override the liveCallback or commitCallback function to retrieve results
          var isLessThanIE7 = parseFloat(navigator.appVersion.split('MSIE')[1]) < 7 && document.body.filters, // needed to run the AlphaImageLoader function for IE6
            colorMapDiv = null,
            colorBarDiv = null,
            colorMapL1 = null, // different layers of colorMap and colorBar
            colorMapL2 = null,
            colorMapL3 = null,
            colorBarL1 = null,
            colorBarL2 = null,
            colorBarL3 = null,
            colorBarL4 = null,
            colorBarL5 = null,
            colorBarL6 = null,
            container = null,
            hue = null, // radio buttons
            saturation = null,
            value = null,
            red = null,
            green = null,
            blue = null,
            alpha = null,
            colorMap = null, // color maps
            colorBar = null,
            colorPicker = null,
            elementStartX = null, // Used to record the starting css positions for dragging the control
            elementStartY = null,
            pageStartX = null, // Used to record the mousedown coordinates for dragging the control
            pageStartY = null,
            activeColor = null, // color boxes above the radio buttons
            currentColor = null,
            currentActiveBG = null,
            okButton = null,
            cancelButton = null,
            grid = null, // preset colors grid
            colorBox = null, // colorBox for popup button
            colorAlpha = null, // colorAlpha for popup icon
            colorIcon = null, // colorIcon popup icon
            moveBar = null, // drag bar
            setColorMode = // set color mode and update visuals for the new color mode
              function(colorMode)
              {
                color.active = colorPicker.color;
                var active = color.active, // local copies for YUI compressor
                  clientPath = images.clientPath,
                  hex = active.get_Hex();
                hue.add(saturation).add(value).add(red).add(green).add(blue).add(alpha).removeAttr('checked');
                switch (colorMode)
                {
                  case 'h':
                    hue.attr({checked: true});
                    setBG(colorMapDiv, 'transparent');
                    setImgLoc(colorMapL1, 0);
                    setAlpha(colorMapL1, 100);
                    setImgLoc(colorMapL2, 260);
                    setAlpha(colorMapL2, 100);
                    setBG(colorBarDiv, 'transparent');
                    setImgLoc(colorBarL1, 0);
                    setAlpha(colorBarL1, 100);
                    setImgLoc(colorBarL2, 260);
                    setAlpha(colorBarL2, 100);
                    setImgLoc(colorBarL3, 260);
                    setAlpha(colorBarL3, 100);
                    setImgLoc(colorBarL4, 260);
                    setAlpha(colorBarL4, 100);
                    setImgLoc(colorBarL6, 260);
                    setAlpha(colorBarL6, 100);
                    break;
                  case 's':
                    saturation.attr({checked: true});
                    setBG(colorMapDiv, 'transparent');
                    setImgLoc(colorMapL1, -260);
                    setAlpha(colorMapL1, 100);
                    setImgLoc(colorMapL2, -520);
                    setImgLoc(colorBarL1, -260);
                    setAlpha(colorBarL1, 100);
                    setImgLoc(colorBarL2, -520);
                    setImgLoc(colorBarL3, 260);
                    setAlpha(colorBarL3, 100);
                    setImgLoc(colorBarL4, 260);
                    setAlpha(colorBarL4, 100);
                    setImgLoc(colorBarL6, 260);
                    setAlpha(colorBarL6, 100);
                    break;
                  case 'v':
                    value.attr({checked: true});
                    setBG(colorMapDiv, '000000');
                    setImgLoc(colorMapL1, -780);
                    setImgLoc(colorMapL2, 260);
                    setAlpha(colorMapL1, 100);
                    setBG(colorBarDiv, hex);
                    setImgLoc(colorBarL1, -520);
                    setAlpha(colorBarL1, 100);
                    setImgLoc(colorBarL2, 260);
                    setAlpha(colorBarL2, 100);
                    setImgLoc(colorBarL3, 260);
                    setAlpha(colorBarL3, 100);
                    setImgLoc(colorBarL4, 260);
                    setAlpha(colorBarL4, 100);
                    setImgLoc(colorBarL6, 260);
                    setAlpha(colorBarL6, 100);
                    break;
                  case 'r':
                    red.attr({checked: true});
                    setBG(colorMapDiv, 'transparent');
                    setImgLoc(colorMapL1, -1040);
                    setAlpha(colorMapL1, 100);
                    setImgLoc(colorMapL2, -1300);
                    setBG(colorBarDiv, 'transparent');
                    setImgLoc(colorBarL1, -1560);
                    setAlpha(colorBarL1, 100);
                    setImgLoc(colorBarL2, -1300);
                    setImgLoc(colorBarL3, -780);
                    setImgLoc(colorBarL4, -1040);
                    setImgLoc(colorBarL6, 260);
                    setAlpha(colorBarL6, 100);
                    break;
                  case 'g':
                    green.attr({checked: true});
                    setBG(colorMapDiv, 'transparent');
                    setImgLoc(colorMapL1, -1560);
                    setAlpha(colorMapL1, 100);
                    setImgLoc(colorMapL2, -1820);
                    setBG(colorBarDiv, 'transparent');
                    setImgLoc(colorBarL1, -2600);
                    setAlpha(colorBarL1, 100);
                    setImgLoc(colorBarL2, -2340);
                    setImgLoc(colorBarL3, -1820);
                    setImgLoc(colorBarL4, -2080);
                    setImgLoc(colorBarL6, 260);
                    setAlpha(colorBarL6, 100);
                    break;
                  case 'b':
                    blue.attr({checked: true});
                    setBG(colorMapDiv, 'transparent');
                    setImgLoc(colorMapL1, -2080);
                    setAlpha(colorMapL1, 100);
                    setImgLoc(colorMapL2, -2340);
                    setBG(colorBarDiv, 'transparent');
                    setImgLoc(colorBarL1, -3640);
                    setAlpha(colorBarL1, 100);
                    setImgLoc(colorBarL2, -3380);
                    setImgLoc(colorBarL3, -2860);
                    setImgLoc(colorBarL4, -3120);
                    setImgLoc(colorBarL6, 260);
                    setAlpha(colorBarL6, 100);
                    break;
                  case 'a':
                    alpha.attr({checked: true});
                    setBG(colorMapDiv, 'transparent');
                    setImgLoc(colorMapL1, -260);
                    setAlpha(colorMapL1, 100);
                    setImgLoc(colorMapL2, -520);
                    setImgLoc(colorBarL1, 260);
                    setAlpha(colorBarL1, 100);
                    setImgLoc(colorBarL2, 260);
                    setAlpha(colorBarL2, 100);
                    setImgLoc(colorBarL3, 260);
                    setAlpha(colorBarL3, 100);
                    setImgLoc(colorBarL4, 260);
                    setAlpha(colorBarL4, 100);
                    setImgLoc(colorBarL5, 260);
                    setAlpha(colorBarL5, 100);
                    setImgLoc(colorBarL6, 0);
                    setAlpha(colorBarL6, 100);
                    break;
                  default:
                    throw ('Invalid Mode');
                    break;
                }
                switch (colorMode)
                {
                  case 'h':
                    colorMap.set_RangeX(0, 100);
                    colorMap.set_RangeY(0, 100);
                    colorBar.set_RangeY(0, 360);
                    break;
                  case 's':
                  case 'v':
                  case 'a':
                    colorMap.set_RangeX(0, 360);
                    colorMap.set_RangeY(0, 100);
                    colorBar.set_RangeY(0, 100);
                    break;
                  case 'r':
                  case 'g':
                  case 'b':
                    colorMap.set_RangeX(0, 255);
                    colorMap.set_RangeY(0, 255);
                    colorBar.set_RangeY(0, 255);
                    break;
                }
                color.mode = colorMode;
                positionMapAndBarArrows();
                colorMap.draw();
                colorBar.draw();
                updateVisuals();
                if (window.expandable && window.liveUpdate)
                {
                  colorBox.css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
                  setAlpha(colorAlpha, 100 - active.get_A());
                  if (window.bindToInput)
                    window.input.val(active.get_Rgba() || '').css(
                      {
                        backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent',
                        color: active.get_V() > 75 ? '#000000' : '#ffffff'
                      });
                }
                $.isFunction($this.liveCallback) && $this.liveCallback(active);
              },
            textValuesChanged = // Update color when user changes text values
              function()
              {
                positionMapAndBarArrows();
                colorMap.draw();
                colorBar.draw();
                updateVisuals();
                color.active = colorPicker.color;
                var active = color.active; // local copy for YUI compressor
                if (window.expandable && window.liveUpdate)
                {
                  var hex = active.get_Hex();
                  colorBox.css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
                  setAlpha(colorAlpha, 100 - active.get_A());
                  if (window.bindToInput)
                    window.input.val(colorPicker.fields.hex.val()).css(
                      {
                        backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent',
                        color: active.get_V() > 75 ? '#000000' : '#ffffff'
                      });
                }
                $.isFunction($this.liveCallback) && $this.liveCallback(active);
              },
            mapValueChanged = // user has dragged the ColorMap pointer
              function()
              {
                if (!colorPicker || !colorMap || !colorBar) return;
                color.active = colorPicker.color;
                var fields = colorPicker.fields, // local copies for YUI compressor
                  active = color.active;
                switch (color.mode)
                {
                  case 'h':
                    fields.saturation.val(colorMap.get_X());
                    fields.value.val(100 - colorMap.get_Y());
                    if (active.get_H() == null) fields.hue.val(0);
                    break;
                  case 's':
                  case 'a':
                    fields.hue.val(colorMap.get_X());
                    fields.value.val(100 - colorMap.get_Y());
                    if (active.get_S() == null) fields.saturation.val(100);
                    break;
                  case 'v':
                    fields.hue.val(colorMap.get_X());
                    fields.saturation.val(100 - colorMap.get_Y());
                    if (active.get_V() == null) fields.value.val(100);
                    break;
                  case 'r':
                    fields.green.val(255 - colorMap.get_Y());
                    fields.blue.val(colorMap.get_X());
                    if (active.get_R() == null) fields.red.val(0);
                    break;
                  case 'g':
                    fields.red.val(255 - colorMap.get_Y());
                    fields.blue.val(colorMap.get_X());
                    if (active.get_G() == null) fields.green.val(0);
                    break;
                  case 'b':
                    fields.red.val(colorMap.get_X());
                    fields.green.val(255 - colorMap.get_Y());
                    if (active.get_B() == null) fields.blue.val(0);
                    break;
                }
                if (active.get_A() == null && fields.alpha.val() == '') fields.alpha.val(100);
                switch (color.mode)
                {
                  case 'h':
                  case 's':
                  case 'v':
                  case 'a':
                    colorPicker.setValuesFromHsva();
                    break;
                  case 'r':
                  case 'g':
                  case 'b':
                    colorPicker.setValuesFromRgba();
                    break;
                }
                updateVisuals();
                if (window.expandable && window.liveUpdate)
                {
                  var hex = active.get_Hex();
                  colorBox.css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
                  setAlpha(colorAlpha, 100 - active.get_A());
                  if (window.bindToInput)
                    window.input.val(active.get_Rgba() || '').css(
                      {
                        backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent',
                        color: active.get_V() > 75 ? '#000000' : '#ffffff'
                      });
                }
                $.isFunction($this.liveCallback) && $this.liveCallback(active);
              },
            colorBarValueChanged = // user has dragged the ColorBar slider
              function()
              {
                if (!colorPicker || !colorMap || !colorBar) return;
                color.active = colorPicker.color;
                var fields = colorPicker.fields, // local copies for YUI compressor
                  active = color.active;
                switch (color.mode)
                {
                  case 'h':
                    fields.hue.val(360 - colorBar.get_Y());
                    if (active.get_S() == null) fields.saturation.val(100);
                    if (active.get_V() == null) fields.value.val(100);
                    break;
                  case 's':
                    fields.saturation.val(100 - colorBar.get_Y());
                    if (active.get_H() == null) fields.hue.val(0);
                    if (active.get_V() == null) fields.value.val(100);
                    break;
                  case 'v':
                    fields.value.val(100 - colorBar.get_Y());
                    if (active.get_H() == null) fields.hue.val(0);
                    if (active.get_S() == null) fields.saturation.val(100);
                    break;
                  case 'r':
                    fields.red.val(255 - colorBar.get_Y());
                    if (active.get_G() == null) fields.green.val(0);
                    if (active.get_B() == null) fields.blue.val(0);
                    break;
                  case 'g':
                    fields.green.val(255 - colorBar.get_Y());
                    if (active.get_R() == null) fields.red.val(0);
                    if (active.get_B() == null) fields.blue.val(0);
                    break;
                  case 'b':
                    fields.blue.val(255 - colorBar.get_Y());
                    if (active.get_R() == null) fields.red.val(0);
                    if (active.get_G() == null) fields.green.val(0);
                    break;
                  case 'a':
                    fields.alpha.val(100 - colorBar.get_Y());
                    if (active.get_R() == null) fields.red.val(0);
                    if (active.get_G() == null) fields.green.val(0);
                    if (active.get_B() == null) fields.blue.val(0);
                    break;
                }
                if (active.get_A() == null && fields.alpha.val() == '') fields.alpha.val(100);
                switch (color.mode)
                {
                  case 'h':
                  case 's':
                  case 'v':
                    colorPicker.setValuesFromHsva();
                    break;
                  case 'r':
                  case 'g':
                  case 'b':
                  case 'a':
                    colorPicker.setValuesFromRgba();
                    break;
                }
                updateVisuals();
                if (window.expandable && window.liveUpdate)
                {
                  var hex = active.get_Hex();
                  colorBox.css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
                  setAlpha(colorAlpha, 100 - active.get_A());
                  if (window.bindToInput)
                    window.input.val(active.get_Rgba() || '').css(
                      {
                        backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent',
                        color: active.get_V() > 75 ? '#000000' : '#ffffff'
                      });
                }
                $.isFunction($this.liveCallback) && $this.liveCallback(active);
              },
            positionMapAndBarArrows = // position map and bar arrows to match current color
              function()
              {
                color.active = colorPicker.color;
                var sliderValue = 0,
                  active = color.active; // local copy for YUI compressor
                switch ($this.settings.color.mode)
                {
                  case 'h':
                    sliderValue = 360 - (active.get_H() || 0);
                    break;
                  case 's':
                    sliderValue = 100 - (active.get_S() != null ? active.get_S() : 100);
                    break;
                  case 'v':
                    sliderValue = 100 - (active.get_V() != null ? active.get_V() : 100);
                    break;
                  case 'r':
                    sliderValue = 255 - (active.get_R() || 0);
                    break;
                  case 'g':
                    sliderValue = 255 - (active.get_G() || 0);
                    break;
                  case 'b':
                    sliderValue = 255 - (active.get_B() || 0);
                    break;
                  case 'a':
                    sliderValue = 100 - (active.get_A() != null ? active.get_A() : 100);
                    break;
                }
                colorBar.set_Y(sliderValue);
                var mapX = 0, mapY = 0;
                switch ($this.settings.color.mode)
                {
                  case 'h':
                    mapX = active.get_S() != null ? active.get_S() : 100;
                    mapY = 100 - (active.get_V() != null ? active.get_V() : 100);
                    break;
                  case 's':
                    mapX = active.get_H() || 0;
                    mapY = 100 - (active.get_V() != null ? active.get_V() : 100);
                    break;
                  case 'v':
                    mapX = active.get_H() || 0;
                    mapY = 100 - (active.get_S() != null ? active.get_S() : 100);
                    break;
                  case 'r':
                    mapX = active.get_B() || 0;
                    mapY = 255 - (active.get_G() || 0);
                    break;
                  case 'g':
                    mapX = active.get_B() || 0;
                    mapY = 255 - (active.get_R() || 0);
                    break;
                  case 'b':
                    mapX = active.get_R() || 0;
                    mapY = 255 - (active.get_G() || 0);
                    break;
                  case 'a':
                    mapX = active.get_H() || 0;
                    mapY = 100 - (active.get_V() || 0);
                    break;
                }
                colorMap.set_X(mapX);
                colorMap.set_Y(mapY);
              },
            updateVisuals =
              function()
              {
                updatePreview();
                updateMapVisuals();
                updateBarVisuals();
              },
            updatePreview =
              function()
              {
                try
                {
                  var hex = colorPicker.color.get_Hex();
                  activeColor.css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
                  setAlpha(activeColor, colorPicker.color.get_A());
                }
                catch (e) { }
              },
            updateMapVisuals =
              function()
              {
                if (!color || !colorPicker) return;
                color.active = colorPicker.color;
                var active = color.active; // local copy for YUI compressor
                switch (color.mode)
                {
                  case 'h':
                    setBG(colorMapDiv, new Color({ h: active.get_H() || 0, s: 100, v: 100 }).get_Hex());
                    break;
                  case 's':
                  case 'a':
                    setAlpha(colorMapL2, 100 - (active.get_S() != null ? active.get_S() : 100));
                    break;
                  case 'v':
                    setAlpha(colorMapL1, active.get_V() != null ? active.get_V() : 100);
                    break;
                  case 'r':
                    setAlpha(colorMapL2, (active.get_R() || 0) / 255 * 100);
                    break;
                  case 'g':
                    setAlpha(colorMapL2, (active.get_G() || 0) / 255 * 100);
                    break;
                  case 'b':
                    setAlpha(colorMapL2, (active.get_B() || 0) / 255 * 100);
                    break;
                }
                setAlpha(colorMapL3, 100 - (active.get_A() != null ? active.get_A() : 100));
              },
            updateBarVisuals =
              function()
              {
                if (!color || !colorPicker) return;
                color.active = colorPicker.color;
                var active = color.active; // local copy for YUI compressor
                switch (color.mode)
                {
                  case 'h':
                    setAlpha(colorBarL5, 100 - (active.get_A() != null ? active.get_A() : 100));
                    break;
                  case 's':
                    var saturatedColor = new Color({ h: active.get_H() || 0, s: 100, v: active.get_V() != null ? active.get_V() : 100 });
                    setBG(colorBarDiv, saturatedColor.get_Hex());
                    setAlpha(colorBarL2, 100 - (active.get_V() != null ? active.get_V() : 100));
                    setAlpha(colorBarL5, 100 - (active.get_A() != null ? active.get_A() : 100));
                    break;
                  case 'v':
                    var valueColor = new Color({ h: active.get_H() || 0, s: active.get_S() != null ? active.get_S() : 100, v: 100 });
                    setBG(colorBarDiv, valueColor.get_Hex());
                    setAlpha(colorBarL5, 100 - (active.get_A() != null ? active.get_A() : 100));
                    break;
                  case 'r':
                  case 'g':
                  case 'b':
                    var hValue = 0, vValue = 0;
                    if (color.mode == 'r')
                    {
                      hValue = active.get_B() || 0;
                      vValue = active.get_G() || 0;
                    }
                    else if (color.mode == 'g')
                    {
                      hValue = active.get_B() || 0;
                      vValue = active.get_R() || 0;
                    }
                    else if (color.mode == 'b')
                    {
                      hValue = active.get_R() || 0;
                      vValue = active.get_G() || 0;
                    }
                    var middle = vValue > hValue ? hValue : vValue;
                    setAlpha(colorBarL2, hValue > vValue ? ((hValue - vValue) / (255 - vValue)) * 100 : 0);
                    setAlpha(colorBarL3, vValue > hValue ? ((vValue - hValue) / (255 - hValue)) * 100 : 0);
                    setAlpha(colorBarL4, middle / 255 * 100);
                    setAlpha(colorBarL5, 100 - (active.get_A() != null ? active.get_A() : 100));
                    break;
                  case 'a':
                    setBG(colorBarDiv, active.get_Hex() || '000000');
                    break;
                }
              },
            setBG =
              function(el, c)
              {
                el.css({ backgroundColor: c && c.length == 6 ? '#' + c : 'transparent' });
              },
            setImg =
              function(img, src)
              {
                if (isLessThanIE7 && (src.indexOf('AlphaBar.png') != -1 || src.indexOf('Bars.png') != -1 || src.indexOf('Maps.png') != -1))
                {
                  img.attr('pngSrc', src);
                  img.css({ backgroundImage: 'none', filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\', sizingMethod=\'scale\')' });
                }
                else img.css({ backgroundImage: 'url(' + src + ')' });
              },
            setImgLoc =
              function(img, y)
              {
                img.css({ top: y + 'px' });
              },
            setAlpha =
              function(obj, alpha)
              {
                obj.css({ visibility: alpha > 0 ? 'visible' : 'hidden' });
                if (alpha > 0 && alpha < 100)
                {
                  if (isLessThanIE7)
                  {
                    var src = obj.attr('pngSrc');
                    if (src != null && (src.indexOf('AlphaBar.png') != -1 || src.indexOf('Bars.png') != -1 || src.indexOf('Maps.png') != -1))
                      obj.css({ filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\', sizingMethod=\'scale\') progid:DXImageTransform.Microsoft.Alpha(opacity=' + alpha + ')' });
                    else obj.css({ opacity: alpha / 100 });
                  }
                  else obj.css({ opacity: alpha / 100 });
                }
                else if (alpha == 0 || alpha == 100)
                {
                  if (isLessThanIE7)
                  {
                    var src = obj.attr('pngSrc');
                    if (src != null && (src.indexOf('AlphaBar.png') != -1 || src.indexOf('Bars.png') != -1 || src.indexOf('Maps.png') != -1))
                      obj.css({ filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\', sizingMethod=\'scale\')' });
                    else obj.css({ opacity: '' });
                  }
                  else obj.css({ opacity: '' });
                }
              },
            revertColor = // revert color to original color when opened
              function()
              {
                colorPicker.fields.hex.val(color.current.get_Rgb() || '');
                colorPicker.setValuesFromHex();
                $.isFunction(colorPicker.valuesChanged) && colorPicker.valuesChanged(colorPicker);
              },
            radioClicked =
              function(e)
              {
                setColorMode(e.target.value);
              },
            currentClicked =
              function()
              {
                revertColor();
              },
            cancelClicked =
              function()
              {
                revertColor();
                window.expandable && $this.hide();
                $.isFunction($this.cancelCallback) && $this.cancelCallback(color.active);
              },
            commitColor = // commit the color changes
              function()
              {
                var active = color.active; // local copies for YUI compressor
                color.current = new Color({ hex: active.get_Rgba() });
                var hex = active.get_Hex();
                currentColor.css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
                setAlpha(currentColor, colorPicker.color.get_A());
                if (window.expandable)
                {
                  colorBox.css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
                  setAlpha(colorAlpha, 100 - active.get_A());
                  if (window.bindToInput)
                    window.input.val(active.get_Rgba() || '').css(
                      {
                        backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent',
                        color: active.get_V() > 75 ? '#000000' : '#ffffff'
                      });
                }
                $.isFunction($this.commitCallback) && $this.commitCallback(active);
              },
            okClicked =
              function()
              {
                commitColor();
                window.expandable && $this.hide();
              },
            colorIconClicked =
              function()
              {
                $this.show();
              },
            moveBarMouseDown =
              function(e)
              {
                var element = window.element, // local copies for YUI compressor
                  page = window.page;
                elementStartX = parseInt(container.css('left'));
                elementStartY = parseInt(container.css('top'));
                pageStartX = e.pageX;
                pageStartY = e.pageY;
                // bind events to document to move window - we will unbind these on mouseup
                $(document).bind('mousemove', documentMouseMove).bind('mouseup', documentMouseUp);
                e.stopPropagation();
                e.preventDefault(); // prevent attempted dragging of the column
                return false;
              },
            documentMouseMove =
              function(e)
              {
                container.css({ left: elementStartX - (pageStartX - e.pageX) + 'px', top: elementStartY - (pageStartY - e.pageY) + 'px' });
                e.stopPropagation();
                e.preventDefault();
                return false;
              },
            documentMouseUp =
              function(e)
              {
                $(document).unbind('mousemove', documentMouseMove).unbind('mouseup', documentMouseUp);
                e.stopPropagation();
                e.preventDefault();
                return false;
              },
            bindedHexKeyUp =
              function(e)
              {
                colorPicker.fields.hex.val($this.settings.window.input.val());
                colorPicker.bindedHexKeyUp(e);
              },
            quickPickClicked =
              function(e)
              {
                colorPicker.fields.hex.val(new Color({ hex: $(this).attr('title') }).get_Rgb() || '');
                colorPicker.setValuesFromHex();
                $.isFunction(colorPicker.valuesChanged) && colorPicker.valuesChanged(colorPicker);
              };
          $.extend(true, $this, // public properties, methods, and callbacks
            {
              id: $this.attr('id'),
              settings: $settings,
              color: null,
              icon: null,
              commitCallback: $.isFunction($arguments[1]) && $arguments[1] || null, // commitCallback function can be overridden to return the selected color to a method you specify when the user clicks "OK"
              liveCallback: $.isFunction($arguments[2]) && $arguments[2] || null, // liveCallback function can be overridden to return the selected color to a method you specify in live mode (continuous update)
              cancelCallback: $.isFunction($arguments[3]) && $arguments[3] || null, // cancelCallback function can be overridden to a method you specify when the user clicks "Cancel"
              show:
                function()
                {
                  if (document.all) // In IE, due to calculated z-index values, we need to hide all color picker icons that appear later in the source code than this one
                  {
                    var foundthis = false;
                    for (i = 0; i < List.length; i++)
                    {
                      if (foundthis) List[i].color.add(List[i].icon).css({ display: 'none' });
                      if (List[i].id == $this.id) foundthis = true;
                    }
                  }
                  color.current = new Color({ hex: color.active.get_Rgba() });
                  var hex = color.active.get_Hex();
                  currentColor.css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
                  setAlpha(currentColor, color.active.get_A());
                  container.css({ display: 'block' });
                  positionMapAndBarArrows();
                },
              hide:
                function()
                {
                  if (document.all) // In IE, show the previously hidden color picker icons again
                  {
                    var foundthis = false;
                    for (i = 0; i < List.length; i++)
                    {
                      if (foundthis) List[i].color.add(List[i].icon).css({ display: 'block' });
                      if (List[i].id == $this.id) foundthis = true;
                    }
                  }
                  container.css({ display: 'none' });
                },
              destroy: // destroys this control entirely, removing all events and objects, and removing itself from the List
                function()
                {
                  if (window.expandable) colorIcon = container.find('.jPicker_Icon').eq(0).unbind('click', colorIconClicked);
                  if (window.bindToInput) window.input.unbind('keyup', bindedHexKeyUp).unbind('change', bindedHexKeyUp);
                  hue.add(saturation).add(value).add(red).add(green).add(blue).unbind('click', radioClicked);
                  currentColor.unbind('click', currentClicked);
                  cancelButton.unbind('click', cancelClicked);
                  okButton.unbind('click', okClicked);
                  if (window.expandable) moveBar.unbind('mousedown', moveBarMouseDown);
                  container.find('.jPicker_QuickColor').eq(0).unbind('click', quickPickClicked);
                  hue = null;
                  saturation = null;
                  value = null;
                  red = null;
                  green = null;
                  blue = null;
                  alpha = null;
                  colorMapDiv = null;
                  colorBarDiv = null;
                  colorMapL1 = null;
                  colorMapL2 = null;
                  colorMapL3 = null;
                  colorBarL1 = null;
                  colorBarL2 = null;
                  colorBarL3 = null;
                  colorBarL4 = null;
                  colorBarL5 = null;
                  colorBarL6 = null;
                  currentActiveBG = null;
                  activeColor = null;
                  currentColor = null;
                  okButton = null;
                  cancelButton = null;
                  grid = null;
                  $this.color = null;
                  $this.icon = null;
                  colorMap.destroy();
                  colorMap = null;
                  colorBar.destroy();
                  colorBar = null;
                  colorPicker.destroy();
                  colorPicker = null;
                  $this.commitCallback = null;
                  $this.cancelCallback = null;
                  $this.liveCallback = null;
                  container.html('');
                  for (i = 0; i < List.length; i++) if (List[i].id == $this.id) List.splice(i, 1);
                }
            });
          var images = $this.settings.images, // local copies for YUI compressor
            window = $this.settings.window,
            localization = $this.settings.localization,
            color = $this.settings.color;
          container = window.expandable ? $this.next().find('.jPicker_Container').eq(0) : $this;
          if (window.expandable)
            container.css( // positions must be set and display set to absolute before source code injection or IE will size the container to fit the window
              {
                left: window.position.x == 'left' ? '-526px' : window.position.x == 'center' ? '-259px' : window.position.x == 'right' ? '0px' : window.position.x == 'screenCenter' ?
                  (($(document).width() >> 1) - 259) - $this.next().offset().left + 'px' : window.position.x,
                position: 'absolute',
                top: window.position.y == 'top' ? '-350px' : window.position.y == 'center' ? '-158px' : window.position.y == 'bottom' ? '25px' : window.position.y
              });
          // if default colors are hex strings, change them to color objects
          if ((typeof (color.active)).toString().toLowerCase() == 'string') color.active = new Color({ hex: color.active });
          // inject html source code - we are using a single table for this control - I know tables are considered bad, but it takes care of equal height columns and
          // this control really is tabular data, so I believe it is the right move
          container.html('<table class="jPicker_table"><tbody>' + (window.expandable ? '<tr><td class="jPicker_MoveBar" colspan="6">&nbsp;</td></tr>' : '') + '<tr><td rowspan="9"><h2 class="jPicker_Title">' + (window.title || localization.text.title) + '</h2><div class="jPicker_ColorMap"><span class="jPicker_ColorMap_l1">&nbsp;</span><span class="jPicker_ColorMap_l2">&nbsp;</span><span class="jPicker_ColorMap_l3">&nbsp;</span><img src="' + images.clientPath + images.colorMap.arrow.file + '" class="jPicker_ColorMap_Arrow"/></div></td><td rowspan="9"><div class="jPicker_ColorBar"><span class="jPicker_ColorBar_l1">&nbsp;</span><span class="jPicker_ColorBar_l2">&nbsp;</span><span class="jPicker_ColorBar_l3">&nbsp;</span><span class="jPicker_ColorBar_l4">&nbsp;</span><span class="jPicker_ColorBar_l5">&nbsp;</span><span class="jPicker_ColorBar_l6">&nbsp;</span><img src="' + images.clientPath + images.colorBar.arrow.file + '" class="jPicker_ColorBar_Arrow"/></div></td><td colspan="3" class="jPicker_Preview">' + localization.text.newColor + '<div class="jPicker_NewCurrent"><span class="jPicker_Active" title="' + localization.tooltips.colors.newColor + '">&nbsp;</span><span class="jPicker_Current" title="' + localization.tooltips.colors.currentColor + '">&nbsp;</span></div>' + localization.text.currentColor + '</td><td rowspan="9" class="jPicker_OkCancel"><input type="button" class="jPicker_Ok" value="' + localization.text.ok + '" title="' + localization.tooltips.buttons.ok + '"/><input type="button" class="jPicker_Cancel" value="' + localization.text.cancel + '" title="' + localization.tooltips.buttons.cancel + '"/><hr/><div class="jPicker_Grid">&nbsp;</div></td></tr><tr><td><input type="radio" class="jPicker_HueRadio" id="jPicker_Hue_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="h" title="' + localization.tooltips.hue.radio + '"/></td><td><label for="jPicker_Hue_'+List.length+'" title="' + localization.tooltips.hue.radio + '">H:</label></td><td class="jPicker_Text"><input type="text" class="jPicker_HueText" value="' + color.active.get_H() + '" title="' + localization.tooltips.hue.textbox + '"/> &deg;</td></tr><tr><td><input type="radio" class="jPicker_SaturationRadio" id="jPicker_Saturation_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="s" title="' + localization.tooltips.saturation.radio + '"/></td><td><label for="jPicker_Saturation_'+List.length+'" title="' + localization.tooltips.saturation.radio + '">S:</label></td><td class="jPicker_Text"><input type="text" class="jPicker_SaturationText" value="' + color.active.get_S() + '" title="' + localization.tooltips.saturation.textbox + '"/> %</td></tr><tr><td><input type="radio" class="jPicker_BrightnessRadio" id="jPicker_Brightness_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="v" title="' + localization.tooltips.brightness.radio + '"/><br/><br/></td><td><label for="jPicker_Brightness_'+List.length+'" title="' + localization.tooltips.brightness.radio + '">B:</label></td><td class="jPicker_Text"><input type="text" class="jPicker_BrightnessText" value="' + color.active.get_V() + '" title="' + localization.tooltips.brightness.textbox + '"/> %</td></tr><tr><td><input type="radio" class="jPicker_RedRadio" id="jPicker_Red_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="r" title="' + localization.tooltips.red.radio + '"/></td><td><label for="jPicker_Red_'+List.length+'" title="' + localization.tooltips.red.radio + '">R:</label></td><td class="jPicker_Text"><input type="text" class="jPicker_RedText" value="' + color.active.get_R() + '" title="' + localization.tooltips.red.textbox + '"/></td></tr><tr><td><input type="radio" class="jPicker_GreenRadio" id="jPicker_Green_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="g" title="' + localization.tooltips.green.radio + '"/></td><td><label for="jPicker_Green_'+List.length+'" title="' + localization.tooltips.green.radio + '">G:</label></td><td class="jPicker_Text"><input type="text" class="jPicker_GreenText" value="' + color.active.get_G() + '" title="' + localization.tooltips.green.textbox + '"/></td></tr><tr><td><input type="radio" class="jPicker_BlueRadio" id="jPicker_Blue_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="b" title="' + localization.tooltips.blue.radio + '"/></td><td><label for="jPicker_Blue_'+List.length+'" title="' + localization.tooltips.blue.radio + '">B:</label></td><td class="jPicker_Text"><input type="text" class="jPicker_BlueText" value="' + color.active.get_B() + '" title="' + localization.tooltips.blue.textbox + '"/></td></tr><tr style="visibility: hidden"><td><input type="radio" class="jPicker_AlphaRadio" id="jPicker_Alpha_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="a" title="' + localization.tooltips.alpha.radio + '"/></td><td><label for="jPicker_Alpha_'+List.length+'" title="' + localization.tooltips.alpha.radio + '">A:</label></td><td class="jPicker_Text"><input type="text" class="jPicker_AlphaText" value="' + color.active.get_A() + '" title="' + localization.tooltips.alpha.textbox + '"/> %</td></tr><tr><td class="jPicker_HexCol"><label for="jPicker_Hex_'+List.length+'" title="' + localization.tooltips.hex.textbox + '">#:</label></td><td class="jPicker_EnterHex" colspan="2"><input type="text" class="jPicker_HexText" id="jPicker_Hex_'+List.length+'" value="' + color.active.get_Rgb() + '" title="' + localization.tooltips.hex.textbox + '"/></td></tr></tbody></table>');
          // initialize the objects to the source code just injected
          hue = container.find('.jPicker_HueRadio').eq(0);
          saturation = container.find('.jPicker_SaturationRadio').eq(0);
          value = container.find('.jPicker_BrightnessRadio').eq(0);
          red = container.find('.jPicker_RedRadio').eq(0);
          green = container.find('.jPicker_GreenRadio').eq(0);
          blue = container.find('.jPicker_BlueRadio').eq(0);
          alpha = container.find('.jPicker_AlphaRadio').eq(0);
          colorMapDiv = container.find('.jPicker_ColorMap').eq(0);
          colorBarDiv = container.find('.jPicker_ColorBar').eq(0);
          colorMapL1 = container.find('.jPicker_ColorMap_l1').eq(0);
          colorMapL2 = container.find('.jPicker_ColorMap_l2').eq(0);
          colorMapL3 = container.find('.jPicker_ColorMap_l3').eq(0);
          colorBarL1 = container.find('.jPicker_ColorBar_l1').eq(0);
          colorBarL2 = container.find('.jPicker_ColorBar_l2').eq(0);
          colorBarL3 = container.find('.jPicker_ColorBar_l3').eq(0);
          colorBarL4 = container.find('.jPicker_ColorBar_l4').eq(0);
          colorBarL5 = container.find('.jPicker_ColorBar_l5').eq(0);
          colorBarL6 = container.find('.jPicker_ColorBar_l6').eq(0);
          currentActiveBG = container.find('.jPicker_NewCurrent').eq(0);
          var hex = color.active.get_Hex();
          activeColor = container.find('.jPicker_Active').eq(0).css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
          currentColor = container.find('.jPicker_Current').eq(0).css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
          okButton = container.find('.jPicker_Ok').eq(0);
          cancelButton = container.find('.jPicker_Cancel').eq(0);
          grid = container.find('.jPicker_Grid').eq(0);
          $this.color = $('.Picker_Color').eq(0);
          $this.icon = $('.jPicker_Icon').eq(0);
          // create color pickers and maps
          colorPicker = new ColorValuePicker(container, textValuesChanged);
          colorMap = new Slider(container.find('.jPicker_ColorMap').eq(0),
            {
              map:
              {
                width: images.colorMap.width,
                height: images.colorMap.height
              },
              arrow:
              {
                image: images.clientPath + images.colorMap.arrow.file,
                width: images.colorMap.arrow.width,
                height: images.colorMap.arrow.height
              }
            },
            mapValueChanged);
          colorBar = new Slider(container.find('.jPicker_ColorBar').eq(0),
            {
              map:
              {
                width: images.colorBar.width,
                height: images.colorBar.height
              },
              arrow:
              {
                image: images.clientPath + images.colorBar.arrow.file,
                width: images.colorBar.arrow.width,
                height: images.colorBar.arrow.height
              }
            },
            colorBarValueChanged);
          setImg(colorMapL1, images.clientPath + 'Maps.png');
          setImg(colorMapL2, images.clientPath + 'Maps.png');
          setImg(colorMapL3, images.clientPath + 'map-opacity.png');
          setImg(colorBarL1, images.clientPath + 'Bars.png');
          setImg(colorBarL2, images.clientPath + 'Bars.png');
          setImg(colorBarL3, images.clientPath + 'Bars.png');
          setImg(colorBarL4, images.clientPath + 'Bars.png');
          setImg(colorBarL5, images.clientPath + 'bar-opacity.png');
          setImg(colorBarL6, images.clientPath + 'AlphaBar.png');
          setImg(currentActiveBG, images.clientPath + 'preview-opacity.png');
          // bind to input
          if (window.expandable)
          {
            colorBox = $this.next().find('.jPicker_Color').eq(0).css({ backgroundColor: hex && hex.length == 6 ? '#' + hex : 'transparent' });
            colorAlpha = $this.next().find('.jPicker_Alpha').eq(0);
            setImg(colorAlpha, images.clientPath + 'bar-opacity.png');
            setAlpha(colorAlpha, 100 - color.active.get_A());
            colorIcon = $this.next().find('.jPicker_Icon').eq(0).css(
              {
                backgroundImage: 'url(' + images.clientPath + images.picker.file + ')'
              }).bind('click', colorIconClicked);
            if (window.bindToInput) window.input.bind('keyup', bindedHexKeyUp).bind('change', bindedHexKeyUp);
          }
          hue.add(saturation).add(value).add(red).add(green).add(blue).add(alpha).bind('click', radioClicked);
          currentColor.bind('click', currentClicked);
          cancelButton.bind('click', cancelClicked);
          okButton.bind('click', okClicked);
          if (window.expandable) moveBar = container.find('.jPicker_MoveBar').eq(0).bind('mousedown', moveBarMouseDown);
          // initialize quick list
          if (color.quickList && color.quickList.length > 0)
          {
            grid.html('');
            for (i = 0; i < color.quickList.length; i++)
            {
              /* if default colors are hex strings, change them to color objects */
              if ((typeof (color.quickList[i])).toString().toLowerCase() == 'string') color.quickList[i] = new Color({ hex: color.quickList[i] });
              var rgba = color.quickList[i].get_Rgba();
              grid.append('<span class="jPicker_QuickColor" title="' + (rgba && '#' + rgba || '') + '">&nbsp;</span>');
              var quickHex = color.quickList[i].get_Hex();
              container.find('.jPicker_QuickColor').eq(i).css({ backgroundColor: quickHex && quickHex.length == 6 ? '#' + quickHex : 'transparent', backgroundImage: quickHex ? 'none' : 'url(' + images.clientPath + 'NoColor.png)' }).click(quickPickClicked);
            }
          }
          setColorMode(color.mode);
          colorPicker.fields.hex.val(color.active.get_Rgb() || '');
          colorPicker.setValuesFromHex();
          positionMapAndBarArrows();
          updateVisuals();
          if (!window.expandable) $this.show();
          List.push($this);
        });
    };
  $.fn.jPicker.defaults = /* jPicker defaults - you can change anything in this section (such as the clientPath to your images) without fear of breaking the program */
      {
      window:
        {
          title: null, /* any title for the jPicker window itself - displays "Drag Markers To Pick A Color" if left null */
          position:
          {
            x: 'screenCenter', /* acceptable values "left", "center", "right", "screenCenter", or relative px value */
            y: 'top' /* acceptable values "top", "bottom", "center", or relative px value */
          },
          expandable: false, /* default to large static picker - set to true to make an expandable picker (small icon with popup) - set automatically when binded to input element */
          liveUpdate: true /* set false if you want the user to have to click "OK" before the binded input box updates values */
        },
      color:
        {
          mode: 'h', /* acceptabled values "h" (hue), "s" (saturation), "v" (brightness), "r" (red), "g" (green), "b" (blue), "a" (alpha) */
          active: new Color({ hex: '#ffcc00' }), /* acceptable values are any declared $.jPicker.Color object or string HEX value (e.g. #ffc000) WITH OR WITHOUT the "#" prefix */
          quickList: /* the quick pick color list */
            [
              new Color({ h: 360, s: 33, v: 100 }), /* acceptable values are any declared $.jPicker.Color object or string HEX value (e.g. #ffc000) WITH OR WITHOUT the "#" prefix */
              new Color({ h: 360, s: 66, v: 100 }),
              new Color({ h: 360, s: 100, v: 100 }),
              new Color({ h: 360, s: 100, v: 75 }),
              new Color({ h: 360, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 100 }),
              new Color({ h: 30, s: 33, v: 100 }),
              new Color({ h: 30, s: 66, v: 100 }),
              new Color({ h: 30, s: 100, v: 100 }),
              new Color({ h: 30, s: 100, v: 75 }),
              new Color({ h: 30, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 90 }),
              new Color({ h: 60, s: 33, v: 100 }),
              new Color({ h: 60, s: 66, v: 100 }),
              new Color({ h: 60, s: 100, v: 100 }),
              new Color({ h: 60, s: 100, v: 75 }),
              new Color({ h: 60, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 80 }),
              new Color({ h: 90, s: 33, v: 100 }),
              new Color({ h: 90, s: 66, v: 100 }),
              new Color({ h: 90, s: 100, v: 100 }),
              new Color({ h: 90, s: 100, v: 75 }),
              new Color({ h: 90, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 70 }),
              new Color({ h: 120, s: 33, v: 100 }),
              new Color({ h: 120, s: 66, v: 100 }),
              new Color({ h: 120, s: 100, v: 100 }),
              new Color({ h: 120, s: 100, v: 75 }),
              new Color({ h: 120, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 60 }),
              new Color({ h: 150, s: 33, v: 100 }),
              new Color({ h: 150, s: 66, v: 100 }),
              new Color({ h: 150, s: 100, v: 100 }),
              new Color({ h: 150, s: 100, v: 75 }),
              new Color({ h: 150, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 50 }),
              new Color({ h: 180, s: 33, v: 100 }),
              new Color({ h: 180, s: 66, v: 100 }),
              new Color({ h: 180, s: 100, v: 100 }),
              new Color({ h: 180, s: 100, v: 75 }),
              new Color({ h: 180, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 40 }),
              new Color({ h: 210, s: 33, v: 100 }),
              new Color({ h: 210, s: 66, v: 100 }),
              new Color({ h: 210, s: 100, v: 100 }),
              new Color({ h: 210, s: 100, v: 75 }),
              new Color({ h: 210, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 30 }),
              new Color({ h: 240, s: 33, v: 100 }),
              new Color({ h: 240, s: 66, v: 100 }),
              new Color({ h: 240, s: 100, v: 100 }),
              new Color({ h: 240, s: 100, v: 75 }),
              new Color({ h: 240, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 20 }),
              new Color({ h: 270, s: 33, v: 100 }),
              new Color({ h: 270, s: 66, v: 100 }),
              new Color({ h: 270, s: 100, v: 100 }),
              new Color({ h: 270, s: 100, v: 75 }),
              new Color({ h: 270, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 10 }),
              new Color({ h: 300, s: 33, v: 100 }),
              new Color({ h: 300, s: 66, v: 100 }),
              new Color({ h: 300, s: 100, v: 100 }),
              new Color({ h: 300, s: 100, v: 75 }),
              new Color({ h: 300, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 0 }),
              new Color({ h: 330, s: 33, v: 100 }),
              new Color({ h: 330, s: 66, v: 100 }),
              new Color({ h: 330, s: 100, v: 100 }),
              new Color({ h: 330, s: 100, v: 75 }),
              new Color({ h: 330, s: 100, v: 50 }),
              new Color()
            ]
        },
      images:
        {
          clientPath: '/jPicker/images/', /* Path to image files */
          colorMap:
          {
            width: 256,
            height: 256,
            arrow:
            {
              file: 'mappoint.gif', /* ColorMap arrow icon */
              width: 15,
              height: 15
            }
          },
          colorBar:
          {
            width: 20,
            height: 256,
            arrow:
            {
              file: 'rangearrows.gif', /* ColorBar arrow icon */
              width: 20,
              height: 7
            }
          },
          picker:
          {
            file: 'picker.gif', /* Color Picker icon */
            width: 25,
            height: 24
          }
        },
      localization:
        {
          text:
          {
            title: 'Drag Markers To Pick A Color',
            newColor: 'new',
            currentColor: 'current',
            ok: 'Accept',
            cancel: 'Storno'
          },
          tooltips:
          {
            colors:
            {
              newColor: 'New Color - Press &ldquo;OK&rdquo; To Commit',
              currentColor: 'Click To Revert To Original Color'
            },
            buttons:
            {
              ok: 'Commit To This Color Selection',
              cancel: 'Cancel And Revert To Original Color'
            },
            hue:
            {
              radio: 'Set To &ldquo;Hue&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Hue&rdquo; Value (0-360&deg;)'
            },
            saturation:
            {
              radio: 'Set To &ldquo;Saturation&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Saturation&rdquo; Value (0-100%)'
            },
            brightness:
            {
              radio: 'Set To &ldquo;Brightness&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Brightness&rdquo; Value (0-100%)'
            },
            red:
            {
              radio: 'Set To &ldquo;Red&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Red&rdquo; Value (0-255)'
            },
            green:
            {
              radio: 'Set To &ldquo;Green&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Green&rdquo; Value (0-255)'
            },
            blue:
            {
              radio: 'Set To &ldquo;Blue&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Blue&rdquo; Value (0-255)'
            },
            alpha:
            {
              radio: 'Set To &ldquo;Alpha&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Alpha&rdquo; Value (0-100)'
            },
            hex:
            {
              textbox: 'Enter A &ldquo;Hex&rdquo; Color Value (#000000-#ffffff)'
            }
          }
        }
    };
})(jQuery, '1.0.13');
