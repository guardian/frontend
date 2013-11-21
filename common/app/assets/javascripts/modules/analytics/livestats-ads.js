/*global Event:true */
define(function () {

    var LiveStatsAds = function (config) {

        var c = config || {},
            url = config.beaconUrl,
            path = config.beaconName || '/ad.gif',
            body = document.body,
            createImage = function(url) {
                var image = new Image();
                image.id = 'js-livestats-ads';
                image.className = 'u-h';
                image.src = url;
                body.appendChild(image);
            },
            makeUrl = function(properties) {
                var query = [];
                for (var name in properties) {
                    query.push(name + '=' + encodeURIComponent(properties[name]));
                }
                return path + '?' + query.join('&');
            },
            log = function(params) {
                url += makeUrl(params);
                createImage(url);
            };

        return {
            log: log
        };

    };

    return LiveStatsAds;
});
