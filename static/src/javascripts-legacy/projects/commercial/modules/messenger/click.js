define([
    'common/modules/analytics/google',
    'commercial/modules/messenger'
], function (google, messenger) {
    messenger.register('click', function (linkName, ret, iframe) {
        return sendClick(iframe.closest('.js-ad-slot') || { id: 'unknown' }, linkName);
    });

    return sendClick;

    function sendClick(adSlot, linkName) {
        google.trackNativeAdLinkClick(adSlot.id, linkName);
    }
});
