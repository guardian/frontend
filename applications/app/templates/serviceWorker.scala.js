@()
@import conf.Static

/*eslint quotes: [2, "single"], curly: [2, "multi-line"], strict: 0*/
/*eslint-env browser*/
/*global self*/
/*global clients*/

"use strict";

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * GENERIC HELPERS
 */

var getISODate = function () {
    return new Date().toISOString().split('T')[0];
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * CACHE HELPERS
 */

var isCacheUpdated = function () {
    return caches.keys().then(function (keys) {
        return keys.some(cacheKeyMatchesTodaysCache);
    });
};

var deleteOldCaches = function () {
    return caches.keys().then(function (keys) {
        return Promise.all(
            keys.map(function (key) {
                if (!cacheKeyMatchesTodaysCache(key)) {
                    return caches.delete(key);
                }
            })
        );
    })
};

var cacheKeyMatchesTodaysCache = (function () {
    var regex = new RegExp('^' + getISODate() + '-');
    return function (key) {
        return regex.test(key);
    }
})();

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FETCH HELPERS
 */

var fetchAll = function (resources) {
    return Promise.all(resources.map(function (resource) {
        return fetch(resource);
    }));
};

var needCredentialsWorkaround = (function () {
    var whitelistRegexs = [
        'https://discussion.theguardian.com/discussion-api'
    ].map(function (entry) {
        return new RegExp('^' + entry);
    });
    return function (url) {
        return whitelistRegexs.some(function (re) {
            return re.test(url);
        });
    }
})();

var requestAcceptsHTML = function (request) {
    return request.headers.get('Accept')
        .split(',')
        .some(function (type) { return type === 'text/html'; });
};

var isSameHost = function (host) {
    return host === self.location.host;
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FETCH HANDLERS
 */

var requestForDevBlog = (function () {
    var isForDevBlog = (function () {
        var devBlogPathRegex = /^\/info\/developer-blog($|\/.*$)/;
        return function (url, request) {
            return isSameHost(url.host) && devBlogPathRegex.test(url.pathname) && requestAcceptsHTML(request);
        }
    })();

    return function (event) {
        var request = event.request;
        var url = new URL(request.url);

        if (isForDevBlog(url, request)) {
            // update the crossword on every visist the dev blog
            if (requestAcceptsHTML(request)) {
                isCacheUpdated().then(function (isUpdated) {
                    if (!isUpdated) {
                        updateOfflineCrosswordCache().then(deleteOldCaches);
                    }
                });
            };

            event.respondWith(
                fetch(request).catch(function () {
                    return caches.match('/offline-crossword');
                })
            );
        };
    }
})();

var requestForAsset = (function () {
    var isAssetRequest = (function () {
        var assetPathRegex = new RegExp('^@Configuration.assets.path');
        return function (url) {
            @if(play.Play.isDev()) {
                return assetPathRegex.test(url.pathname);
            } else {
                return assetPathRegex.test(url.href);
            }
        }
    })();

    return function (event) {
        var request = event.request;
        var url = new URL(request.url);

        if (isAssetRequest(url)) {
            // Default fetch behaviour
            // Cache first for all other requests
            event.respondWith(
                caches.match(request)
                    .then(function (response) {
                        // Workaround Firefox bug which drops cookies
                        // https://github.com/guardian/frontend/issues/12012
                        return response || fetch(request, needCredentialsWorkaround(request.url) ? {
                            credentials: 'include'
                        } : {});
                    })
            );
        }
    }
})();

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * EVENT LISTENERS
 */

this.addEventListener('install', function (event) {
    event.waitUntil(updateOfflineCrosswordCache());
});

self.addEventListener('activate', function (event) {});

this.addEventListener('fetch', requestForDevBlog);
this.addEventListener('fetch', requestForAsset);

self.addEventListener('push', function (event) {

    event.waitUntil(
        self.registration.pushManager.getSubscription().then(function (sub) {
            var gcmBrowserId = sub.endpoint.substring(sub.endpoint.lastIndexOf('/') + 1);

            var endpoint = '@{JavaScript(Configuration.Notifications.latestMessageUrl)}/' + gcmBrowserId;
            return fetch(endpoint, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    return response.json();
                })
                .then(function (json) {
                    if (json.status === "ok" && json.messages.length > 0) {
                        /* Client returns current messages for a given browserid ( which are then deleted ) We want the latest one.
                         If we loop displaying all of them the promise doesn't resolved and a 'website being updated in the background' message is displayed
                         */
                        var message = json.messages.slice(-1)[0];
                        var data = {
                            topic: message.topic,
                            blockId: message.blockId
                        };
                        return self.registration.showNotification(message.title, {
                            body: message.body,
                            icon: '@{JavaScript(Static("images/favicons/114x114.png").path)}',
                            tag: message.title,
                            data: data
                        });
                    }
                })

        })
    );
});

self.addEventListener('notificationclick', function (event) {

    event.notification.close();
    var url = '@{JavaScript(Configuration.site.host)}/' + event.notification.data.topic + "?page=with:block-" + event.notification.data.blockId + "&CMP=not_b-webalert" + "#block-" + event.notification.data.blockId;

    event.waitUntil(
        clients.matchAll({
            type: 'window'
        })
        .then(function (windowClients) {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * OfflineCrossword-specific stuff
 */

// The JSON contains the HTML and asset versions. We cache the assets at
// their specified URLs and the page HTML as '/offline-crossword'.
var updateOfflineCrosswordCache = function () {
    var cacheOfflineCrosswordAndAssetResponses = function (jsonResponse, assetResponses) {
        var cacheName = [getISODate(), 'static'].join('-');
        return caches.open(cacheName).then(function (cache) {
            return jsonResponse.clone().json().then(function (jsonResponseJson) {
                var pageRequest = new Request('/offline-crossword');
                var pageResponse = new Response(jsonResponseJson.html, {
                    headers: {
                        'Content-Type': 'text/html'
                    }
                });
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

    // Fetch page and all assets. Iff all responses are OK then cache all assets and page.
    return fetch('/offline-crossword.json').then(function (jsonResponse) {
        if (jsonResponse.ok) {
            return jsonResponse.clone().json().then(function (json) {
                return fetchAll(json.assets).then(function (assetResponses) {
                    var allAssetResponsesOk = assetResponses.every(function (response) {
                        return response.ok;
                    });

                    if (allAssetResponsesOk) {
                        return cacheOfflineCrosswordAndAssetResponses(jsonResponse, assetResponses);
                    }
                });
            });
        }
    });
};
