// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import { getSync as getGeoLocation } from 'lib/geolocation';

const ctaText =
    getGeoLocation() === 'US'
        ? 'Support the Guardian from as little as $1.'
        : 'Support the Guardian from as little as £1.';

export const AcquisitionsBannerJustOnePound: AcquisitionsABTest = {
    id: 'AcquisitionsBannerJustOnePound',
    campaignId: 'banner_just_one',
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
    canRun: () => getGeoLocation() === 'US' || getGeoLocation() === 'GB',

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'just_one',
            options: {
                engagementBannerParams: {
                    ctaText,
                },
            },
        },
    ]),
};
