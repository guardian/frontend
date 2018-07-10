// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { keywordExists } from 'lib/page';

const abTestName = 'AcquisitionsEpicThailandCave';

export const acquisitionsEpicThailandCave: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-07-09',
    expiry: '2018-08-09',

    author: 'Emma Milner',
    description: 'Always show the epic on Thailand cave stories (unlimited)',
    successMeasure: 'Conversion rate',
    idealOutcome: 'We convert lots of readers',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    canRun: () => keywordExists(['Thailand cave rescue']),

    variants: [
        {
            id: 'control',
            products: [],
            options: {
                isUnlimited: true,
            },
        },
    ],
});
