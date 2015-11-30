(function () {
    var guardian = window.guardian;

    // Download but don't execute, just define
    var preFetchEnhancedBundles = function () {
        var downloaded = false;
        var listeners = [];

        if (guardian.isModernBrowser) {
            // Order matters because define fn needs dependencies to register
            require([
                'js!enhanced-vendor!order',
                'js!bootstraps/enhanced!order'
            ], function () {
                downloaded = true;
                listeners.forEach(function (fn) { fn(); });
            });
        }

        return function (callback) {
            if (downloaded) {
                callback();
            } else {
                listeners.push(callback);
            }
        };
    };

    var afterPreFetch = preFetchEnhancedBundles();

    require(['bootstraps/standard', 'domReady!'], function (standardBootstrap) {
        standardBootstrap.go();

        if (guardian.isModernBrowser) {
            afterPreFetch(function () {
                require(['bootstraps/enhanced'], function (enhancedBootstrap) {
                    enhancedBootstrap.go();
                });
            });
        }
    });
})();
