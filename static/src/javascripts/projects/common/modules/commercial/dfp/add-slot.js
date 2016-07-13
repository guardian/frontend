define([
    'common/utils/mediator',
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/Advert',
    'common/modules/commercial/dfp/private/queue-advert',
    'common/modules/commercial/dfp/private/load-advert',
    'common/modules/commercial/dfp/private/enable-lazy-load',
    'common/modules/commercial/dfp/private/ophan-tracking'
], function (mediator, dfpEnv, Advert, queueAdvert, loadAdvert, enableLazyLoad, ophanTracking) {
    return addSlot;

    function addSlot(adSlot) {
        adSlot = adSlot instanceof HTMLElement ? adSlot : adSlot[0];

        if (dfpEnv.firstAdDisplayed && !(adSlot.id in dfpEnv.advertIds)) { // dynamically add ad slot
            // this is horrible, but if we do this before the initial ads have loaded things go awry
            if (dfpEnv.firstAdRendered) {
                displayAd(adSlot);
            } else {
                mediator.once('modules:commercial:dfp:rendered', function () {
                    displayAd(adSlot);
                });
            }
        }
    }

    function displayAd(adSlot) {
        var advert = Advert(adSlot);
        ophanTracking.updateAdvertMetric(advert, 'loadingMethod', 'add-slot');

        dfpEnv.adverts.push(advert);
        queueAdvert(advert);
        if (dfpEnv.shouldLazyLoad()) {
            enableLazyLoad();
        } else {
            loadAdvert(advert);
        }
    }
});
