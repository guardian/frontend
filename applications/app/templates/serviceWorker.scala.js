@()

/*eslint quotes: [2, "single"], curly: [2, "multi-line"], strict: 0*/
/*eslint-env browser*/
/*global self*/
/*global clients*/

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
                    icon: '@{JavaScript(Static("images/favicons/notification.png").path)}'
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

