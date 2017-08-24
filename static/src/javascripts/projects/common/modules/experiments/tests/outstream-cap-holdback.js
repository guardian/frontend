// @flow
import { trackAdRender } from 'commercial/modules/dfp/track-ad-render';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { Advert } from 'commercial/modules/dfp/Advert';

const videoInlineimpression = (complete) => {
    const advertId = 'dfp-ad--inline1';

    trackAdRender(advertId).then( () => {
        const inlineAdvert : Advert = getAdvertById(advertId);
        if (inlineAdvert) {
            const loadedSize = inlineAdvert.size;
            if ( (loadedSize[0] === 620 && loadedSize[1] === 350) ||
                 (loadedSize[0] === 620 && loadedSize[1] === 1)) {
                // Notify ab-ophan module that a video impression was completed.
                // Teads and outstream formats can be either 620x350 or 620x1 size.
                complete();
            }
        }
    });
};

export const outstreamFrequencyCapHoldback: ABTest = {
    id: 'OutstreamFrequencyCap',
    start: '2017-08-24',
    expiry: '2017-11-01',
    author: 'Richard Nguyen',
    description:
        'This test adds a hold-back variant which retains a frequency cap on outstream video format ads.',
    audience: 0.4,
    audienceOffset: 0.6,
    successMeasure:
        'No change in user engagement; average page views per session, page views per user over a sustained test period',
    audienceCriteria: 'All web traffic.',
    dataLinkNames: '',
    idealOutcome:
        'We discover that removing the frequency cap on outstream ads has no significant impact on user engagement',
    canRun: () => true,
    variants: [
        {
            id: 'frequency-cap',
            test: () => {},
            impression: videoInlineimpression,
        },
        {
            id: 'control',
            test: () => {},
            impression: videoInlineimpression,
        },
    ],
};