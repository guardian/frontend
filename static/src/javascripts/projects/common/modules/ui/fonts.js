/*jshint loopfunc: true */
define([
    'bonzo',
    'qwery',
    'raven',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
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
    detect,
    mediator,
    storage
) {

    var storagePrefix = 'gu.fonts.',
        fileFormat    = detect.getFontFormatSupport(navigator.userAgent);

    return {

        load: function () {

            if (!config.switches.webFonts || qwery('.webfonts').length) {
                return false;
            }

            if (!storage.local.get(storagePrefix + 'format')) {
                storage.local.set(storagePrefix + 'format', fileFormat);
            }

            $('.webfont:not([data-cache-full])').each(function (webfont) {
                var $webFont      = bonzo(webfont),
                    fontFile      = $webFont.data('cache-file-' + fileFormat),
                    minBreakpoint = $webFont.data('min-breakpoint');

                if (minBreakpoint && !detect.isBreakpoint({ min: minBreakpoint })) {
                    return;
                }

                ajax({
                    url:               fontFile,
                    type:              'jsonp',
                    jsonpCallbackName: 'guFont',
                    success:            function (resp) {
                        if (!resp) {
                            raven.captureMessage('Failed to load fonts');
                            return;
                        }

                        // clear old font and store
                        var fontInfo = fontFile.match(/fonts\/([^/]*?)\/?([^/]*)\.(woff2|woff|tff).json$/),
                            fontHash = fontInfo[1],
                            fontName = fontInfo[2];
                        storage.local.clearByPrefix(storagePrefix + fontName);
                        storage.local.set(storagePrefix + fontName + '.' + fontHash, resp.css);

                        $webFont.text(resp.css)
                            .attr('data-cache-full', 'data-cache-full');

                        mediator.emit('modules:fonts:loaded', name);
                    }
                });
            });

        }

    };

});
