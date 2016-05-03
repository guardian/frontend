@()
@import conf.Static

/*eslint quotes: [2, "single"], curly: [2, "multi-line"], strict: 0*/
/*eslint-env browser*/
/*global self*/
/*global clients*/

//
// Offline page
//
"use strict";

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
            var pageRequest = new Request('/offline-crossword');
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
// their specified URLs and the page HTML as '/offline-crossword'.
var updateCache = function () {
    // Fetch page and all assets. Iff all responses are OK then cache all assets and page.
    return fetch('/offline-crossword.json').then(function (jsonResponse) {
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

var needCredentialsWorkaround = function (url) {
    var whitelist = ['https://discussion.theguardian.com/discussion-api'];
    return whitelist.some(function (entry) {
        return new RegExp('^' + entry).test(url);
    });
};

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
    var isAssetRequest = @if(play.Play.isDev()) {
        new RegExp('^@Configuration.assets.path').test(url.pathname)
    } else {
        new RegExp('^@Configuration.assets.path').test(url.href)
    };
    // To workaround a bug in Chrome which results in broken HTTPS->HTTP
    // redirects, we only handle root requests if they match the developer
    // blog. The info section often hosts holding pages which will could
    // eventually redirect to a HTTP page.
    // https://github.com/guardian/frontend/issues/10936
    var isRequestToDeveloperBlog = url.pathname.match(/^\/info\/developer-blog($|\/.*$)/);
    if (isRootRequest && isRequestToDeveloperBlog && doesRequestAcceptHtml(request)) {
        // HTML pages fallback to offline page
        event.respondWith(
            fetch(request)
                .catch(function () {
                    return caches.match('/offline-crossword');
                })
        );
    } else if (isAssetRequest) {
        // Default fetch behaviour
        // Cache first for all other requests
        event.respondWith(
            caches.match(request)
                .then(function (response) {
                    // Workaround Firefox bug which drops cookies
                    // https://github.com/guardian/frontend/issues/12012
                    return response || fetch(request, needCredentialsWorkaround(request.url) ? { credentials: 'include' } : {});
                })
        );
    }
});

self.addEventListener('activate', function(event) {
});

self.addEventListener('push', function(event) {

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
                   if(json.status === "ok" && json.messages.length > 0) {
                       /* Client returns current messages for a given browserid ( which are then deleted ) We want the latest one.
                        If we loop displaying all of them the promise doesn't resolved and a 'website being updated in the background' message is displayed
                        */
                       var message = json.messages.slice(-1)[0];
                       var data = {topic: message.topic, blockId: message.blockId};
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

self.addEventListener('notificationclick', function(event){

    event.notification.close();
    var url = '@{JavaScript(Configuration.site.host)}/'
        + event.notification.data.topic
        + "?page=with:block-" + event.notification.data.blockId
        +  "&CMP=not_b-webalert"
        + "#block-" + event.notification.data.blockId;

    event.waitUntil(
        clients.matchAll({
                type: 'window'
            })
            .then(function(windowClients) {
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
