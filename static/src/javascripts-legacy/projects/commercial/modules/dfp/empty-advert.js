define([
    'fastdom'
], function (fastdom) {
    return emptyAdvert;

    function emptyAdvert(advert) {
        fastdom.write(function () {
            window.googletag.destroySlots([advert.slot]);
            advert.node.remove();
            advert.node = advert.slot = null;
        });
    }
});
