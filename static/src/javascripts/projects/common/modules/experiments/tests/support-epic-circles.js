// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { getSync as getGeoLocation } from 'lib/geolocation';
import { supportTestURL } from 'common/modules/commercial/support-utilities';

export const supportEpicCircles = makeABTest({
    id: 'SupportEpicCircles',
    campaignId: 'sandc_circles',

    start: '2018-02-21',
    expiry: '2018-03-20', // Tues 20th March (was expected to be complete by the 8th)

    author: 'Justin Pinner',
    description:
        'Use the Epic to partition the audience for the support circles test',
    successMeasure: 'N/A',
    idealOutcome:
        'We channel an even split of frontend traffic into the circles version of support',
    audienceCriteria: 'Entire UK and US',
    audience: 1,
    audienceOffset: 0,
    canRun: () => getGeoLocation() === 'US' || getGeoLocation() === 'GB',

    variants: [
        {
            id: 'variant',
            products: [],
            options: {
                supportBaseURL: supportTestURL('sandc_circles'),
            },
        },
        {
            id: 'control',
            products: [],
        },
    ],
});
