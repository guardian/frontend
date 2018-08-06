// @flow

import {
    isEpicDisplayable,
    defaultMaxViews,
} from 'common/modules/commercial/contributions-utilities';
import {
    displayControlEpic,
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
                displayControlEpic().then(trackEpic);
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
