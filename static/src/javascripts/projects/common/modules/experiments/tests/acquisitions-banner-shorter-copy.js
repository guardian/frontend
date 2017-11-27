// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import { engagementBannerCopyShorter } from 'common/modules/commercial/membership-engagement-banner-parameters';

export const AcquisitionsBannerShorterCopy: AcquisitionsABTest = {
    id: 'AcquisitionsBannerShorterCopy',
    campaignId: 'banner_shorter_copy',
    start: '2017-11-24',
    expiry: '2018-12-13',
    author: 'Jonathan Rankin',
    description: 'Test a shorter banner copy variant',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Acquires many Supporters',
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    canRun: () => true,

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'shorter',
            options: {
                engagementBannerParams: {
                    messageText: engagementBannerCopyShorter(),
                },
            },
        },
    ]),
};
