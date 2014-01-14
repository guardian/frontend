define([
    'common/utils/cookies',
    'common/modules/experiments/ab'
], function (
    Cookies,
    ab
) {
    function isNewSession() {
        var key = 'gu.session';
        if (window.sessionStorage && !!window.sessionStorage.getItem(key)) {
            return false;
        } else {
            window.sessionStorage.setItem(key, "true");
            return true;
        }
    }

    function createImage(url, id) {
        var image = new Image();
        image.id = id;
        image.className = 'u-h';
        image.src = url;
        document.body.appendChild(image);
    }

    function makeUrl(properties, path) {
        var query = [];
        for (var name in properties) {
            query.push(name + '=' + encodeURIComponent(properties[name]));
        }
        return path + '?' + query.join('&');
    }

    var liveStats = {

        log : function (beacon, config) {

            if (config.switches.liveStats) {
                var inAlphaTest = !!Cookies.get('GU_ALPHA');

                if (inAlphaTest) {
                    var liveStatsView = {platform: 'responsive'};

                    if (isNewSession()) {
                        liveStatsView.type = 'session';
                    } else {
                        liveStatsView.type = 'view';
                    }
                    var url = beacon.beaconUrl + makeUrl(liveStatsView, '/px.gif');
                    createImage(url, 'js-livestats-px');
                }
            }

            if (config.switches.liveAbTestStats) {
                // Also log views and sessions for each participating ab test.
                var abValues = ab.getAbLoggableObject(config);

                if (isNewSession()) {
                    abValues.type = 'session';
                } else {
                    abValues.type = 'view';
                }

                var abUrl = beacon.beaconUrl + makeUrl(abValues, '/ab.gif');
                createImage(abUrl, 'js-livestats-ab');
            }
        }
    };

    return liveStats;
});
