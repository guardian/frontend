// @flow
import { acquisitionsBannerBigTemplate } from 'common/modules/commercial/templates/acquisitions-banner-big';
import { acquisitionsBannerLongTemplate } from 'common/modules/commercial/templates/acquisitions-banner-long';
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';

export const AcquisitionsBannerBigLong: AcquisitionsABTest = {
    id: 'AcquisitionsBannerBigLong',
    campaignId: 'banner_big_long',
    start: '2017-10-26',
    expiry: '2018-11-12',
    author: 'Jonathan Rankin',
    description:
        'This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days',
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
