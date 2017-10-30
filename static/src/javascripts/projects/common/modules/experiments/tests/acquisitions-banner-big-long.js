// @flow
import { noop } from 'lib/noop';
import { acquisitionsBannerBigTemplate } from 'common/modules/commercial/templates/acquisitions-banner-big';

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

    variants: [
        {
            id: 'control',
            test: noop,
        },
        {
            id: 'big',
            test: noop,
            options: {
                engagementBannerParams: {
                    template: acquisitionsBannerBigTemplate,
                },
            },
        },
    ],
};
