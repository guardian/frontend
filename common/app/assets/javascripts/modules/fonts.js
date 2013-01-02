/*jshint loopfunc: true */
define(['reqwest', 'common'], function (reqwest, common) {

    function Fonts(styleNodes, fileFormat) {

        this.styleNodes = styleNodes;
        this.fileFormat = fileFormat;
        this.reqwest = reqwest; // expose publicly so we can inspect it in unit tests

        function fontIsRequired(style) {
            // A final check for localStorage.
            // Because it would be horrible if people downloaded fonts and then couldn't cache them.
            try {
                localStorage.setItem('test', 'test1');
                localStorage.removeItem('test');
                var name = style.getAttribute('data-cache-name'),
                    cacheKey = style.getAttribute('data-cache-file-woff').split('.')[2];
                return (localStorage.getItem(Fonts.storagePrefix + name + '.' + cacheKey) === null);
            }
            catch (e) {
                return false;
            }
        }

        this.loadFromServer = function (url, callback) {

            // If no URL, then load from standard static assets path.
            url = url || '';

            for (var i = 0, j = this.styleNodes.length; i < j; ++i) {
                var style = this.styleNodes[i];
                if (fontIsRequired(style)) {
                    this.reqwest({
                        url: url + style.getAttribute('data-cache-file-' + this.fileFormat),
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

                                var name = style.getAttribute('data-cache-name'),
                                    cacheKey = style.getAttribute('data-cache-file-woff').split('.')[2];

                                Fonts.clearFont(name);
                                localStorage.setItem(Fonts.storagePrefix + name + '.' + cacheKey, json.css);
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
            var html = document.querySelector('html');
            this.loadFromServer(url, function (style, json) {
                style.innerHTML = json.css;
                if (html.className.indexOf('font-' + json.name + '-loaded') < 0) {
                    html.className += ' font-' + json.name + '-loaded';
                }
            });
        };

    }

    Fonts.storagePrefix = "gu.fonts.";

    Fonts.clearWithPrefix = function(prefix) {
        // Loop in reverse because localStorage indexes will change as you delete items.
        for (var i = localStorage.length - 1; i > -1; --i) {
            var name = localStorage.key(i);
            if (name.indexOf(prefix) === 0) {
                localStorage.removeItem(name);
            }
        }
    }

    Fonts.clearFont = function(name) {
        Fonts.clearWithPrefix(Fonts.storagePrefix + name);
    }
    
    Fonts.clearAllFontsFromStorage = function() {
        Fonts.clearWithPrefix(Fonts.storagePrefix);
        Fonts.clearWithPrefix('_guFont:');
    };

    return Fonts;

});
