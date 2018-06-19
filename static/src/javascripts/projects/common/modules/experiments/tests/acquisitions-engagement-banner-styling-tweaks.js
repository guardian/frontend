// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import { acquisitionsBannerTemplateOldStyling } from 'common/modules/commercial/templates/acquisitions-banner-old-styling';

const componentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';
const abTestName = 'AcquisitionsEngagementBannerStylingTweaks';

export const AcquisitionsEngagementBannerStylingTweaks: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    start: '2018-06-18',
    expiry: '2018-08-18',
    author: 'Joseph Smith',
    description: 'Tests some styling tweaks',
    audience: 1,
    audienceOffset: 0,
    audienceCriteria: 'All',
    successMeasure: 'AV 2.0',
    idealOutcome: 'Increase in overall AV',
    componentType,
    showForSensitive: true,
    canRun: () => true,

    variants: makeBannerABTestVariants([
        {
            id: 'control'
        },
        {
            id: 'old_styling',
            options: {
                engagementBannerParams: {
                    bannerModifierClass: 'membership-prominent',
                    template: acquisitionsBannerTemplateOldStyling,
                },
            },
        },
    ]),
};
