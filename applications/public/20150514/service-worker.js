// TODO: Lint

/*eslint quotes: [2, "single"], curly: [2, "multi-line"], strict: 0*/
/*eslint-env browser*/
/*global self*/
// TODO: eslint-env service-worker
// https://github.com/eslint/eslint/issues/2557
/*global clients*/

// TODO: Lodash
var findInArray = function (array, fn) {
    for (var i = array.length - 1; i >= 0; i--) {
        var value = array[i];
        if (fn(value)) return value;
    }
};

// TODO: Tidy up
var notificationData;

self.addEventListener('push', function (event) {
    // TODO: var url
    var mobileNotificationsWebHost = 'http://localhost:9000';
    event.waitUntil(
        fetch(mobileNotificationsWebHost + '/messages/web/latest')
            .then(function (x) { return x.json(); })
            .then(function (data) {
                // Warning: mutation!
                notificationData = {
                    title: data.message,
                    url: data.link,
                    body: '',
                    tag: 'breaking-news',
                    // TODO:
                    icon: '/images/icon-192x192.png'
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
