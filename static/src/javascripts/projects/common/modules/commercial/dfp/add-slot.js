define([
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/create-advert',
    'common/modules/commercial/dfp/private/queue-advert',
    'common/modules/commercial/dfp/private/lazy-load',
    'common/modules/commercial/dfp/dfp-obj',
    'common/utils/mediator'
], function (dfpEnv, createAdvert, queueAdvert, lazyLoad, dfp, mediator) {
    dfp.addSlot = addSlot;
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
        var advert = createAdvert(adSlot);
        dfpEnv.adverts.push(advert);
        queueAdvert(advert);
        if (lazyLoad.shouldLazyLoad()) {
            lazyLoad.enableLazyLoad();
        } else {
            lazyLoad.loadAdvert(advert);
        }
    }
});
