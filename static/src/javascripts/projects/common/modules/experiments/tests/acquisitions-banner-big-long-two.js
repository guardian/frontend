// @flow
import { acquisitionsBannerBigTemplate } from 'common/modules/commercial/templates/acquisitions-banner-big';
import { acquisitionsBannerLongTemplate } from 'common/modules/commercial/templates/acquisitions-banner-long';
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';

export const AcquisitionsBannerBigLongTwo: AcquisitionsABTest = {
    id: 'AcquisitionsBannerBigLongTwo',
    campaignId: 'banner_big_long_two',
    start: '2017-10-26',
    expiry: '2018-11-27',
    author: 'Jonathan Rankin',
    description: 'Tests 2 new banner variants',
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
            id: 'big',
            options: {
                engagementBannerParams: {
                    template: acquisitionsBannerBigTemplate,
                },
            },
        },
        {
            id: 'long',
            options: {
                engagementBannerParams: {
                    template: acquisitionsBannerLongTemplate,
                },
            },
        },
    ]),
};
