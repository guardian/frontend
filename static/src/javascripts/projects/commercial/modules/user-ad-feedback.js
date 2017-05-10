define([
    'qwery',
    'fastdom',
    'lib/fetch',
    'lib/config',
    'lib/detect'
], function (
    qwery,
    fastdom,
    fetch,
    config,
    detect
) {

    return function recordUserAdFeedback(pagePath, adSlotId, slotRenderEvent, feedbackType, comment) {
        var feedbackUrl = 'https://j2cy9stt59.execute-api.eu-west-1.amazonaws.com/prod/adFeedback';
        var stage = config.page.isProd ? 'PROD' : 'CODE';
        var ua = detect.getUserAgent;
        var breakPoint = detect.getBreakpoint();

        var data = {
            stage: stage,
            page: pagePath,
            adSlotId: adSlotId,
            creativeId: slotRenderEvent.sourceAgnosticCreativeId.toString(),
            lineId: slotRenderEvent.sourceAgnosticLineItemId.toString(),
            feedback: feedbackType,
            comment: comment,
            browser: ua.browser.toString() + ua.version.toString(),
            breakPoint: breakPoint
        };

        return fetch(feedbackUrl, {
            method: 'post',
            body: JSON.stringify(data),
            mode: 'cors'
        }).then(
            onComplete.bind(this, adSlotId),
            onComplete.bind(this, adSlotId)
        );
    };

    function onComplete(adSlotId) {    // we're complete - update the UI
        fastdom.write(function() {
            var label = document.querySelector('#' + adSlotId + '>.ad-slot__label');
            if (label) {
                label.classList.add('feedback-submitted');
            }
        });
    }

});
