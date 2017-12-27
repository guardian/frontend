// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';

export const AcquisitionsBannerJustContribute: AcquisitionsABTest = {
    id: 'AcquisitionsBannerJustContribute',
    campaignId: 'banner_just_contribute',
    start: '2017-12-20',
    expiry: '2018-01-30',
    author: 'Joseph Smith',
    description:
        'Test linking to a contributions-only version of support.theguardian.com',
    successMeasure: 'AV 2.0 per impression',
    idealOutcome: 'Makes more money',
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    audienceCriteria: 'All',
    locations: ['GB'],
    audience: 1,
    audienceOffset: 0,
    canRun: () => true,

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'just_contribute',
            options: {
                engagementBannerParams: {
                    linkUrl:
                        'https://support.theguardian.com/uk?bundle=contribute',
                },
            },
        },
    ]),
};
