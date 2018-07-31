import  { displayDefaultOptimizeEpic } from 'common/modules/commercial/epic/optimize-epic-utils';
import { isEpicDisplayable } from 'common/modules/commercial/contributions-utilities';

import type { ABTest } from 'common/modules/commercial/acquisitions-ophan';

const epicOptimizeTest: ABTest = {
    id: 'AcquisitionsEpicOptimizeTest',
    campaignId: 'epic_optimize_test',
    start: '2018-07-31',
    expiry: '2019-07-31',
    author: 'Guy Dawson',
    description:
        'Bootstrap the AB testing framework to display the Epic using Google Optimize',
    successMeasure: 'AV2.0',
    idealOutcome:
        'We are able to test the Epic using Google Optimize',
    audienceCriteria: 'All',
    audience: 1, // FIXME
    audienceOffset: 0, // FIXME
    canRun: isEpicDisplayable,
    variants: [
        {
            id: 'control',
            options: {
                isUnlimited: true,
            },
            test: () => {
                displayDefaultOptimizeEpic()
            }
        }
    ]
};

const acquisitionsEpicOptimizeTest: AcquisitionsABTest = (epicOptimizeTest: any);

export { acquisitionsEpicOptimizeTest }
