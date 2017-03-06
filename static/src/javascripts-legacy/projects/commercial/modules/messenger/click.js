define([
    'lib/closest',
    'common/modules/analytics/google',
    'commercial/modules/messenger'
], function (closest, google, messenger) {
    messenger.register('click', function (linkName, ret, iframe) {
        return sendClick(closest(iframe, '.js-ad-slot') || { id: 'unknown' }, linkName);
    });

    return sendClick;

    function sendClick(adSlot, linkName) {
        google.trackNativeAdLinkClick(adSlot.id, linkName);
    }
});
