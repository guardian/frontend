define([
    'bonzo',
    'qwery'
], function (
    bonzo,
    qwery
) {

    function userAdFeedback(pagePath, adSlotId, creativeid, reason) {
        // TODO: swap console.log for ophan (or other) call.
        console.log('feedback received: ' + pagePath + '.' + adSlotId + '.' + creativeid + ' reason: ' + reason);
        // TODO: Activate some ophan call when we work out what to do!
        var adSlot = bonzo(qwery('#' + adSlotId));
        adSlot.each(function (ad) {
            for (var i = 0; i < ad.children.length; i++) {
                if (ad.children[i].classList.contains('ad-slot__label')) {
                    ad.children[i].innerHTML = 'Advertisement (Thanks for your feedback)';
                }
            }
        });
    }

    return userAdFeedback;

});
