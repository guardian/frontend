@()

/*eslint quotes: [2, "single"], curly: [2, "multi-line"], strict: 0*/
/*eslint-env browser*/
/*global self*/
/*global clients*/

//
// Offline page
//

var staticCacheName = 'static';

var getISODate = function () { return new Date().toISOString().split('T')[0]; };

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

//
// Push notifications
//

var findInArray = function (array, fn) {
    for (var i = array.length - 1; i >= 0; i--) {
        var value = array[i];
        if (fn(value)) return value;
    }
};

// Warning: reassignment!
var notificationData;

self.addEventListener('push', function (event) {
    event.waitUntil(
        fetch('@{JavaScript(Configuration.pushNotifications.host + "/?url=http://push-api-web.gutools.co.uk/messages/web/latest")}')
            .then(function (x) { return x.json(); })
            .then(function (data) {
                // Warning: reassign !
                notificationData = {
                    title: data.message,
                    url: data.link,
                    body: '',
                    tag: 'breaking-news',
                    icon: '@{JavaScript(Static("images/favicons/152x152.png").path)}'
                };

                return self.registration.showNotification(notificationData.title, {
                    body: notificationData.body,
                    icon: notificationData.icon,
                    tag: notificationData.tag
                });
            })
    );
});

self.addEventListener('notificationclick', function (event) {
    // Android doesn't close the notification when you click on it
    // See: http://crbug.com/463146
    event.notification.close();

    var url = notificationData.url;

    // Focus if already open
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(function (clientList) {
                var matchingClient = findInArray(clientList, function (client) {
                    return new URL(client.url).pathname === url;
                });
                return matchingClient ? matchingClient.focus() : clients.openWindow(url);
            })
    );
});

