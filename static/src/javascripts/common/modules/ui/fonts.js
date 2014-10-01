/*jshint loopfunc: true */
define([
    '../../../bower_components/bonzo/bonzo',
    'qwery',
    'raven',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/utils/storage'
], function (
    bonzo,
    qwery,
    raven,
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
            // NOTE - clearing old fonts, can be removed after a certain amount of time
            storage.local.clearByPrefix('gu.fonts.Web');
            for (var i = 0, j = styleNodes.length; i < j; ++i) {
                clearOldFonts(styleNodes[i]);
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
                                    raven.captureMessage('Failed to load fonts');
                                    return;
                                }
                                if (typeof callback === 'function') {
                                    callback(style, json);
                                }

                                var nameAndCacheKey = getNameAndCacheKey(style);

                                that.clearFont(nameAndCacheKey[1]);
                                storage.local.set(storagePrefix + nameAndCacheKey[1] + '.' + nameAndCacheKey[0], json.css);
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
            var nameAndCacheKey = style.getAttribute('data-cache-file-woff').match(/fonts\/([^/]*?)\/?([^/]*)\.woff.json$/);
            nameAndCacheKey.shift();
            return nameAndCacheKey;
        }

        function fontIsRequired(style) {
            // A final check for storage (is it full, disabled, any other error).
            // Because it would be horrible if people downloaded fonts and then couldn't cache them.
            if (storage.local.isAvailable()) {
                var nameAndCacheKey =  getNameAndCacheKey(style);
                var cachedValue = storage.local.get(storagePrefix + nameAndCacheKey[1] + '.' + nameAndCacheKey[0]);

                var widthMatches = true;
                var minWidth = style.getAttribute('data-min-width');
                if (minWidth && parseInt(minWidth, 10) >= window.innerWidth) {
                    widthMatches = false;
                }

                return cachedValue === null && widthMatches;
            } else {
                return false;
            }
        }

        /**
         * NOTE: temp method, to fix bug with removal of old fonts - can be removed if font files update
         */
        function clearOldFonts(style) {
            var key = getNameAndCacheKey(style),
                fontPrefix = 'gu.fonts.' + key[1],
                fontName = fontPrefix + '.' + key[0];
            for (var i = storage.local.length() - 1; i > -1; --i) {
                var name = storage.local.getKey(i);
                if (name.indexOf(fontPrefix) === 0 && name.indexOf(fontName) !== 0) {
                    storage.local.remove(name);
                }
            }
        }

    }

    return Fonts;

});
