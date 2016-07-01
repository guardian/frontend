define([
    'bonzo',
    'fastdom'
], function (bonzo, fastdom) {
    return hideAdvert;

    function hideAdvert(advert) {
        advert.isHidden = true;
        fastdom.write(function () {
            bonzo(advert.node).remove();
            advert.node = null;
        });
    }
});
