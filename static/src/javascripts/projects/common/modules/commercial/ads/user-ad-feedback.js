define([
    'bonzo',
    'qwery'
], function (
    bonzo,
    qwery
) {

    function userAdFeedback(pagePath, adSlotId, creativeid, reason) {
        recordUserAdFeedback(pagePath, adSlotId, creativeid, reason);
        // TODO: This. Better.
        if (reason !== 'ad-feedback-menu-opened') {
            var adSlot = bonzo(qwery('#' + adSlotId));
            adSlot.each(function (ad) {
                for (var i = 0; i < ad.children.length; i++) {
                    if (ad.children[i].classList.contains('ad-slot__label')) {
                        ad.children[i].innerHTML = 'Advertisement (Thanks for your feedback)';
                    }
                }
            });
        }
    }

    function recordUserAdFeedback(pagePath, adSlotId, creativeId, feedbackType) {
        // TODO: swap console.log for AWS lambda call.
        console.log('feedback received: ' + pagePath + '.' + adSlotId + '.' + creativeId + ' reason: ' + feedbackType);
    }

    return userAdFeedback;

});
