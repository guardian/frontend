define([
    'bonzo',
    'qwery',
    'common/utils/ajax-promise'
], function (
    bonzo,
    qwery,
    ajax
) {

    function userAdFeedback(pagePath, adSlotId, creativeid, reason) {
        // TODO: This. Better.
        if (reason !== 'ad-feedback-menu-opened') {
            return recordUserAdFeedback(pagePath, adSlotId, creativeid, reason)
        }
    }

    function recordUserAdFeedback(pagePath, adSlotId, creativeId, feedbackType) {
        var feedbackUrl = 'https://j2cy9stt59.execute-api.eu-west-1.amazonaws.com/prod/adFeedback';
        // TODO: get stage from config?
        var data = JSON.parse('{"stage":"CODE", "adPage":"'+pagePath+'", "adSlotId":"'+adSlotId+'", "adCreativeId":"'+creativeId+'", "adFeedback":"'+feedbackType+'"}');
        return ajax({
            url: feedbackUrl,
            method: 'post',
            data: data,
            type: 'html',
            crossOrigin: true,
            error: function(err) {
                // TODO: remove this
                console.log('feedback write failed for ' + pagePath + '.' + adSlotId + '.' + creativeId + ': '  + err)
            },
            success: function(resp) {
                // TODO: remove this
                console.log('feedback write succeeded for ' + pagePath + '.' + adSlotId + '.' + creativeId + ': ' + resp)
            },
            complete: function(resp) {
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
