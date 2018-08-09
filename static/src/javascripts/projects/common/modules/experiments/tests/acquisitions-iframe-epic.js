// @flow

import {
    isEpicDisplayable,
    defaultMaxViews,
} from 'common/modules/commercial/contributions-utilities';
import {
    displayControlEpicInAbTest,
    trackEpic,
} from 'common/modules/commercial/epic/epic-utils';
import { displayIframeEpic } from 'common/modules/commercial/epic/iframe-epic-utils';

const epicIframeTest: ABTest = {
    id: 'AcquisitionsEpicIframeTest',
    campaignId: 'epic_iframe_test',
    start: '2018-07-31',
    expiry: '2019-07-31',
    author: 'Joseph Smith',
    description:
        'Test displaying the Epic inside an iframe (with no Google javascript running)',
    successMeasure: 'AV2.0',
    idealOutcome:
        'Serving the Epic inside an iframe does not lead to a drop in revenue',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    canRun: isEpicDisplayable,
    variants: [
        {
            id: 'not_iframe',
            options: {
                maxViews: defaultMaxViews,
            },
            test: () => {
                displayControlEpicInAbTest({
                    // Name corresponds to test name hard coded in the tracking link in the epic:
                    // https://support.theguardian.com/epic/iframe-or-not-test/index.html
                    name: 'iframe_or_not',
                    variant: 'not_iframe',
                }).then(trackEpic);
            },
        },
        {
            id: 'iframe',
            options: {
                maxViews: defaultMaxViews,
            },
            test: () => {
                displayIframeEpic({
                    url:
                        'https://support.theguardian.com/epic/iframe-or-not-test/index.html',
                    sendFonts: false,
                    abTestVariant: {
                        name: 'iframe_or_not',
                        variant: 'iframe',
                    },
                }).then(trackEpic);
            },
        },
    ],
};

const acquisitionsEpicIframeTest: AcquisitionsABTest = (epicIframeTest: any);

export { acquisitionsEpicIframeTest };
