// This module attempts to load webfonts in over XMLHTTP, add them to the
// current page and then save them to `localStorage` for next time.

define([
    'bonzo',
    'qwery',
    'raven',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage'
], function (
    bonzo,
    qwery,
    raven,
    $,
    ajax,
    config,
    cookies,
    detect,
    mediator,
    storage
) {

    var storagePrefix = 'gu.fonts.',
        fileFormat    = detect.getFontFormatSupport(navigator.userAgent);

    return {
        disabled: function () {
            return (cookies.get('GU_fonts') === 'off');
        },
        load: function () {
            // If any of the following conditions are met, we just leave it and
            // `return false`:
            // - fonts switch is off
            // - user has/we have switched off fonts with a cookie
            // - fonts have been loaded asynchronously by injecting a `link`
            if (!config.switches.webFonts || this.disabled() || qwery('.webfonts').length) {
                return false;
            }

            // Make sure we will remember what format we want later.
            if (!storage.local.get(storagePrefix + 'format')) {
                storage.local.set(storagePrefix + 'format', fileFormat);
            }

            // Now we want to load them. Query the `style.webfont` elements
            // for each font's URI, if it's not already been loaded from `localStorage`
            $('.webfont:not([data-loaded-from])').each(function (webfont) {
                var $webFont      = bonzo(webfont),
                    fontFile      = $webFont.data('cache-file-' + (detect.fontHinting === 'Off' ? '' : 'hinted-' + detect.fontHinting + '-') + fileFormat),
                    minBreakpoint = $webFont.data('min-breakpoint');

                // Some fonts are not loaded is the viewport is small enough
                // (i.e. mobile).
                if (minBreakpoint && !detect.isBreakpoint({ min: minBreakpoint })) {
                    return;
                }

                // Request them. Once we've got them, we add the font data
                // to the page by injecting it into the relevent
                // `style.webfont` element, and save it to `localStorage`
                // for next time too.
                ajax({
                    url:               fontFile,
                    type:              'jsonp',
                    jsonpCallbackName: 'guFont',
                    success:           function (resp) {

                        // If the response is no good, record an error and go.
                        if (!resp) {
                            raven.captureMessage('Failed to load fonts');
                            return;
                        }

                        // Handle the response.
                        var fontInfo = fontFile.match(/fonts\/([^/]*?)\/?([^/]*)\.(woff2|woff|tff).json$/),
                            fontHash = fontInfo[1],
                            fontName = fontInfo[2];

                        // Insert the css from the response into the style element on the page…
                        $webFont.text(resp.css).attr('data-loaded-from', 'ajax');

                        // …then clear out any old fonts
                        storage.local.clearByPrefix(storagePrefix + fontName.replace(/(CleartypeHinted|AutoHinted)$/, ''));

                        // …then save the new ones
                        storage.local.set(storagePrefix + fontName + '.' + fontHash, resp.css);

                        // …and finally announce the new arrival.
                        mediator.emit('modules:fonts:loaded', name);
                    }
                });
            });
        }
    };
});
