/*jshint loopfunc: true */
define([
    'qwery',
    'bonzo',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/utils/storage'
], function (
    qwery,
    bonzo,
    ajax,
    mediator,
    storage
) {

    function Fonts(styleNodes, fileFormat) {

        var storagePrefix = 'gu.fonts.';

        this.ajax = ajax; // expose publicly so we can inspect it in unit tests

        this.view = {
            showFont: function(style, json) {
                style.innerHTML = json.css;
            }
        };

        this.loadFromServer = function (url, callback) {

            // If no URL, then load from standard static assets path.
            url = url || '';
            for (var i = 0, j = styleNodes.length; i < j; ++i) {
                var style = styleNodes[i];
                if (fontIsRequired(style)) {
                    var that = this;
                    this.ajax({
                        url: url + style.getAttribute('data-cache-file-' + fileFormat),
                        type: 'jsonp',
                        jsonpCallbackName: 'guFont',
                        success: (function (style) {
                            return function (json) {
                                if (!json) {
                                    mediator.emit('module:error', 'Failed to load fonts', 'fonts.js');
                                    return;
                                }
                                if (typeof callback === 'function') {
                                    callback(style, json);
                                }

                                var nameAndCacheKey = getNameAndCacheKey(style);

                                that.clearFont(nameAndCacheKey[0]);
                                storage.local.set(storagePrefix + nameAndCacheKey[0] + '.' + nameAndCacheKey[1], json.css);
                                mediator.emit('modules:fonts:loaded', [json.name]);
                            };
                        }(style))
                    });
                } else {
                    mediator.emit('modules:fonts:notloaded', []);
                }
            }
        };

        this.loadFromServerAndApply = function (url) {
            var that = this;
            this.loadFromServer(url, function (style, json) {
                that.view.showFont(style, json);
            });
        };

        this.clearFont = function(name) {
            storage.local.clearByPrefix(storagePrefix + name);
        };

        this.clearAllFontsFromStorage = function() {
            storage.local.clearByPrefix(storagePrefix);
        };

        function getNameAndCacheKey(style) {
            var nameAndCacheKey = style.getAttribute('data-cache-file-woff').match(/fonts\/(.*)\.woff(?:\.(.*))?\.json$/);
            nameAndCacheKey.shift();
            return nameAndCacheKey;
        }

        function fontIsRequired(style) {
            // A final check for storage (is it full, disabled, any other error).
            // Because it would be horrible if people downloaded fonts and then couldn't cache them.
            if (storage.local.isAvailable()) {
                var nameAndCacheKey =  getNameAndCacheKey(style);
                var cachedValue = storage.local.get(storagePrefix + nameAndCacheKey[0] + '.' + nameAndCacheKey[1]);

                var widthMatches = true;
                var minWidth = style.getAttribute('data-min-width');
                if (minWidth && parseInt(minWidth, 10) >= window.innerWidth) {
                    widthMatches = false;
                }

                // if this font is only for advertisement features, make sure that's what the page is
                var fontRequired = (bonzo(style).data('advertisement-feature') !== undefined) ? isAdvertisementFeature() : true;

                return cachedValue === null && widthMatches && fontRequired;
            } else {
                return false;
            }
        }

        function isAdvertisementFeature() {
            return qwery('*[class$="--advertisement-feature"]').length > 0;
        }

    }

    return Fonts;

});
