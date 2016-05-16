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
        var probe = 'Tracker beacon:';
        if (typeof message !== 'string') {
            return;
        }

        if (message.indexOf(probe) === 0) {
          var variantName = message.substring(probe.length);
          beacon.beaconCounts(variantName);
        }
    }
});
