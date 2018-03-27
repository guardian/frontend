// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { keywordExists } from 'lib/page';
import { cambridgeCopy } from 'common/modules/commercial/acquisitions-copy';

const abTestName = 'AcquisitionsEpicCambridgeAnalyticaAlwaysAskFinal';

export const acquisitionsEpicCambridgeAnalyticaAlwaysAskFinal: EpicABTest = makeABTest(
    {
        id: abTestName,
        campaignId: abTestName,

        start: '2018-03-20',
        expiry: '2018-04-10',

        author: 'Jonathan Rankin',
        description: 'Always ask on Cambridge analytica stories',
        successMeasure: 'Conversion rate',
        idealOutcome:
            'We learn the impact of placing an ever-present ask on "moment" stories',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,
        canRun: () => keywordExists(['Cambridge Analytica']),

        variants: [
            {
                id: 'always_ask',
                products: [],
                options: {
                    copy: cambridgeCopy,
                    testimonialBlock: '',
                    isUnlimited: true,
                },
            },
        ],
    }
);
