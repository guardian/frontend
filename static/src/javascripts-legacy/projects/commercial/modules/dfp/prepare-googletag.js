define([
    'qwery',
    'lib/raven',
    'lib/config',
    'lib/load-script',
    'lib/fastdom-promise',
    'commercial/modules/commercial-features',
    'commercial/modules/build-page-targeting',
    'commercial/modules/close-disabled-slots',
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
    qwery,
    raven,
    config,
    loadScript,
    fastdom,
    commercialFeatures,
    buildPageTargeting,
    closeSlots,
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
            return loadScript.loadScript(config.libs.googletag, { async: false });
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
        var targeting = buildPageTargeting.buildPageTargeting();
        Object.keys(targeting).forEach(function (key) {
            pubads.setTargeting(key, targeting[key]);
        });
    }

    function removeAdSlots() {
        return closeSlots.init(true);
    }
});
