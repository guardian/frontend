define([
    'common/utils/cookies',
    'common/utils/storage',
    'common/modules/analytics/beacon',
    'common/modules/experiments/ab'
], function (
    Cookies,
    storage,
    beacon,
    ab
) {
    var newSession;

    function isNewSession() {
        var key = 'gu.session';

        if (typeof(newSession) !== 'undefined') {
            return newSession;
        }

        if (storage.session.get(key)) {
            newSession = false;
        } else {
            storage.session.set(key, 'true');
            newSession = true;
        }

        return newSession;
    }

    function makeUrl(properties, path) {
        var query = [];
        for (var name in properties) {
            query.push(name + '=' + encodeURIComponent(properties[name]));
        }
        return path + '?' + query.join('&');
    }

    var liveStats = {

        log : function (config) {

            // Also log views and sessions for each participating ab test.
            var abValues = ab.getAbLoggableObject(config);

            if (isNewSession()) {
                abValues.type = 'session';
            } else {
                abValues.type = 'view';
            }
            beacon.fire(makeUrl(abValues, '/ab.gif'));
        }
    };

    return liveStats;
});
