define([
    'common/modules/analytics/beacon',
    'common/utils/config'
], function (
    beacon,
    config
) {

    var testKey = 'gu.deleteMe',
        data, iterations, i, local, session;

    function getFunctionalityLevel(storage) {
        if (storage) {
            // good
            try {
                data = '1234567890';
                iterations = 10;
                for (i = 0; i < iterations; i++) {
                    data += data + data;
                }
                storage.setItem(testKey, data);
                storage.removeItem(testKey);
                return 'supported';
            } catch (e) {
                return 'broken';
            }
        } else {
            return 'unsupported';
        }
    }

    return {
        run: function () {
            if (config.switches.storageStats) {
                local = getFunctionalityLevel(window.localStorage);
                session = getFunctionalityLevel(window.sessionStorage);
                beacon.fire('/counts.gif?c=localStorage-' + local + '&c=sessionStorage-' + session);
            }
        }
    };

});
