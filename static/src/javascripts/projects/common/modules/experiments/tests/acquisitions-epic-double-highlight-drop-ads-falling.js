// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import {
    doubleHighlightCopy,
    dropAdsFallingCopy,
} from 'common/modules/commercial/acquisitions-copy';

const abTestName = 'AcquisitionsEpicDoubleHighlightDropAdsFalling';

export const AcquisitionsEpicDoubleHighlightDropAdsFalling: EpicABTest = makeABTest(
    {
        id: abTestName,
        campaignId: abTestName,

        start: '2018-05-18',
        expiry: '2018-06-05',

        author: 'Jonathan Rankin',
        description:
            'Try 2 variants - one adding a double highlight and one removing the ads falling line',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Both variants beat the control',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        variants: [
            {
                id: 'control',
                products: [],
            },
            {
                id: 'double_highlight',
                products: [],
                options: {
                    copy: doubleHighlightCopy,
                },
            },
            {
                id: 'drop_ads_falling',
                products: [],
                options: {
                    copy: dropAdsFallingCopy,
                },
            },
        ],
    }
);
