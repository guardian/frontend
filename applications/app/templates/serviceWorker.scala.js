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

    var fetchAll = function (inputs) {
        return Promise.all(inputs.map(function (input) {
            return fetch(input);
        }));
    };

    var cachePageAndAssetResponses = function (jsonResponse, assetResponses) {
        var cacheName = [getISODate(), staticCacheName].join('-');
        return caches.open(cacheName).then(function (cache) {
            return jsonResponse.clone().json().then(function (jsonResponseJson) {
                var pageRequest = new Request('/offline-page');
                var pageResponse = new Response(jsonResponseJson.html, { headers: { 'Content-Type': 'text/html' } });
                return Promise.all([
                    cache.put(pageRequest, pageResponse)
                ].concat(
                    assetResponses.map(function (assetResponse) {
                        var assetRequest = new Request(assetResponse.url);
                        return cache.put(assetRequest, assetResponse);
                    })
                ));
            });
        });
    };

    // The JSON contains the HTML and asset versions. We cache the assets at
    // their specified URLs and the page HTML as '/offline-page'.
    var updateCache = function () {
        // Fetch page and all assets. Iff all responses are OK then cache all assets and page.
        return fetch('/offline-page.json').then(function (jsonResponse) {
            if (jsonResponse.ok) {
                return jsonResponse.clone().json().then(function (json) {
                    return fetchAll(json.assets).then(function (assetResponses) {
                        var allAssetResponsesOk = assetResponses.every(function (response) { return response.ok; });

                        if (allAssetResponsesOk) {
                            return cachePageAndAssetResponses(jsonResponse, assetResponses);
                        }
                    });
                });
            }
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

    var doesRequestAcceptHtml = function (request) {
        return request.headers.get('Accept')
            .split(',')
            .some(function (type) { return type === 'text/html'; });
    };

    var isCacheUpdated = function () {
        return caches.keys().then(function (keys) {
            return keys.some(keyMatchesTodaysCache);
        });
    };

    self.addEventListener('install', function (event) {
        event.waitUntil(updateCache());
    });

    this.addEventListener('fetch', function (event) {
        var request = event.request;

        if (doesRequestAcceptHtml(request)) {
            isCacheUpdated().then(function (isUpdated) {
                if (!isUpdated) {
                    updateCache().then(deleteOldCaches);
                }
            });
        }

        var url = new URL(request.url);
        var isRootRequest = url.host === self.location.host;
        // To workaround a bug in Chrome which results in broken HTTPS->HTTP
        // redirects, we only handle root requests if they match a HTTPS
        // endpoint
        // https://github.com/guardian/frontend/issues/10936
        var isRequestToHttpsSection = url.pathname.match(/^\/info($|\/.*$)/);
        if (isRootRequest && isRequestToHttpsSection && doesRequestAcceptHtml(request)) {
            // HTML pages fallback to offline page
            event.respondWith(
                fetch(request)
                    .catch(function () {
                        return caches.match('/offline-page');
                    })
            );
        @* In dev, all requests come from one server (by default) *@
        } else if (@if(play.Play.isDev()) { true } else { !isRootRequest }) {
            // Default fetch behaviour
            // Cache first for all other requests
            event.respondWith(
                caches.match(request)
                    .then(function (response) {
                        return response || fetch(request);
                    })
            );
        }
    });
}

