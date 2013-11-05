/*global Event:true */
define(['modules/storage'], function (storage) {

    var LiveStats = function (config) {

        var c = config || {},
            url = config.beaconUrl,
            path = '/px.gif',
            body = document.body,
            sessionLength = 1,
            isNewSession = function () {
                var history = storage.get('gu.history');
                var sessionStart = new Date();
                sessionStart.setMinutes(sessionStart.getMinutes() - sessionLength);
                return (history) ? (history[0].timestamp < sessionStart) : false;
            },
            createImage = function(url) {
                var image = new Image();
                image.id = 'js-err';
                image.className = 'u-h';
                image.src = url;
                body.appendChild(image);
            },
            makeUrl = function(properties) {
                var query = [];
                for (var name in properties) {
                    query.push(name + '=' + encodeURIComponent(properties[name]));
                }
                return url + path + '?' + query.join('&');
            },
            log = function() {
                if (isNewSession()) {
                    makeUrl({ name: 'livestats', views: isNewSession() });
                    createImage(url);
                }
            };

        return {
            log: log
        };

    };

    return LiveStats;
});
