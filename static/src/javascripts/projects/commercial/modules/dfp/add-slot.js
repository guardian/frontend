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
        window.googletag.cmd.push(function () {
            if (!(adSlot.id in dfpEnv.advertIds)) { // dynamically add ad slot
                displayAd(adSlot, forceDisplay);
            }
        });
    }

    function displayAd(adSlot, forceDisplay) {
        var advert = Advert(adSlot);

        dfpEnv.advertIds[advert.id] = dfpEnv.adverts.push(advert) - 1;
        if (dfpEnv.shouldLazyLoad() && !forceDisplay) {
            queueAdvert(advert);
            performanceLogging.updateAdvertMetric(advert, 'loadingMethod', 'add-slot-lazy');
            enableLazyLoad(advert);
        } else {
            performanceLogging.updateAdvertMetric(advert, 'loadingMethod', 'add-slot-instant');
            performanceLogging.updateAdvertMetric(advert, 'lazyWaitComplete', 0);
            loadAdvert(advert);
        }
    }
});
