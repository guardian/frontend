// @flow

import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import { acquisitionsBannerSignInCtaTemplate } from 'common/modules/commercial/templates/acquisitions-banner-sign-in-cta';
import { getUrl } from 'common/modules/identity/api';
import { isBreakpoint } from 'lib/detect';

// Only display on desktop since we want to validate test hypothesis as quickly as possible.
// Running on tablet and mobile would require more design since baaner already takes up maximum space allowed on these devices.
const canRun: () => boolean = () => isBreakpoint({ min: 'desktop' });

// TODO: does this need to be percent encoded? https://en.wikipedia.org/wiki/Percent-encoding
const signInUrl: string = `${getUrl() || ''}/signin?returnUrl=${
    document.location.href
}`;

export const acquisitionsBannerSignInCta: AcquisitionsABTest = {
    id: 'AcquisitionsBannerSignInCta',
    campaignId: '2019-05-29_acquisitions_banner_sign_in_cta',
    start: '2019-05-29',
    expiry: '2019-06-05', // Jesse recommended to run for a week and then review to see if we want to extend further.
    author: 'Guy Dawson',
    description:
        'test whether having a sign-in CTA negatively impacts acquisitions',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'Desktop only',
    idealOutcome: 'a sign-in CTA does not decrease AV per impression',
    canRun,
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    variants: [
        {
            id: 'control',
            test: (): void => {}, // membership-engagement-banner.js is responsible for displaying the banner
            engagementBannerParams: {
                template: acquisitionsBannerControlTemplate,
            },
        },
        {
            id: 'sign-in-cta',
            test: (): void => {}, // membership-engagement-banner.js is responsible for displaying the banner
            engagementBannerParams: {
                template: acquisitionsBannerSignInCtaTemplate,
                signInUrl,
            },
        },
    ],
};
