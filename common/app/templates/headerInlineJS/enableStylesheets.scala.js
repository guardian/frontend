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
                return true;
            }
        }
        if(window.useRAFforCSS) {
            requestAnimationFrame(function () {
                setMedia(styleSheet);
            });
        } else {
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

