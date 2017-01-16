define([
    'Promise',
    'qwery',
    'bonzo',
    'common/utils/raven',
    'common/utils/config',
    'common/utils/fastdom-promise',
    'common/modules/commercial/commercial-features',
    'commercial/modules/build-page-targeting',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/on-slot-render',
    'commercial/modules/dfp/on-slot-load',
    'commercial/modules/dfp/prepare-sonobi-tag',
    'commercial/modules/dfp/performance-logging',
    'common/utils/load-script',

    // These are cross-frame protocol messaging routines:
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
    fastdom,
    commercialFeatures,
    buildPageTargeting,
    dfpEnv,
    onSlotRender,
    onSlotLoad,
    prepareSonobiTag,
    performanceLogging,
    loadScript
) {
    return {
        init: init,
        customTiming: true
    };

    function init(moduleName) {

        function moduleEnd() {
            performanceLogging.moduleEnd(moduleName);
        }

        function setupAdvertising() {
            // Use Custom Timing to time the googletag code without the sonobi pre-loading.
            performanceLogging.moduleStart(moduleName);

            performanceLogging.addTag(dfpEnv.sonobiEnabled ? 'sonobi' : 'waterfall');

            window.googletag.cmd.push(
                setListeners,
                setPageTargeting,
                moduleEnd
            );

            // Return a promise that resolves after the async work is done.
            // Just load googletag. Sonobi's wrapper will already be loaded, and googletag is already added to the window by sonobi.
            return loadScript(config.libs.googletag)
                .then(function(){
                    return new Promise(function(resolve){
                        window.googletag.cmd.push(
                            resolve
                        );
                    });
                });
        }

        if (commercialFeatures.dfpAdvertising) {
            return prepareSonobiTag.init().then(setupAdvertising)
            // A promise error here, from a failed module load,
            // could be a network problem or an intercepted request.
            // Abandon the init sequence.
            .catch(removeAdSlots);
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
