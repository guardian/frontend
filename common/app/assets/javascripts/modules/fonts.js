/*jshint loopfunc: true */
define(['ajax', 'common'], function (ajax, common) {

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
                        error: function () {
                            common.mediator('module:error', 'Failed to load fonts', 'fonts.js');
                        },
                        success: (function (style) {
                            return function (json) {
                                if (typeof callback === 'function') {
                                    callback(style, json);
                                }

                                var nameAndCacheKey = getNameAndCacheKey(style);

                                that.clearFont(nameAndCacheKey[0]);
                                localStorage.setItem(storagePrefix + nameAndCacheKey[0] + '.' + nameAndCacheKey[1], json.css);
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

        this.clearWithPrefix = function(prefix) {
            // Loop in reverse because localStorage indexes will change as you delete items.
            for (var i = localStorage.length - 1; i > -1; --i) {
                var name = localStorage.key(i);
                if (name.indexOf(prefix) === 0) {
                    localStorage.removeItem(name);
                }
            }
        };

        this.clearFont = function(name) {
            this.clearWithPrefix(storagePrefix + name);
            this.clearWithPrefix('_guFont:'); // Remove legacy non-cache-busted font.
        };
        
        this.clearAllFontsFromStorage = function() {
            this.clearWithPrefix(storagePrefix);
        };

        function getNameAndCacheKey(style) {
            var nameAndCacheKey = style.getAttribute('data-cache-file-woff').match(/fonts\/(.*)\.woff\.(.*)\.js$/);
            nameAndCacheKey.shift();
            return nameAndCacheKey;
        }

        function fontIsRequired(style) {
            // A final check for localStorage (is it full, disabled, any other error).
            // Because it would be horrible if people downloaded fonts and then couldn't cache them.
            try {
                localStorage.setItem('test', 'test1');
                localStorage.removeItem('test');
                var nameAndCacheKey =  getNameAndCacheKey(style);
                return (localStorage.getItem(storagePrefix + nameAndCacheKey[0] + '.' + nameAndCacheKey[1]) === null);
            }
            catch (e) {
                return false;
            }
        }

    }

    return Fonts;

});
