// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import { getSync as getGeoLocation } from 'lib/geolocation';

export const AcquisitionsBannerCtaContribute: AcquisitionsABTest = {
    id: 'AcquisitionsBannerCtaContribute',
    campaignId: 'acquisitions-banner-cta-contribute',
    start: '2018-02-14',
    expiry: '2018-03-14',
    author: 'jranks123',
    description: 'A banner cta test',
    successMeasure: 'AV per impression',
    idealOutcome: 'New cta wins',
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    // Should always be true, because the banner shows regardless.
    showForSensitive: true,
    canRun: () => getGeoLocation() === 'US' || getGeoLocation() === 'GB',

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'contribute_cta',
            options: {
                engagementBannerParams: {
                    buttonCaption: 'Make a contribution',
                },
            },
        },
    ]),
};
