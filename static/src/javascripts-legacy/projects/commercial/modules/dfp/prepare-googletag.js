define([
    'Promise',
    'qwery',
    'bonzo',
    'common/utils/raven',
    'common/utils/config',
    'common/utils/load-script',
    'common/utils/fastdom-promise',
    'commercial/modules/commercial-features',
    'commercial/modules/build-page-targeting',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/on-slot-render',
    'commercial/modules/dfp/on-slot-load',
    'commercial/modules/dfp/performance-logging',

    // These are cross-frame protocol messaging routines:
    'commercial/modules/messenger/type',
    'commercial/modules/messenger/get-stylesheet',
    'commercial/modules/messenger/resize',
    'commercial/modules/messenger/scroll',
    'commercial/modules/messenger/viewport',
    'commercial/modules/messenger/click',
    'commercial/modules/messenger/background'
], function (
    Promise,
    qwery,
    bonzo,
    raven,
    config,
    loadScript,
    fastdom,
    commercialFeatures,
    buildPageTargeting,
    dfpEnv,
    onSlotRender,
    onSlotLoad,
    performanceLogging
) {

    return {
        init: init
    };

    function init(start, stop) {

        function setupAdvertising() {

            performanceLogging.addTag(dfpEnv.sonobiEnabled ? 'sonobi' : 'waterfall');

            window.googletag.cmd.push(
                start,
                setListeners,
                setPageTargeting,
                stop
            );

            // Just load googletag. Sonobi's wrapper will already be loaded, and googletag is already added to the window by sonobi.
            return loadScript(config.libs.googletag, { async: false });
        }

        if (commercialFeatures.dfpAdvertising) {
            setupAdvertising()
            // A promise error here, from a failed module load,
            // could be a network problem or an intercepted request.
            // Abandon the init sequence.
            .catch(removeAdSlots);
            return Promise.resolve();
        }

        return removeAdSlots();
    }

    function setListeners() {
        performanceLogging.setListeners(window.googletag);

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

    function removeAdSlots() {
        return fastdom.write(function () {
            bonzo(qwery(dfpEnv.adSlotSelector)).remove();
        });
    }

});
