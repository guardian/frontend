// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import { getSync as getGeoLocation } from 'lib/geolocation';
import { supportTestURL } from 'common/modules/commercial/support-utilities';

export const SupportEngagementBannerCircles: AcquisitionsABTest = {
    id: 'SupportEngagementBannerCircles',
    campaignId: 'gdnwb_copts_memco_sandc_circles',
    start: '2018-02-21',
    expiry: '2018-03-20', // Tues 20th March (was expected to be complete by the 8th)
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
                    linkUrl: supportTestURL('sandc_circles'),
                },
            },
        },
        {
            id: 'control',
        },
    ]),
};
