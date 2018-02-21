// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';

export const SupportEngagementBannerCircles: AcquisitionsABTest = {
    id: 'SupportEngagementBannerCircles',
    campaignId: 'TBC-TBC-TBC',
    start: '2018-03-15',
    expiry: '2018-03-30',
    author: 'JustinPinner',
    description: 'Partition the audience for support frontend circles test',
    successMeasure: 'N/A',
    idealOutcome:
        'We channel the audience from dotcom to support frontend correctly',
    audience: 1,
    audienceOffset: 0,
    showForSensitive: true,
    canRun: () => true,

    variants: makeBannerABTestVariants([
        {
            id: 'variant',
            options: {
                engagementBannerParams: {
                    campaignCode: 'gdnwb_copts_memco_sandc_circles_variant',
                },
            },
        },
        {
            id: 'control',
            options: {
                engagementBannerParams: {
                    campaignCode: 'gdnwb_copts_memco_sandc_circles_control',
                },
            },
        },
    ]),
};
