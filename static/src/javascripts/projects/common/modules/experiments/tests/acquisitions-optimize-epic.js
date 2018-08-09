// @flow

import {
    isEpicDisplayable,
    defaultMaxViews,
} from 'common/modules/commercial/contributions-utilities';
import {
    displayControlEpicInAbTest,
    trackEpic,
} from 'common/modules/commercial/epic/epic-utils';
import { displayOptimizeEpic } from 'common/modules/commercial/epic/optimize-epic-utils';

const epicOptimizeTest: ABTest = {
    id: 'AcquisitionsEpicOptimizeAATest',
    campaignId: 'epic_optimize_aa_test',
    start: '2018-07-31',
    expiry: '2019-07-31',
    author: 'Guy Dawson',
    description:
        'Bootstrap the AB testing framework to display the Epic using Google Optimize',
    successMeasure: 'AV2.0',
    idealOutcome:
        'Serving the Epic through Optimize does not lead to a drop in revenue',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    canRun: isEpicDisplayable,
    variants: [
        {
            id: 'control',
            options: {
                maxViews: defaultMaxViews,
            },
            test: () => {
                displayControlEpicInAbTest({
                    // This is the id of the Google Analytics experiment currently running against the Epic.
                    // Using this means that the 3 variants (the frontend variant, and the 2 Optimize variants),
                    // will be reported under the same test name.
                    name: 'LR3RQO-bRVmYQ8I_UBQJew',
                    variant: 'frontend_native_epic',
                }).then(trackEpic);
            },
        },
        {
            id: 'optimize',
            options: {
                maxViews: defaultMaxViews,
            },
            test: () => {
                displayOptimizeEpic().then(trackEpic);
            },
        },
    ],
};

const acquisitionsEpicOptimizeAATest: AcquisitionsABTest = (epicOptimizeTest: any);

export { acquisitionsEpicOptimizeAATest };
