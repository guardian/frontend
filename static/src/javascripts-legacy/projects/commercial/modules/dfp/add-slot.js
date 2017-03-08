define([
    'lib/mediator',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/Advert',
    'commercial/modules/dfp/queue-advert',
    'commercial/modules/dfp/load-advert',
    'commercial/modules/dfp/enable-lazy-load',
    'commercial/modules/dfp/performance-logging'
], function (mediator, dfpEnv, Advert, queueAdvert, loadAdvert, enableLazyLoad, performanceLogging) {
    return addSlot;

    function addSlot(adSlot, forceDisplay) {
        adSlot = adSlot instanceof HTMLElement ? adSlot : adSlot[0];

        if (dfpEnv.firstAdDisplayed && !(adSlot.id in dfpEnv.advertIds)) { // dynamically add ad slot
            // this is horrible, but if we do this before the initial ads have loaded things go awry
            if (dfpEnv.firstAdRendered) {
                displayAd(adSlot, forceDisplay);
            } else {
                mediator.once('modules:commercial:dfp:rendered', function () {
                    displayAd(adSlot, forceDisplay);
                });
            }
        }
    }

    function displayAd(adSlot, forceDisplay) {
        var advert = Advert(adSlot);

        dfpEnv.adverts.push(advert);
        queueAdvert(advert);
        if (dfpEnv.shouldLazyLoad() && !forceDisplay) {
            performanceLogging.updateAdvertMetric(advert, 'loadingMethod', 'add-slot-lazy');
            enableLazyLoad(advert);
        } else {
            performanceLogging.updateAdvertMetric(advert, 'loadingMethod', 'add-slot-instant');
            performanceLogging.updateAdvertMetric(advert, 'lazyWaitComplete', 0);
            loadAdvert(advert);
        }
    }
});
