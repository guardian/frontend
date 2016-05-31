define([
    'tpl!common/views/commercial/tracking-pixel.html'
], function (
    trackingPixelTpl
) {
    function addTrackingPixel($adSlot, url) {
        $adSlot.before(trackingPixelTpl({ url: encodeURI(url) }));
    }

    return addTrackingPixel;
});
