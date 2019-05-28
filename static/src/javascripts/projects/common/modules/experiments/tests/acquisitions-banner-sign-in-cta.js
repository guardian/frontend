// @flow

import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import { acquisitionsBannerSignInCtaTemplate } from 'common/modules/commercial/templates/acquisitions-banner-sign-in-cta';

export const acquisitionsBannerSignInCta: AcquisitionsABTest = {
    id: 'AcquisitionsBannerSignInCta',
    campaignId: '2019-05-16_acquisitions_banner_sign_in_cta',
    start: '2019-05-15', // TODO
    expiry: '2019-05-30', // TODO
    author: 'Guy Dawson',
    description:
        'test whether having a sign-in CTA negatively impacts acquisitions',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'Desktop only',
    idealOutcome: 'a sign-in CTA does not decrease AV per impression',
    canRun: () => true, // TODO
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    variants: [
        {
            id: 'control',
            test: (): void => {},
            engagementBannerParams: {
                template: acquisitionsBannerControlTemplate,
            },
        },
        {
            id: 'sign-in-cta',
            test: (): void => {},
            engagementBannerParams: {
                template: acquisitionsBannerSignInCtaTemplate,
            },
        },
    ],
};
