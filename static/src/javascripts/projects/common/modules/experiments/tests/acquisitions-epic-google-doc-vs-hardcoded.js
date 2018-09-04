// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { articleCopy } from 'common/modules/commercial/acquisitions-copy';

const abTestName = 'AcquisitionsEpicGoogleDocVsHardcoded';

export const acquisitionsEpicGoogleDocVsHardcoded: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-04-17',
    expiry: '2019-06-05',

    author: 'Joseph Smith',
    description: 'Test copy fetched from a Google Doc',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Alternative copy makes more money than the control',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    variants: [
        {
            id: 'control_which_means_from_google_doc',
            products: [],
        },
        {
            id: 'hardcoded',
            products: [],
            options: {
                copy: articleCopy,
            },
        },
    ],
});
