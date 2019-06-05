// @flow

import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import { acquisitionsBannerSignInCtaTemplate } from 'common/modules/commercial/templates/acquisitions-banner-sign-in-cta';
import { getUrl, isUserLoggedIn } from 'common/modules/identity/api';
import { isBreakpoint } from 'lib/detect';
import { constructQuery } from 'lib/url';

// Only display on desktop since we want to validate test hypothesis as quickly as possible.
// Running on tablet and mobile would require more design since banner already takes up maximum space allowed on these devices.
// Only show to users that aren't signed in, since the non-control variant has a CTA to sign in.
const canRun: () => boolean = () =>
    isBreakpoint({ min: 'desktop' }) && !isUserLoggedIn();

const signInUrl: () => string = () => {
    const signInQueryParams = {
        // Include profile specific AB test query parameters to track sign-in on profile.
        abName: 'AcquisitionsBannerSignInCta',
        abVariant: 'sign-in-cta',
        returnUrl: document.location.href,
    };
    return `${getUrl() || ''}/signin?${constructQuery(signInQueryParams)}`;
};

export const acquisitionsBannerSignInCta: AcquisitionsABTest = {
    id: 'AcquisitionsBannerSignInCta',
    campaignId: '2019-05-29_acquisitions_banner_sign_in_cta',
    start: '2019-06-04',
    expiry: '2019-06-11', // Jesse recommended to run for a week and then review to see if we want to extend further.
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
                signInUrl: signInUrl(),
            },
        },
    ],
};
