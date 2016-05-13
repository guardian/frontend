define([
    'common/utils/config',
    'common/modules/analytics/beacon'
], function (config, beacon) {

    return {
        init: init
    };

    function init() {
        if (config.switches.commercialAudit) {
            window.addEventListener('message', receiveMessage, false);
        }

    }

    function receiveMessage(event) {
        var message = event.data || '';

        if (message.indexOf('Tracker beacon:') === 0) {
          var variantName = message.split(':')[1];
          beacon.beaconCounts(variantName);
        }
        return;
    }
});
