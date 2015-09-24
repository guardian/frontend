@()

/*
bypass normal browser font-loading to avoid the FOIT. works like this:

do you have fonts in localStorage?
    yes – inject them (minimises 2nd layout as fonts are loaded before DOM is created)
    no  – did the localStorage check go ok?
        yes – ajax them in as JSON immediately, inject them and save them to localStorage
        no  – load font files async using @@font-face

*/

(function (window, document) {
    var ua = navigator.userAgent;

    // Determine what type of font-hinting we want.
    var fontHinting = (function () {
        var hinting = 'Off',
            windowsNT = /Windows NT (\d\.\d+)/.exec(ua),
            version;
        try { // belt and braces
            if (windowsNT) {
                version = parseFloat(windowsNT[1], 10);

                // For Windows XP-7
                if (version >= 5.1 && version <= 6.1) {
                    if (/Chrome/.exec(ua) && version < 6.0) {
                        // Chrome on windows XP wants auto-hinting
                        hinting = 'Auto';
                    } else {
                        // All others use cleartype
                        hinting = 'Cleartype';
                    }
                }
            }
        } catch (e) {
            @if(play.Play.isDev){throw(e)}
        }
        return hinting;
    })();

    // Load fonts from `localStorage`.
    function loadFontsFromStorage() {
        try { // localStorage can fail for many reasons
            if ("localStorage" in window) {
                // detect which font format (ttf, woff, woff2 etc) we want
                var fontFormat = (function () {
                    var formatStorageKey = 'gu.fonts.format',
                        format = localStorage.getItem(formatStorageKey);

                    function supportsWoff2() {
                        // try feature detecting first
                        // https://github.com/filamentgroup/woff2-feature-test
                        if ("FontFace" in window) {
                            var f = new window.FontFace('t', 'url("data:application/font-woff2,") format("woff2")', {});
                            f.load().catch(function(){});
                            if (f.status === 'loading') {
                                return true;
                            }
                        }

                        // some browsers (e.g. FF40) support WOFF2 but not window.FontFace,
                        // so fall back to known support
                        if (!/edge\/([0-9]+)/.test(ua)) { // don't let edge tell you it's chrome when it's not
                            var browser = /(chrome|firefox)\/([0-9]+)/.exec(ua.toLowerCase()),
                                supportsWoff2 = {
                                    'chrome': 36,
                                    'firefox': 39
                                };
                            return !!browser && supportsWoff2[browser[1]] < parseInt(browser[2], 10);
                        }

                        return false;
                    }

                    // flush out weird old json value
                    // no value to it and JSON.parse is pointless overhead
                    if (/value/.test(format)) {
                        format = JSON.parse(format).value;
                        localStorage.setItem(formatStorageKey, format);
                    }

                    if (!format) {
                        format = supportsWoff2() ? 'woff2' : ua.indexOf('android') > -1 ? 'ttf' : 'woff';
                        localStorage.setItem(formatStorageKey, format);
                    }

                    return format;
                })();

                // use whatever font CSS we've now got
                function useFont(el, css) {
                    el.innerHTML = css;
                }

                // hangover from previous version
                function guFont(fontData) {
                    return fontData.css;
                }

                // download font as json to store/use etc
                function fetchFont(url, el, fontName, fontHash) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var css = eval(xhr.responseText);
                            useFont(el, css);
                            saveFont(fontName, fontHash, css);
                        }
                    };
                    xhr.send();
                }

                // save font css to localstorage
                function saveFont(fontName, fontHash, css) {
                    for (var i = 0, totalItems = localStorage.length; i < totalItems - 1; i++) {
                        var key = localStorage.key(i);
                        if (key.indexOf('gu.fonts.' + fontName + '.') !== -1) {
                            localStorage.removeItem(key);
                            break;
                        }
                    }
                    localStorage.setItem(storageKey(fontName, fontHash), JSON.stringify({value: css}));
                }

                // generic method to construct a storage key
                function storageKey(fontName, fontHash) {
                    return 'gu.fonts.' + fontName + '.' + fontHash;
                }

                // down to business
                // the target for each font and holders of all the necessary metadata
                // are some style elements in the head, all identified by a .webfont class
                var fonts = document.querySelectorAll('.webfont'),
                    hinting = fontHinting === 'Off' ? '' : 'hinted-' + fontHinting + '-',
                    urlAttribute = 'data-cache-file-' + hinting + fontFormat;
                for (var i = 0, j = fonts.length; i < j; ++i) {
                    var font = fonts[i],
                        fontURL = font.getAttribute(urlAttribute),
                        fontInfo = fontURL.match(/fonts\/([^/]*?)\/?([^/]*)\.(woff2|woff|ttf).json$/),
                        fontName = fontInfo[2],
                        fontHash = fontInfo[1],
                        fontData = localStorage.getItem(storageKey(fontName, fontHash));

                    if (fontData) {
                        useFont(font, JSON.parse(fontData).value);
                    } else {
                        fetchFont(fontURL, font, fontName, fontHash);
                    }
                }
                return true;
            }
        } catch (e) {
            @if(play.Play.isDev){throw(e)}
        }
        return false;
    }

    // Load fonts by injecting a `link` element.
    function loadFontsAsynchronously() {
        try {
            var scripts = document.getElementsByTagName('script'),
                thisScript = scripts[scripts.length - 1],
                fonts = document.createElement('link');

            fonts.rel = 'stylesheet';
            fonts.className = 'webfonts';

            // show cleartype-hinted for Windows XP-7 IE, autohinted for non-IE
            fonts.href = window.guardian.config.stylesheets.fonts['hinting' + fontHinting].kerningOn;
            window.setTimeout(function () {
                thisScript.parentNode.insertBefore(fonts, thisScript);
            });
        } catch (e) {
            @if(play.Play.isDev){throw(e)}
        }
    }

    // Detect whether browser is smoothing its fonts.
    // Technique adapted from @@zoltandulac's clever hack:
    // http://www.useragentman.com/blog/2009/11/29/how-to-detect-font-smoothing-using-javascript
    //
    // Because IE always uses clear-type (unless you've done some *major* hackery
    // http://stackoverflow.com/questions/5427315/disable-cleartype-text-anti-aliasing-in-ie9#tab-top),
    // we only test non-IE, and only on Windows. Everyone else we assume `true`.
    function fontSmoothingEnabled() {
        try {
            var canvasNode, ctx, alpha, x, y;

            // If we've already run this test, return the result.
            // This can be force-overidden using a '#check-smoothing' hash fragment.
            if (document.cookie.indexOf('GU_fonts_smoothing') !== -1 && window.location.hash !== '#check-smoothing') {
                return document.cookie.indexOf('GU_fonts_smoothing=on') !== -1;
            }

            // Internal function to store font-smoothing state for 30 days
            function saveFontSmoothing(state) {
                state = state ? 'on' : 'off';
                document.cookie = 'GU_fonts_smoothing= ' + state + '; domain=' + location.hostname + '; path=/; max-age=' + (60 * 60 * 24 * 30);
            }

            // If Windows desktop and not IE…
            if (/Windows NT (\d\.\d+)/.exec(ua) && !/MSIE|Trident/.exec(ua)) {
                try {
                    // Create a 35x35 Canvas block.
                    canvasNode = document.createElement('canvas');
                    canvasNode.width = '35';
                    canvasNode.height = '35';
                    canvasNode.style.display = 'none';
                    document.documentElement.appendChild(canvasNode);

                    // Draw a black '@@', in 32px Arial, onto it.
                    ctx = canvasNode.getContext('2d');
                    ctx.textBaseline = 'top';
                    ctx.font = '32px Arial';
                    ctx.fillStyle = 'black';
                    ctx.strokeStyle = 'black';
                    ctx.fillText('@@', 0, 0);

                    // Search the top left-hand corner of the canvas from left to
                    // right, top to bottom, until we find a non-black pixel (most
                    // likely). If so we return true.

                    // - no point in searching the whole thing, so keep it as short
                    // as possible.
                    for (x = 0; x <= 16; x++) {
                        for (y = 0; y <= 16; y++) {
                            alpha = ctx.getImageData(x, y, 1, 1).data[3];

                            if (alpha > 0 && alpha < 255) {
                                // font-smoothing must be on
                                // save this info for 30 days
                                saveFontSmoothing(true);
                                return true;
                            }
                        }
                    }
                } catch (e) {
                    @if(play.Play.isDev){throw(e)}
                }
                // Didn't find any non-black pixels or something went wrong (for example,
                // non-blink Opera cannot use the canvas fillText() method) so we assume
                // false for safety's sake.
                saveFontSmoothing(false);
                return false;
            } else {
                // You're not on Windows or you're using IE, so we assume true
                return true;
            }
        } catch (e) {
            @if(play.Play.isDev){throw(e)}
        }
    }

    // Check to see if you should get webfonts, and then try to load them from localStorage if so
    var cookieData = 'GU_fonts=off; domain=' + location.hostname + '; path=/';

    function disableFonts() {
        document.cookie = cookieData + '; max-age=' + (60 * 60 * 24 * 365);
    }

    function enableFonts() {
        document.cookie = cookieData + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    function fontsEnabled() {
        return document.cookie.indexOf('GU_fonts=off') === -1;
    }

    // Make it possible to toggle fonts with `#fonts-off/on`.
    function checkUserFontDisabling() {
        if (window.location.hash === '#fonts-off') {
            disableFonts();
        } else if (window.location.hash === '#fonts-on' || window.location.hash === '#check-smoothing') {
            enableFonts();
        }
    }

    // Finally, if we're meant to use fonts, check they'll render ok
    // and then try and load them from storage. If that fails (i.e. likely lack of
    // support), inject a standard stylesheet `link` to load them.
    // If they won't render properly (no smoothing), disable them entirely.
    function loadFonts() {
        checkUserFontDisabling();
        if (fontsEnabled()) {
            if (fontSmoothingEnabled()) {
                loadFontsFromStorage() || loadFontsAsynchronously();
            } else {
                disableFonts();
            }
        }
    }

    loadFonts();
})(window, document);
