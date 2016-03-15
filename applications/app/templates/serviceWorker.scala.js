@()
@import conf.Static

/*eslint quotes: [2, "single"], curly: [2, "multi-line"], strict: 0*/
/*eslint-env browser*/
/*global self*/
/*global clients*/

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

    console.log("+++ Bojo Wotcher: I'll nail the fucker .. One Day");
    event.waitUntil(
        self.registration.pushManager.getSubscription().then(function (sub) {
            var gcmInd = sub.endpoint.substring(sub.endpoint.lastIndexOf('/') + 1);

            // @Txt(Configuration.Notifications.latestMessageUrl)
            var endpoint = '@{JavaScript(Configuration.Notifications.latestMessageUrl)}/' + gcmInd;
            console.log("End: " + endpoint);
            fetch(endpoint, {
                method: 'get',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
               return response.json();
            })
            .then(function (json) {

               if(json.status === "ok")
                    var messages = json.messages;

                    messages.forEach( function(message) {
                        var data = {topic: message.topic};
                        self.registration.showNotification(message.title, {
                            body: message.body,
                            icon: '@{JavaScript(Static("images/favicons/114x114.png").path)}',
                            tag: message.title,
                            data: data
                        });
                    });
                })

        })
    );
});

self.addEventListener('notificationclick', function(event){

        event.notification.close();
        var url = '@{JavaScript(Configuration.javascript.pageData.get("guardian.page.host").getOrElse("https://www.theguardian.com"))}/' + event.notification.data.topic ;

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
