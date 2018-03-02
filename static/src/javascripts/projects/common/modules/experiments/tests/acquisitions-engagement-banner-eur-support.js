// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import {
    getSupporterPaymentRegion as geolocationGetSupporterPaymentRegion,
    getSync as geolocationGetSync,
} from 'lib/geolocation';

const componentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';
const abTestName = 'AcquisitionsEngagementBannerEurSupport';
const EURsupportURL = 'https://support.theguardian.com/eu';

export const AcquisitionsEngagementBannerEurSupport: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    start: '2018-03-01',
    expiry: '2018-04-17',
    author: 'Santiago Villa Fernandez',
    description:
        'Points the "support the guardian" link in the engagement banner to the eur version of the support site',
    audience: 1,
    audienceOffset: 0,
    audienceCriteria: 'All EUR transaction web traffic.',
    successMeasure: 'AV 2.0',
    idealOutcome:
        'We channel the audience from dotcom to support frontend eu correctly',
    componentType,
    showForSensitive: true,
    canRun: () =>
        geolocationGetSupporterPaymentRegion(geolocationGetSync()) === 'EU',

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'support_contribute',
            options: {
                engagementBannerParams: {
                    linkUrl: EURsupportURL,
                    buttonCaption: 'Support The Guardian',
                },
            },
        },
    ]),
};
