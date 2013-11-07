/*jshint loopfunc: true */
define(['ajax', 'common', 'modules/storage'], function (ajax, common, storage) {

    function Fonts(styleNodes, fileFormat) {

        var storagePrefix = "gu.fonts.";

        this.ajax = ajax; // expose publicly so we can inspect it in unit tests

        this.view = {
            showFont: function(style, json) {
                style.innerHTML = json.css;
                var html = document.querySelector('html');
                if (html.className.indexOf('font-' + json.name + '-loaded') < 0) {
                    html.className += ' font-' + json.name + '-loaded';
                }
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
                                    common.mediator.emit('module:error', 'Failed to load fonts', 'fonts.js');
                                    return;
                                }
                                if (typeof callback === 'function') {
                                    callback(style, json);
                                }

                                var nameAndCacheKey = getNameAndCacheKey(style);

                                that.clearFont(nameAndCacheKey[0]);
                                storage.set(storagePrefix + nameAndCacheKey[0] + '.' + nameAndCacheKey[1], json.css);
                                common.mediator.emit('modules:fonts:loaded', [json.name]);
                            };
                        }(style))
                    });
                } else {
                    common.mediator.emit('modules:fonts:notloaded', []);
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
            storage.clearByPrefix(storagePrefix + name);
        };

        this.clearAllFontsFromStorage = function() {
            storage.clearByPrefix(storagePrefix);
        };

        function getNameAndCacheKey(style) {
            var nameAndCacheKey = style.getAttribute('data-cache-file-woff').match(/fonts\/(.*)\.woff(?:\.(.*))?\.json$/);
            nameAndCacheKey.shift();
            return nameAndCacheKey;
        }

        function fontIsRequired(style) {
            // A final check for storage (is it full, disabled, any other error).
            // Because it would be horrible if people downloaded fonts and then couldn't cache them.
            if (storage.isAvailable()) {
                var nameAndCacheKey =  getNameAndCacheKey(style);
                var cachedValue = storage.get(storagePrefix + nameAndCacheKey[0] + '.' + nameAndCacheKey[1]);

                var widthMatches = true;
                var minWidth = style.getAttribute('data-min-width');
                if (minWidth && parseInt(minWidth, 10) >= window.innerWidth) {
                    widthMatches = false;
                }

                return (cachedValue === null && widthMatches);
            } else {
                return false;
            }
        }

    }

    return Fonts;

});
