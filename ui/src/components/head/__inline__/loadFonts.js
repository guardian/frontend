// @flow

/*
bypass normal browser font-loading to avoid the FOIT. works like this:

do you have fonts in localStorage?
    yes – inject them (minimises 2nd layout as fonts are loaded before DOM is created)
    no  – did the localStorage check go ok?
        yes – ajax them in as JSON immediately, inject them and save them to localStorage
        no  – load font files async using @@font-face
*/

((document: Document, window: any): void => {
    const ua = navigator.userAgent;

    // Determine what type of font-hinting we want.
    const fontHinting = ((): string => {
        const windowsNT = /Windows NT (\d\.\d+)/.exec(ua);
        let hinting = 'Off';

        // belt and braces
        try {
            if (windowsNT) {
                const version = parseFloat(windowsNT[1]);

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
            // do nothing
        }

        return hinting;
    })();

    // Load fonts from `localStorage`.
    const loadFontsFromStorage = (): boolean => {
        // localStorage can fail for many reasons
        try {
            if ('localStorage' in window) {
                const fontStorageKey = (
                    fontName: string,
                    fontHash: string = ''
                ): string => `gu.fonts.${fontName}.${fontHash}`;

                // detect which font format (ttf, woff, woff2 etc) we want
                const fontFormat = ((): string => {
                    const formatStorageKey = 'gu.fonts.format';

                    let format = localStorage.getItem(formatStorageKey);

                    const supportsWoff2 = () => {
                        // try feature detecting first
                        // https://github.com/filamentgroup/woff2-feature-test
                        if ('FontFace' in window) {
                            try {
                                const f = new window.FontFace(
                                    't',
                                    'url("data:application/font-woff2,") format("woff2")',
                                    {}
                                );

                                f.load().catch(() => {});
                                if (f.status === 'loading') {
                                    return true;
                                }
                            } catch (e) {
                                // do nothing
                            }
                        }

                        // some browsers (e.g. FF40) support WOFF2 but not window.FontFace,
                        // so fall back to known support
                        if (!/edge\/([0-9]+)/.test(ua.toLowerCase())) {
                            // don't let edge tell you it's chrome when it's not
                            const browser = /(chrome|firefox)\/([0-9]+)/.exec(
                                ua.toLowerCase()
                            );
                            const woff2Browsers = {
                                chrome: 36,
                                firefox: 39,
                            };
                            return (
                                !!browser &&
                                woff2Browsers[browser[1]] <
                                    parseInt(browser[2], 10)
                            );
                        }

                        return false;
                    };

                    // flush out weird old json value
                    // no value to it and JSON.parse is pointless overhead
                    if (format && /value/.test(format)) {
                        format = JSON.parse(format).value;
                        localStorage.setItem(formatStorageKey, format);
                    }

                    if (!format) {
                        if (supportsWoff2()) {
                            format = 'woff2';
                        } else if (ua.indexOf('android') > -1) {
                            format = 'ttf';
                        } else {
                            format = 'woff';
                        }

                        localStorage.setItem(formatStorageKey, format);
                    }

                    return format;
                })();

                // use whatever font CSS we've now got
                const useFont = (el: HTMLElement, css: string): void => {
                    el.innerHTML = css; // eslint-disable-line no-param-reassign
                };

                // save font css to localstorage
                const saveFont = (
                    fontName: string,
                    fontHash: string,
                    css: string
                ): void => {
                    let i = 0;
                    const totalItems = localStorage.length - 1;

                    for (; i < totalItems; i += 1) {
                        const key = localStorage.key(i);
                        if (
                            key &&
                            key.indexOf(fontStorageKey(fontName)) !== -1
                        ) {
                            localStorage.removeItem(key);
                            break;
                        }
                    }

                    localStorage.setItem(
                        fontStorageKey(fontName, fontHash),
                        JSON.stringify({ value: css })
                    );
                };

                // download font as json to store/use etc
                const fetchFont = (
                    url: string,
                    el: HTMLElement,
                    fontName: string,
                    fontHash: string
                ): void => {
                    const xhr = new XMLHttpRequest();

                    // JSONP callback
                    window.guFont = fontData => fontData.css; // eslint-disable-line no-param-reassign

                    xhr.open('GET', url, true);

                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            const css = eval(xhr.responseText); // eslint-disable-line no-eval
                            useFont(el, css);
                            saveFont(fontName, fontHash, css);
                        }
                    };

                    xhr.send();
                };

                // down to business
                // the target for each font and holders of all the necessary metadata
                // are some style elements in the head, all identified by a .webfont class
                const fonts = document.getElementsByClassName('webfont');

                const hinting =
                    fontHinting === 'Off' ? '' : `hinted-${fontHinting}-`;

                const urlAttribute = `data-cache-file-${hinting}${fontFormat}`;

                [...fonts].forEach(font => {
                    const fontURL = font.getAttribute(urlAttribute);

                    if (fontURL) {
                        const fontInfo = fontURL.match(
                            /fonts\/([^/]*?)\/?([^/]*)\.(woff2|woff|ttf).json$/
                        );
                        if (fontInfo && fontInfo.length >= 3) {
                            const fontName = fontInfo[2];
                            const fontHash = fontInfo[1];
                            const fontData = localStorage.getItem(
                                fontStorageKey(fontName, fontHash)
                            );
                            if (fontData) {
                                useFont(font, JSON.parse(fontData).value);
                            } else {
                                fetchFont(fontURL, font, fontName, fontHash);
                            }
                        }
                    }
                });

                return true;
            }
        } catch (e) {
            // do nothing
        }

        return false;
    };

    // Load fonts by injecting a `link` element.
    const loadFontsAsynchronously = (): void => {
        try {
            const scripts = document.getElementsByTagName('script');
            const thisScript = scripts[scripts.length - 1];
            const fonts = document.createElement('link');

            fonts.rel = 'stylesheet';
            fonts.className = 'webfonts';

            // show cleartype-hinted for Windows XP-7 IE, autohinted for non-IE
            fonts.href =
                window.guardian.config.stylesheets.fonts[
                    `hinting${fontHinting}`
                ].kerningOn;
            window.setTimeout(() => {
                const parentNode = thisScript.parentNode;
                if (parentNode) {
                    parentNode.insertBefore(fonts, thisScript);
                }
            });
        } catch (e) {
            // do nothing
        }
    };

    // Detect whether browser is smoothing its fonts.
    // Technique adapted from @@zoltandulac's clever hack:
    // http://www.useragentman.com/blog/2009/11/29/how-to-detect-font-smoothing-using-javascript
    //
    // Because IE always uses clear-type (unless you've done some *major* hackery
    // http://stackoverflow.com/questions/5427315/disable-cleartype-text-anti-aliasing-in-ie9#tab-top),
    // we only test non-IE, and only on Windows. Everyone else we assume `true`.
    const fontSmoothingEnabled = (): ?boolean => {
        try {
            // If we've already run this test, return the result.
            // This can be force-overidden using a '#check-smoothing' hash fragment.
            if (
                document.cookie.indexOf('GU_fonts_smoothing') !== -1 &&
                window.location.hash !== '#check-smoothing'
            ) {
                return document.cookie.indexOf('GU_fonts_smoothing=on') !== -1;
            }

            // Internal function to store font-smoothing state for 30 days
            const saveFontSmoothing = state => {
                // eslint-disable-next-line no-param-reassign
                document.cookie = `GU_fonts_smoothing= '${state
                    ? 'on'
                    : 'off'}; domain=${window.location
                    .hostname}; path=/; max-age=${60 * 60 * 24 * 30}`;
            };

            // If Windows desktop and not IE…
            if (/Windows NT (\d\.\d+)/.exec(ua) && !/MSIE|Trident/.exec(ua)) {
                try {
                    // Create a 35x35 Canvas block.
                    const canvasNode = document.createElement('canvas');
                    canvasNode.width = 35;
                    canvasNode.height = 35;
                    canvasNode.style.display = 'none';

                    if (document.documentElement) {
                        document.documentElement.appendChild(canvasNode);
                    }

                    // Draw a black '@@', in 32px Arial, onto it.
                    const ctx = canvasNode.getContext('2d');
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

                    //eslint-disable-next-line no-plusplus
                    for (let x = 0; x <= 16; ++x) {
                        //eslint-disable-next-line no-plusplus
                        for (let y = 0; y <= 16; ++y) {
                            const alpha = ctx.getImageData(x, y, 1, 1).data[3];

                            if (alpha > 0 && alpha < 255) {
                                // font-smoothing must be on
                                // save this info for 30 days
                                saveFontSmoothing(true);
                                return true;
                            }
                        }
                    }
                } catch (e) {
                    // do nothing
                }

                // Didn't find any non-black pixels or something went wrong (for example,
                // non-blink Opera cannot use the canvas fillText() method) so we assume
                // false for safety's sake.
                saveFontSmoothing(false);

                return false;
            }

            // You're not on Windows or you're using IE, so we assume true
            return true;
        } catch (e) {
            // do nothing
        }
    };

    // Check to see if you should get webfonts, and then try to load them from localStorage if so
    const fontCookie = `GU_fonts=off; domain=${window.location
        .hostname}; path=/`;

    const disableFonts = (): void => {
        document.cookie = `${fontCookie}; max-age=${60 * 60 * 24 * 365}`; // eslint-disable-line no-param-reassign
    };

    const enableFonts = (): void => {
        document.cookie = `${fontCookie}; expires=Thu, 01 Jan 1970 00:00:00 GMT`; // eslint-disable-line no-param-reassign
    };

    // Make it possible to toggle fonts with `#fonts-off/on`.
    const checkUserFontDisabling = (): void => {
        if (window.location.hash === '#fonts-off') {
            disableFonts();
        } else if (
            window.location.hash === '#fonts-on' ||
            window.location.hash === '#check-smoothing'
        ) {
            enableFonts();
        }
    };

    const fontsEnabled = document.cookie.indexOf('GU_fonts=off') === -1;

    // Finally, if we're meant to use fonts, check they'll render ok
    // and then try and load them from storage. If that fails (i.e. likely lack of
    // support), inject a standard stylesheet `link` to load them.
    // If they won't render properly (no smoothing), disable them entirely.
    const loadFonts = (): void => {
        checkUserFontDisabling();
        if (fontsEnabled) {
            if (fontSmoothingEnabled()) {
                if (!loadFontsFromStorage()) {
                    loadFontsAsynchronously();
                }
            } else {
                disableFonts();
            }
        }
    };

    loadFonts();
})(document, window);
