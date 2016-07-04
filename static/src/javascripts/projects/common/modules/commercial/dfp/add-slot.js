define([
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/Advert',
    'common/modules/commercial/dfp/private/queue-advert',
    'common/modules/commercial/dfp/private/lazy-load',
    'common/utils/mediator'
], function (dfpEnv, Advert, queueAdvert, lazyLoad, mediator) {
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
        dfpEnv.adverts.push(advert);
        queueAdvert(advert);
        if (lazyLoad.shouldLazyLoad()) {
            lazyLoad.enableLazyLoad();
        } else {
            lazyLoad.loadAdvert(advert);
        }
    }
});
