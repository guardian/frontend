@()(implicit context: model.ApplicationContext)

@import play.api.Mode.Dev

// prevent repainting everytime a font loads by
// - disabling the font stylesheet, meaning we render immediately with fallbacks
// - manually triggering their download
// - re-enabling the font-stylesheet once we have them
// if the cache is cold, this will render the page with local fallbacks until we have them.
// if they're already cached, they should become available before we start the first paint.

try {
    (() => {
        const ua = navigator.userAgent;

        // if we can't use woffs, just stop here.
        // https://stackoverflow.com/a/33639103
        const cannotWoff =
            (document.all && !document.addEventListener) || // < IE9
            !!window['operamini'] || // opera mini
            parseFloat(
                // < android 4.4
                (() => {
                    const match = ua.match(/android\s([0-9\.]*)/i);
                    return match ? match[1] : false;
                })() < 4.4
            );

        if (cannotWoff) return;

        // get the font styleSheet
        // https://developer.mozilla.org/en-US/docs/Web/API/StyleSheet
        // (note - this is not the style element)
        const stylesheet = [].slice
            .call(document.styleSheets)
            .find(({ ownerNode }) => ownerNode.id === 'fonts');

        // disable font stylesheet while we download them, so that we can enable them again
        // in one go, to minimise repaints. local fallbacks will be used while it's disabled.
        stylesheet.disabled = true;

        // for chrome on Win XP-7, we want auto-hinted fonts
        if (ua.indexOf('Windows NT') !== -1) {
            const windowsNT = /Windows NT (\d\.\d+)/.exec(ua);
            if (windowsNT) {
                const version = parseFloat(windowsNT[1], 10);
                if (/Chrome/.exec(ua) && version >= 5.1 && version < 6.0) {
                    stylesheet.innerHTML = stylesheet.innerHTML.replace(
                        /hinting-off/g,
                        'hinting-auto'
                    );
                }
            }
        }

        // now force fonts to download.
        // once they've all downloaded, we'll renable the stylesheet, triggering a repaint

        if (!document.fonts) {
            // proper way to do this
            const loadFonts = Array.from(document.fonts).map(font => font.load());
            Promise.all(loadFonts).then(() => {
                stylesheet.disabled = false;
            });
        } else {
            // fallback. we'll use to XHR to prime the cache instead

            // get a list of all fontFaces in the stylesheet
            const fontFaces = Array.from(stylesheet.cssRules).filter(
                rule => rule.type === 5
            );

            // store a count of how many fonts have downloaded
            let loadedFonts = 0;

            // prime the cache using XMLHttpRequest
            const fetchFont = url => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'blob';
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        loadedFonts++;

                        // if we've downloaded all the fonts now, enable the stylesheet
                        if (loadedFonts === fontFaces.length) {
                            stylesheet.disabled = false;
                        }
                    }
                };
                xhr.send();
            };

            // for each font, download it
            fontFaces.forEach(({ style }) => {
                // we can't know here if we want woff or woff2
                // so we're just going to go with woff
                const woff = style
                    .getPropertyValue('src')
                    .split(',')
                    .find(format => format.indexOf('format("woff")') !== -1);
                const match = woff.match(/url\(["'](.+?)["']\)/);
                if (match) {
                    const url = match[1];
                    fetchFont(url);
                    style.src = woff;
                }
            });
        }
    })();
} catch (e) {
    @if(context.environment.mode == Dev){throw(e)}
}
