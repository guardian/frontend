// @flow

import {
    defaultMaxViews,
    isEpicDisplayable,
} from 'common/modules/commercial/contributions-utilities';
import {
    displayControlEpic,
    trackEpic,
} from 'common/modules/commercial/epic-utils';

import type { ABTestVariant } from 'common/modules/commercial/acquisitions-ophan';

const testName = 'AcquisitionsEpicNativeVsDfpV2';

const variantOptions = {
    maxViews: defaultMaxViews,
};

const dfpVariant: ABTestVariant = {
    name: testName,
    variant: 'dfp',
};

const epicNativeVsDfpV2: ABTest = {
    id: testName,
    campaignId: 'epic_native_vs_dfp_v2',
    start: '2018-06-20',
    expiry: '2018-07-04',
    author: 'Guy Dawson',
    description:
        'See if there is any difference in annualised value between serving the Epic natively vs DFP',
    successMeasure: 'AV2.0',
    idealOutcome:
        'There is no difference between these two methods of serving the Epic',
    audienceCriteria: 'All',
    audience: 0.1,
    audienceOffset: 0,
    canRun: isEpicDisplayable,
    variants: [
        {
            id: 'control',
            test: () => {
                displayControlEpic({
                    name: testName,
                    variant: 'control',
                }).then(trackEpic);
            },
            options: variantOptions,
        },
        {
            id: dfpVariant.variant,
            // The Epic in this variant is loaded by the function initDFPEpicSlot()
            test: () => {},
            options: variantOptions,
        },
    ],
};

const acquisitionsEpicNativeVsDfpV2 = ((epicNativeVsDfpV2: any): AcquisitionsABTest);

export { dfpVariant, acquisitionsEpicNativeVsDfpV2 };
