define([
    'bonzo',
    'qwery',
    'common/utils/fetch',
    'common/utils/config'
], function (
    bonzo,
    qwery,
    fetch,
    config
) {

    return function recordUserAdFeedback(pagePath, adSlotId, creativeId, feedbackType) {
        var feedbackUrl = 'https://j2cy9stt59.execute-api.eu-west-1.amazonaws.com/prod/adFeedback';
        var stage = config.page.isProd ? 'PROD' : 'CODE';
        var data = JSON.stringify({
            stage: stage,
            adPage: pagePath,
            adSlotId: adSlotId,
            adCreativeId: creativeId.toString(),
            adFeedback: feedbackType
        });
        return fetch(feedbackUrl, {
            method: 'post',
            body: data,
            mode: 'cors'
        }).then(onComplete(adSlotId, feedbackType), function(){})
    };

    function onComplete(adSlotId, feedbackType) {    // we're complete - update the UI
        if (feedbackType !== 'ad-feedback-menu-opened') {
            bonzo(qwery('#' + adSlotId + '>.ad-slot__label')).text('Advertisement (Thanks for your feedback)');
        }
    }

});
