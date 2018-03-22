// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import {
    getSupporterPaymentRegion as geolocationGetSupporterPaymentRegion,
    getSync as geolocationGetSync,
} from 'lib/geolocation';

const componentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';
const abTestName = 'AcquisitionsEngagementBannerRowSupport';
const INTsupportURL = 'https://support.theguardian.com/int';

export const AcquisitionsEngagementBannerRowSupport: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    start: '2018-03-01',
    expiry: '2018-05-24',
    author: 'Santiago Villa Fernandez',
    description:
        'Points the "support the guardian" link in the engagement banner to the aud version of the support site',
    audience: 1,
    audienceOffset: 0,
    audienceCriteria: 'All INT transaction web traffic.',
    successMeasure: 'AV 2.0',
    idealOutcome:
        'We channel the audience from dotcom to support frontend int correctly',
    componentType,
    showForSensitive: true,
    canRun: () =>
        geolocationGetSupporterPaymentRegion(geolocationGetSync()) === 'INT',

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'support_contribute',
            options: {
                engagementBannerParams: {
                    linkUrl: INTsupportURL,
                    buttonCaption: 'Support The Guardian',
                },
            },
        },
    ]),
};
