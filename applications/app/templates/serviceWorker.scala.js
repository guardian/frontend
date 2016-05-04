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
        return function (request) {
            var url = new URL(request.url);
            return isSameHost(url.host) && devBlogPathRegex.test(url.pathname) && requestAcceptsHTML(request);
        }
    })();

    return function (event) {
        var request = event.request;

        if (isForDevBlog(request)) {
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
        return function (request) {
            var url = new URL(request.url);
            @if(play.Play.isDev()) {
                return assetPathRegex.test(url.pathname);
            } else {
                return assetPathRegex.test(url.href);
            }
        }
    })();

    return function (event) {
        var request = event.request;

        if (isAssetRequest(request)) {
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

// handle requests for generic pages
var requestForPage = function (event) {
    var request = event.request;
    var url = new URL(request.url);

    if (requestAcceptsHTML(request) && isSameHost(url.host)) {
        event.respondWith(
            fetch(request).catch(function () {
                return new Response('<!DOCTYPE html><html><head> <title>Offline | The Guardian</title><meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1"><script>(function (){var cookies=document.cookie.split(\';\'); var offlineViews=0; for (var len=cookies.length, i=0; i<len ; i++){var data=cookies[i].split(\'=\'); if (data[0].indexOf(\'gu.offlineViews\') !==-1){offlineViews=parseInt(data[1]); break;}}document.cookie=\'gu.offlineViews=\' + (offlineViews + 1) + \';Max-Age=31536000\';})(); </script></head><body style="background-color: #005689;color:white; font-family: Helvetica,Arial,sans-serif;font-size: 12px"><div style="display: flex;align-items: center;justify-content: center;flex-direction:column;position: absolute;top:0;right:0;bottom:0;left:0"><svg width="36" height="36" viewBox="0 0 36 36" fill="white" style="height: 64px;width: 64px;"><path d="M21.3 8.8c0-4.9-1.5-5.7-3.3-5.7-1.8 0-3.2.7-3.2 5.7s1.5 5.5 3.2 5.5c1.8-.1 3.3-.6 3.3-5.5m-6.5 18.8c-2.3 0-2.9 1.7-2.9 2.9 0 1.8 1.6 3.4 6.3 3.4 5.3 0 6.8-1.5 6.8-3.4 0-1.7-1.3-2.9-3.4-2.9h-6.8zM10.5 2.4C4.3 5.2 0 11.4 0 18.7c0 4.9 2 9.4 5.2 12.6V31c0-3.2 3.1-4.4 5.9-5-2.6-.6-3.9-2.5-3.9-4.4 0-2.6 2.9-4.8 4.3-5.8l-.2-.1c-2.5-1.4-4.1-3.8-4.1-7 0-2.7 1.2-4.9 3.3-6.3M36 18.8C36 11.4 31.5 5 25.1 2.3c2.1 1.4 3.4 3.5 3.5 6.3l.1.6c0 5.4-4.4 8.2-10.7 8.2-1.6 0-2.7-.1-4.1-.5-.6.4-1.1 1.1-1.1 1.8 0 .9.8 1.6 1.8 1.6h8.8c5.5 0 8.2 2.2 8.2 7.1 0 1.6-.3 3.1-1 4.3 3.3-3.4 5.4-7.9 5.4-12.9"></path></svg><p style="padding: 2rem 2rem 0;text-align:center;">Sorry, you do not have any network at the moment.</p></div></body></html>', {
                        headers: {
                            'Content-Type': 'text/html'
                        }
                    });
            })
        );
    };
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * EVENT LISTENERS
 */

this.addEventListener('install', function (event) {
    event.waitUntil(updateOfflineCrosswordCache());
});

this.addEventListener('fetch', requestForDevBlog);
this.addEventListener('fetch', requestForAsset);
this.addEventListener('fetch', requestForPage);

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
