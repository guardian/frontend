// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';

export const CirclesBannerHoldback: AcquisitionsABTest = {
    id: 'CirclesBannerHoldback',
    campaignId: 'circles_banner_holdback',
    start: '2018-01-05',
    expiry: '2018-02-15',
    author: 'Ap0c',
    description: 'A holdback for the banner colour changes',
    successMeasure: 'Who knows',
    idealOutcome: 'No drop-off in conversions either way',
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    audienceCriteria: 'All',
    audience: 0.1,
    audienceOffset: 0,
    canRun: () => true,

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'holdback',
        },
    ]),
};