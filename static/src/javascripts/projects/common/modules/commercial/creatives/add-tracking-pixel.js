define([
    'common/utils/template',
    'text!common/views/commercial/tracking-pixel.html'
], function (
    template,
    trackingPixelStr
) {
    var trackingPixelTpl;
    function addTrackingPixel($adSlot, url) {
        if (!trackingPixelTpl) {
            trackingPixelTpl = template(trackingPixelStr);
        }
        $adSlot.before(trackingPixelTpl({ url: encodeURI(url) }));
    }

    return addTrackingPixel;
});
