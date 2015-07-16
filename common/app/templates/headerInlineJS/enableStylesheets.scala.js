@()(implicit request: RequestHeader)

@* It's faster to pass arguments in setTimeout than to use an anon function, but IE <10 can't do that. *@
// Polyfill setTimeout args: https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers.setTimeout.
/* @@cc_on
@@if (@@_jscript_version <= 6)
(function (f) {window.setTimeout = f(window.setTimeout)})(function (f) {
    return function (c, t) {
        var a = [].slice.call(arguments, 2);
        return f(function () {
                c.apply(this, a)
            }, t);
        }
    }
);
@@end
@@*/

// CSS is already loading, tell the browser to use it.
// Borrows heavily from https://github.com/filamentgroup/loadCSS.
(function (styleSheetLinks, documentStyleSheets) {

    // Check the stylesheet has downloaded, then set media to `screen`. If not, go again.
    @if(mvt.LoadCSSRafTest.isParticipating) {
        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
        // MIT license
        (function () {
            var lastTime = 0;
            var vendors = ['moz', 'webkit'];
            for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame)
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                      timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

            if (!window.cancelAnimationFrame)
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
        }());
        function setMedia (styleSheet) {
            for (var i = 0, totalSheets = documentStyleSheets.length; i < totalSheets ; i++) {
                var sheet = documentStyleSheets[i];
                if (sheet.href && sheet.href.indexOf(styleSheet.href) > -1) {
                    styleSheet.media = "screen";
                    return true;
                }
            }
            requestAnimationFrame(function () {
                setMedia(styleSheet);
            });
        }
    } else {
        function setMedia (styleSheet) {
            for (var i = 0, totalSheets = documentStyleSheets.length; i < totalSheets ; i++) {
                var sheet = documentStyleSheets[i];
                if (sheet.href && sheet.href.indexOf(styleSheet.href) > -1) {
                    styleSheet.media = "screen";
                    return true;
                }
            }
            setTimeout(setMedia, null, styleSheet);
        }
    }

    // Watch for load on all `link` elements with media of `only x`
    function useCss () {
        for (var i = 0, totalStyleSheetLinks = styleSheetLinks.length; i < totalStyleSheetLinks ; i++) {
            if (styleSheetLinks[i].getAttribute('media') === 'only x') {
                setMedia(styleSheetLinks[i]);
            }
        }
    }

    // GO!
    useCss();
})(document.getElementsByTagName('link'), window.document.styleSheets)

