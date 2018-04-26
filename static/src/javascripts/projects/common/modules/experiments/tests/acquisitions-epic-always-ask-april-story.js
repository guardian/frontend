// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { keywordExists } from 'lib/page';

const abTestName = 'AcquisitionsEpicAlwaysAskAprilStory';

export const acquisitionsEpicAlwaysAskAprilStory: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-04-17',
    expiry: '2018-06-05',

    author: 'Jonathan Rankin',
    description: 'Always ask on this specific story',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Always ask on this story',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    canRun: () => keywordExists(['The Daphne Project']),

    variants: [
        {
            id: 'always_ask',
            products: [],
            options: {
                isUnlimited: true,
            },
        },
    ],
});
