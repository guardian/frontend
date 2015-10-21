@()(implicit request: RequestHeader)

// CSS is already loading, tell the browser to use it.
// Borrows heavily from https://github.com/filamentgroup/loadCSS.
(function (styleSheetLinks, documentStyleSheets) {

    // Check the stylesheet has downloaded, then set media to `screen`. If not, go again.
    function setMedia (styleSheet) {
        for (var i = 0, totalSheets = documentStyleSheets.length; i < totalSheets ; i++) {
            var sheet = documentStyleSheets[i];
            if (sheet.href && sheet.href.indexOf(styleSheet.href) > -1) {
                styleSheet.media = "screen";
                // Set flag for when the CSS loads before the JS
                window.guardian.css.loaded = true;
                // Execute callback for when the JS loads before the CSS
                var onLoad = window.guardian.css.onLoad;
                if (onLoad) {
                    onLoad();
                }
                return true;
            }
        }
        requestAnimationFrame(function () {
            setMedia(styleSheet);
        });

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

