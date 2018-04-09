// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import {
    getSupporterCountryGroup as geolocationGetSupporterPaymentRegion,
    getSync as geolocationGetSync,
} from 'lib/geolocation';

const componentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';
const abTestName = 'AcquisitionsEngagementBannerAudSupport';
const AUDsupportURL = 'https://support.theguardian.com/au';

export const AcquisitionsEngagementBannerAudSupport: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    start: '2018-03-01',
    expiry: '2018-04-24',
    author: 'Santiago Villa Fernandez',
    description:
        'Points the "support the guardian" link in the engagement banner to the aud version of the support site',
    audience: 1,
    audienceOffset: 0,
    audienceCriteria: 'All AUD transaction web traffic.',
    successMeasure: 'AV 2.0',
    idealOutcome:
        'We channel the audience from dotcom to support frontend au correctly',
    componentType,
    showForSensitive: true,
    canRun: () =>
        geolocationGetSupporterPaymentRegion(geolocationGetSync()) ===
        'AUDCountries',

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'support_contribute',
            options: {
                engagementBannerParams: {
                    linkUrl: AUDsupportURL,
                    buttonCaption: 'Support The Guardian',
                },
            },
        },
    ]),
};
