define([
    'bonzo',
    'fastdom'
], function (bonzo, fastdom) {
    return emptyAdvert;

    function emptyAdvert(advert) {
        advert.isEmpty = true;
        fastdom.write(function () {
            window.googletag.destroySlots([advert.slot]);
            bonzo(advert.node).remove();
            advert.node = advert.slot = null;
        });
    }
});
