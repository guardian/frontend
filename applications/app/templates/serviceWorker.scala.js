@()
@import conf.Static
@import conf.switches.Switches._

/*eslint quotes: [2, "single"], curly: [2, "multi-line"], strict: 0*/
/*eslint-env browser*/
/*global self*/
/*global clients*/

"use strict";

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * CACHE HELPERS
 */

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FETCH HELPERS
 */

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

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FETCH HANDLERS
 */

var isRequestForAsset = (function () {
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

var handleAssetRequest = function (event) {
    // Default fetch behaviour
    // Cache first for all other requests
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // Workaround Firefox bug which drops cookies
                // https://github.com/guardian/frontend/issues/12012
                return response || fetch(event.request, needCredentialsWorkaround(event.request.url) ? {
                    credentials: 'include'
                } : {});
            })
    );
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * EVENT LISTENERS
 */

this.addEventListener('fetch', function (event) {
    if (isRequestForAsset(event.request)) {
        handleAssetRequest(event);
    }
});

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
                })
                .then(function (response) {
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
                            icon: '@{JavaScript(Static("images/favicons/114x114.png"))}',
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
