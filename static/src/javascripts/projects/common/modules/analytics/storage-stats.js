define([
    'common/modules/analytics/beacon',
    'common/utils/config'
], function (
    beacon,
    config
) {

    var testKey = 'gu.deleteMe';

    function getFunctionalityLevel(storage) {
        if (storage) {
            // good
            try {
                var data = '1234567890';
                var iterations = 10;
                for (var i = 0; i < iterations; i++) {
                    data += data+data;
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
        run: function() {
            if (config.switches.storageStats) {
                var local = getFunctionalityLevel(window.localStorage);
                var session = getFunctionalityLevel(window.sessionStorage);
                beacon.fire('/counts.gif?c=localStorage-' + local + '&c=sessionStorage-' + session);
            }
        }
    };

});
