@import conf.switches.Switches.OfflinePageSwitch

@()

/*eslint quotes: [2, "single"], curly: [2, "multi-line"], strict: 0*/
/*eslint-env browser*/
/*global self*/
/*global clients*/

@if(OfflinePageSwitch.isSwitchedOn) {

    //
    // Offline page
    //

    var staticCacheName = 'static';

    var getISODate = function () {
        return new Date().toISOString().split('T')[0];
    };

    var updateCache = function () {
        return caches.open([getISODate(), staticCacheName].join('-')).then(function (cache) {
            return cache.addAll([
                '/offline-page',
                '@Static("stylesheets/head.content.css")',
                '@Static("stylesheets/content.css")',
                '@Static("stylesheets/print.css")',
                // Crossword pages use jspm
                '@StaticJspm("javascripts/core.js")',
                '@StaticJspm("javascripts/bootstraps/app.js")',
                '@StaticJspm("javascripts/es6/bootstraps/crosswords.js")'
            ]);
        });
    };

    var deleteOldCaches = function () {
        return caches.keys().then(function (keys) {
            return Promise.all(
                keys.map(function (key) {
                    if (!keyMatchesTodaysCache(key)) {
                        return caches.delete(key);
                    }
                })
            );
        })
    };

    var keyMatchesTodaysCache = function (key) {
        return new RegExp('^' + getISODate() + '-').test(key);
    };

    self.addEventListener('install', function (event) {
        event.waitUntil(updateCache());
    });

    this.addEventListener('fetch', function (event) {
        caches.keys().then(function (keys) {
            var isUpdated = keys.some(keyMatchesTodaysCache);

            if (!isUpdated) {
                updateCache().then(deleteOldCaches);
            }
        });

        event.respondWith(
            fetch(event.request)
                .catch(function () {
                    // If a request is cached, respond with that. Otherwise respond
                    // with the shell, whose subresources will be in the cache.
                    return caches.match(event.request).then(function (response) {
                        return response || caches.match('/offline-page');
                    })
                })
        );
    });
}

