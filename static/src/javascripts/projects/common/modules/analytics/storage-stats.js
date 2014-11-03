define([
    'common/utils/config',
    'common/modules/analytics/beacon'
], function (
    config,
    beacon
) {

    var testKey = 'gu.deleteMe',
        data, iterations, i, local, session;

    function getFunctionalityLevel(storage) {
        if (storage) {
            try {
                // arbitrary non-trivial chunk of data to see if it works
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
        gather: function () {
            if (config.switches.storageStats) {
                local = getFunctionalityLevel(window.localStorage);
                session = getFunctionalityLevel(window.sessionStorage);
                beacon.fire('/counts.gif?c=localStorage-' + local + '&c=sessionStorage-' + session);
            }
        }
    };

});
