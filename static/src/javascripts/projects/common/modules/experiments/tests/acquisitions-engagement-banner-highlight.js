// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';

const componentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';
const abTestName = 'AcquisitionsEngagementBannerHighlight';

export const AcquisitionsEngagementBannerHighlight: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    start: '2018-05-25',
    expiry: '2018-06-06',
    author: 'Jonathan Rankin',
    description:
        'Tests a CTA message that aims to push people towards recurring contributions',
    audience: 1,
    audienceOffset: 0,
    audienceCriteria: 'All US transaction web traffic.',
    successMeasure: 'AV 2.0',
    idealOutcome: 'Increase in overall AV, and AV from recurring',
    componentType,
    showForSensitive: true,
    canRun: () => true,

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'highlight',
            options: {
                engagementBannerParams: {
                    bannerModifierClass: 'highlight-test',
                },
            },
        },
    ]),
};
