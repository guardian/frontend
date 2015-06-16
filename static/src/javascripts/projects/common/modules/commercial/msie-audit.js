define([
    'bonzo',
    'common/utils/$',
    'common/utils/config',
    'common/modules/analytics/beacon',
    'common/utils/detect',
    'common/utils/_'
], function (
    bonzo,
    $,
    config,
    beacon,
    detect,
    _
) {

    function init() {
        if (!config.switches.msieAudit) {
            return false;
        }

        // if I am MSIE, send a beacon
        if (detect.getUserAgent.browser === 'MSIE') {
            (_.once(function () {
                beacon.beaconCounts('msie-browser');
            })());

            (_.delay(function () {
                if (detect.adblockInUse) {
                    beacon.beaconCounts('msie-adblock');
                }
            }, 3000));
        }

        // then set a timer to send ad detection beacon after 2 seconds
    }

    return {

        init: init

    };

});
