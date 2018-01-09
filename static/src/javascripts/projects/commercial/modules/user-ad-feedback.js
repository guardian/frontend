// @flow
import fastdom from 'fastdom';
import fetch from 'lib/fetch';
import config from 'lib/config';
import { getUserAgent, getBreakpoint } from 'lib/detect';
import type { SlotRenderEndedEvent } from 'commercial/types';

const onComplete = adSlotId => {
    // we're complete - update the UI
    fastdom.write(() => {
        const label = document.querySelector(`#${adSlotId}>.ad-slot__label`);
        if (label) {
            label.classList.add('feedback-submitted');
        }
    });
};

const recordUserAdFeedback = function(
    pagePath: string,
    adSlotId: string,
    slotRenderEndedEvent: SlotRenderEndedEvent,
    feedbackType: string
): Promise<void> {
    const feedbackUrl =
        'https://j2cy9stt59.execute-api.eu-west-1.amazonaws.com/prod/adFeedback';
    const stage = config.page.isProd ? 'PROD' : 'CODE';
    const ua = getUserAgent;
    const breakPoint = getBreakpoint();

    const data = {
        stage,
        page: pagePath,
        adSlotId,
        creativeId: slotRenderEndedEvent.creativeId,
        lineId: slotRenderEndedEvent.lineItemId,
        feedback: feedbackType,
        browser:
            typeof ua === 'object'
                ? ua.browser.toString() + ua.version.toString()
                : undefined,
        breakPoint,
    };

    return fetch(feedbackUrl, {
        method: 'post',
        body: JSON.stringify(data),
        mode: 'cors',
    }).then(() => onComplete(adSlotId), () => onComplete(adSlotId));
};

export { recordUserAdFeedback };
