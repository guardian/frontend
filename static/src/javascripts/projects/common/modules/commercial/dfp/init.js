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
    'common/modules/commercial/dfp/private/on-slot-load',
    'common/modules/commercial/dfp/private/PrebidService',
    'common/modules/commercial/dfp/private/ophan-tracking',

    // These are cross-frame protocol messaging routines:
    'common/modules/commercial/dfp/private/get-stylesheet'
], function (Promise, qwery, bonzo, raven, fastdom, commercialFeatures, buildPageTargeting, dfpEnv, onSlotRender, onSlotLoad, PrebidService, ophanTracking) {


    return init;

    function init() {
        if (commercialFeatures.dfpAdvertising) {
            return setupAdvertising();
        }

        return fastdom.write(function () {
            bonzo(qwery(dfpEnv.adSlotSelector)).remove();
        });
    }

    function setupAdvertising() {

        return new Promise(function(resolve) {
            // if we don't already have googletag, create command queue and load it async
            if (!window.googletag) {
                window.googletag = {cmd: []};
                // load the library asynchronously
                require(['js!googletag.js']);
            }

            if (dfpEnv.prebidEnabled) {
                dfpEnv.prebidService = new PrebidService();
            }

            window.googletag.cmd.push = raven.wrap({deep: true}, window.googletag.cmd.push);

            window.googletag.cmd.push(
                setListeners,
                setPageTargeting,
                resolve
            );
        });
    }

    function setListeners() {
        ophanTracking.trackPerformance(window.googletag);

        var pubads = window.googletag.pubads();
        pubads.addEventListener('slotRenderEnded', raven.wrap(onSlotRender));
        pubads.addEventListener('slotOnload', raven.wrap(onSlotLoad));
    }

    function setPageTargeting() {
        var pubads = window.googletag.pubads();
        var targeting = buildPageTargeting();
        Object.keys(targeting).forEach(function (key) {
            pubads.setTargeting(key, targeting[key]);
        });
    }
});
