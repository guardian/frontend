define([
    'common/utils/config'
], function (
    config
) {
    // For the moment, we're just deferring to the switch state
    var hideAds = config.switches.advertOptOut;

    return {
        hideAds : hideAds
    };
});
