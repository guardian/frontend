// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { keywordExists } from 'lib/page';

const abTestName = 'AcquisitionsEpicCambridgeAnalyticaAlwaysAsk';

export const acquisitionsEpicCambridgeAnalyticaAlwaysAsk: EpicABTest = makeABTest(
    {
        id: abTestName,
        campaignId: abTestName,

        start: '2018-03-20',
        expiry: '2018-04-10',

        author: 'Jonathan Rankin',
        description:
            'This test aims to measure the impact of placing an ever-present ask on "moment" stories',
        successMeasure: 'Conversion rate',
        idealOutcome:
            'We learn the impact of placing an ever-present ask on "moment" stories',

        audienceCriteria: 'All',
        audience: 0.2,
        audienceOffset: 0,
        canRun: () => keywordExists(['Cambridge Analytica']),

        variants: [
            {
                id: 'control',
                products: [],
            },
            {
                id: 'always_ask',
                products: [],
                options: {
                    isUnlimited: true,
                },
            },
        ],
    }
);
