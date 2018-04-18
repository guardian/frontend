// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

export const acquisitionsEpicNativeVsDfp = makeABTest({
    id: 'AcquisitionsEpicNativeVsDfp',
    campaignId: 'epic_native_vs_dfp',
    start: '2018-04-19',
    expiry: '2018-05-19', // TODO
    author: 'Guy Dawson',
    description: 'See if there is any difference in annualised value between serving the Epic natively vs DFP',
    successMeasure: 'AV2.0',
    idealOutcome: 'There is no difference between these two methods of serving the Epic',
    audienceCriteria: 'All',
    audience: 1, // TODO
    audienceOffset: 0, // TODO
    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION'],
        },
        {
            id: 'dfp',
            products: ['CONTRIBUTION'],
        }
    ]
});
