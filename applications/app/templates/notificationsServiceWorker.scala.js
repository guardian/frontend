@()

/*eslint quotes: [2, "single"], curly: [2, "multi-line"], strict: 0*/
/*eslint-env browser*/
/*global self*/
/*global clients*/

self.addEventListener('install', function (event) {
    event.waitUntil(updateCache());
});

//TODO cib self for this
self.addEventListener('activate', function (event) {
    console.log("++ Activated: ", event);
});

self.addEventListener('push', function(event) {
    console.log('Push event recieved');
});

self.addEventListener('notificationClick', function(event) {
    console.log('Notification event tag: ', event.notification.tag);
});
