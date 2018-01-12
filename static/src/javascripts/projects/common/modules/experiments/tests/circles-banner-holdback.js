// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';

export const ColourTestBannerHoldback: AcquisitionsABTest = {
    id: 'ColourTestBannerHoldback',
    campaignId: 'colour_test_banner_holdback',
    start: '2018-01-12',
    expiry: '2018-02-15',
    author: 'Ap0c',
    description: 'A holdback for the banner colour changes',
    successMeasure: 'Who knows',
    idealOutcome: 'No drop-off in conversions either way',
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    audienceCriteria: 'All',
    audience: 0.7,
    audienceOffset: 0,
    // Should always be true, because the banner shows regardless.
    showForSensitive: true,
    canRun: () => true,

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'variant',
            options: {
                engagementBannerParams: {
                    bannerModifierClass: 'circles-banner-holdback',
                },
            },
        },
    ]),
};
