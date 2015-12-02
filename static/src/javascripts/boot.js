(function () {
    var guardian = window.guardian;

    // Download but don't execute, just define
    var preFetchEnhancedBundles = function () {
        var downloaded = false;
        var onLoad;

        if (guardian.isModernBrowser) {
            // Order matters because define fn needs dependencies to register
            require([
                'js!enhanced-vendor!order',
                'js!bootstraps/enhanced!order'
            ], function () {
                downloaded = true;
                if (onLoad) {
                    onLoad();
                }
            });
        }

        return function (callback) {
            if (downloaded) {
                callback();
            } else {
                onLoad = callback;
            }
        };
    };

    var afterPreFetch = preFetchEnhancedBundles();

    require(['bootstraps/standard', 'domReady!'], function () {
        if (guardian.isModernBrowser) {
            afterPreFetch(function () {
                require(['bootstraps/enhanced']);
            });
        }
    });
})();
