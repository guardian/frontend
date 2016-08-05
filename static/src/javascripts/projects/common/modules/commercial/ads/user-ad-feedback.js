define([
    'bonzo',
    'qwery',
    'fastdom',
    'common/utils/fetch',
    'common/utils/config'
], function (
    bonzo,
    qwery,
    fastdom,
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
        }).then(
            function () { return onComplete(adSlotId, feedbackType); },
            function () { return onComplete(adSlotId, feedbackType); }
        );
    };

    function onComplete(adSlotId, feedbackType) {    // we're complete - update the UI
        if (feedbackType !== 'ad-feedback-menu-opened') {
            fastdom.write(function() {
                bonzo(qwery('#' + adSlotId + '>.ad-slot__label')).text('Advertisement (Thanks for your feedback)');
            });
        }
    }

});
