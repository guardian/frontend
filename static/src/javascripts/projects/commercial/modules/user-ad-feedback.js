// @flow
import fastdom from 'fastdom';
import fetch from 'lib/fetch';
import config from 'lib/config';
import detect from 'lib/detect';

const onComplete = function(adSlotId) {
    // we're complete - update the UI
    fastdom.write(() => {
        const label = document.querySelector(`#${adSlotId}>.ad-slot__label`);
        if (label) {
            label.classList.add('feedback-submitted');
        }
    });
};

const recordUserAdFeedback = function(
    pagePath,
    adSlotId,
    slotRenderEvent,
    feedbackType,
    comment
) {
    const feedbackUrl =
        'https://j2cy9stt59.execute-api.eu-west-1.amazonaws.com/prod/adFeedback';
    const stage = config.page.isProd ? 'PROD' : 'CODE';
    const ua = detect.getUserAgent;
    const breakPoint = detect.getBreakpoint();

    const data = {
        stage,
        page: pagePath,
        adSlotId,
        creativeId: slotRenderEvent.sourceAgnosticCreativeId.toString(),
        lineId: slotRenderEvent.sourceAgnosticLineItemId.toString(),
        feedback: feedbackType,
        comment,
        browser: ua.browser.toString() + ua.version.toString(),
        breakPoint,
    };

    return fetch(feedbackUrl, {
        method: 'post',
        body: JSON.stringify(data),
        mode: 'cors',
    }).then(onComplete.bind(this, adSlotId), onComplete.bind(this, adSlotId));
};

export { recordUserAdFeedback };
