/*global Event:true */
define([
    'utils/cookies'
], function (
    Cookies
) {

    var Session = function () {
        
        var key = 'gu.session',
            isNewSession = function () {
                if (window.sessionStorage && !!window.sessionStorage.getItem(key)) {
                    return false;
                } else {
                    window.sessionStorage.setItem(key, "true");
                    return true;
                }
            };

        return {
            isNewSession: isNewSession
        };
    };

    var LiveStats = function (config) {

        var c = config || {},
            url = config.beaconUrl,
            path = config.beaconName || '/px.gif',
            inAlphaTest = !!Cookies.get('GU_ALPHA'),
            body = document.body,
            platform = 'responsive',
            sessionLength = 30,
            createImage = function(url) {
                var image = new Image();
                image.id = 'js-livestats';
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
            log = function() {
                if (!inAlphaTest) {
                    return false;
                }
                if (new Session().isNewSession()) {
                    url += makeUrl({ type: 'session', platform: platform });
                } else {
                    url += makeUrl({ type: 'view', platform: platform });
                }
                createImage(url);
            };

        return {
            log: log
        };

    };

    return LiveStats;
});
