// @flow

import { isBreakpoint } from 'lib/detect';
import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import { acquisitionsBannerMobileDesignTestTemplate } from 'common/modules/commercial/templates/acquisitions-banner-mobile-design-test';
import {getSync as geolocationGetSync} from "lib/geolocation";

const mobileHeader: string = `We chose a different approach.<br/>Will you support it?`;
const mobileBody: string = `Unlike many news organisations, we made a choice to keep all of our independent, investigative reporting free and available for everyone. We believe that each of us, around the world, deserves access to accurate information with integrity at its heart. At a time when factual reporting is critical, support from our readers is essential in safeguarding The Guardian’s editorial independence. This is our model for open, independent journalism.`;

export const contributionsGlobalMobileBannerDesign: AcquisitionsABTest = {
    id: 'ContributionsGlobalMobileBannerDesign',
    campaignId: '2019-04-30_contributions_global_mobile_banner_design',
    start: '2019-04-30',
    expiry: '2019-05-30',
    author: 'Joshua Lieberman',
    description: 'test new mobile design on standard acquisitions banner',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'variant design performs at least as well as control',
    canRun: () =>
        isBreakpoint({
            max: 'mobileLandscape',
        }),
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    geolocation: geolocationGetSync(),
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                template: acquisitionsBannerControlTemplate,
            },
        },
        {
            id: 'variant',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                leadSentence: mobileHeader,
                messageText: mobileBody,
                template: acquisitionsBannerMobileDesignTestTemplate,
            },
        },
    ],
};
