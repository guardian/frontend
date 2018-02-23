// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import { getSync as getGeoLocation } from 'lib/geolocation';

const targetUrl = () => {
    const fromGeo = getGeoLocation();
    if (fromGeo === 'US') return 'https://support.theguardian.com/us/contribute';
    if (fromGeo === 'GB') return 'https://support.theguardian.com/uk/contribute';
    return 'https://support.theguardian.com/';
};

export const SupportEngagementBannerCircles: AcquisitionsABTest = {
    id: 'SupportEngagementBannerCircles',
    campaignId: 'gdnwb_copts_memco_sandc_circles',
    start: '2018-02-21',
    expiry: '2018-03-13', // Tues 13th March (but should be complete by the 8th)
    author: 'JustinPinner',
    description: 'Partition the audience for support frontend circles test',
    successMeasure: 'N/A',
    idealOutcome:
        'We channel the audience from dotcom to support frontend correctly',
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    audienceCriteria: 'Entire UK and US',
    audience: 1,
    audienceOffset: 0,
    showForSensitive: true,
    canRun: () => getGeoLocation() === 'US' || getGeoLocation() === 'GB',

    variants: makeBannerABTestVariants([
        {
            id: 'variant',
            options: {
                engagementBannerParams: {
                    linkUrl: targetUrl(),
                },
            },
        },
        {
            id: 'control',
        },
    ]),
};
