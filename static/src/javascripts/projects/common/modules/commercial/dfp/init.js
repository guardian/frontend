define([
    'Promise',
    'qwery',
    'bonzo',
    'raven',
    'common/utils/fastdom-promise',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/build-page-targeting',
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/on-slot-render',
    'common/modules/commercial/dfp/private/PrebidService',
    'common/modules/commercial/dfp/private/ophan-tracking'
], function (Promise, qwery, bonzo, raven, fastdom, commercialFeatures, buildPageTargeting, dfpEnv, onSlotRender, PrebidService, ophanTracking) {
    /* renderStartTime: integer. Point in time when DFP kicks in */

    return init;

    function init() {
        if (commercialFeatures.dfpAdvertising) {
            setupAdvertising();
            return Promise.resolve();
        }

        return fastdom.write(function () {
            bonzo(qwery(dfpEnv.adSlotSelector)).remove();
        });
    }

    function setupAdvertising() {
        // if we don't already have googletag, create command queue and load it async
        if (!window.googletag) {
            window.googletag = { cmd: [] };
            // load the library asynchronously
            require(['js!googletag.js'], function(){
                var timer = new Date().getTime();
                ophanTracking.advertCheckpoint('GPT Downloaded',  timer );
            });
        }

        if (dfpEnv.prebidEnabled) {
            dfpEnv.prebidService = new PrebidService();
        }

        window.googletag.cmd.push = raven.wrap({ deep: true }, window.googletag.cmd.push);

        window.googletag.cmd.push(
            setListeners,
            setPageTargeting
        );


        ophanTracking.init();
    }

    function setListeners() {

        ophanTracking.trackPerformance(window.googletag);


        window.googletag.pubads().addEventListener('slotRenderEnded', raven.wrap(onSlotRender));
    }

    function setPageTargeting() {
        var targeting = buildPageTargeting();
        Object.keys(targeting).forEach(function (key) {
            window.googletag.pubads().setTargeting(key, targeting[key]);
        });
    }
});
