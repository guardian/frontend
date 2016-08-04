define([
    'bonzo',
    'qwery',
    'common/utils/fetch'
], function (
    bonzo,
    qwery,
    fetch
) {

    function userAdFeedback(pagePath, adSlotId, creativeid, reason) {
        // TODO: This. Better.
        if (reason !== 'ad-feedback-menu-opened') {
            return recordUserAdFeedback(pagePath, adSlotId, creativeid, reason);
        } else {
            return recordUserAdFeedback(pagePath, adSlotId, creativeid, 'ad-feedback-menu-opened');
        }
    }

    function recordUserAdFeedback(pagePath, adSlotId, creativeId, feedbackType) {
        var feedbackUrl = 'https://j2cy9stt59.execute-api.eu-west-1.amazonaws.com/prod/adFeedback';
        // TODO: get stage from config?
        var data = '{"stage":"CODE", "adPage":"'+pagePath+'", "adSlotId":"'+adSlotId+'", "adCreativeId":"'+creativeId+'", "adFeedback":"'+feedbackType+'"}';
        return fetch(feedbackUrl, {
            method: 'post',
            body: data,
            mode: 'cors'
        }).then(function() {    // ignore the response
        }).catch(function() {    // ignore any errors
        }).then(function() {    // we're complete - update the UI
            if (feedbackType !== 'ad-feedback-menu-opened') {
                var adSlot = bonzo(qwery('#' + adSlotId));
                adSlot.each(function (ad) {
                    for (var i = 0; i < ad.children.length; i++) {
                        if (ad.children[i].classList.contains('ad-slot__label')) {
                            ad.children[i].innerHTML = 'Advertisement (Thanks for your feedback)';
                        }
                    }
                });
            }
        });
    }

    return userAdFeedback;

});
