// @flow

import { isBreakpoint } from 'lib/detect';
import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import { acquisitionsBannerMobileDesignTestTemplate } from 'common/modules/commercial/templates/acquisitions-banner-mobile-design-test';

const mobileHeader: string = `The Guardian is editorially independent...`;
const mobileBody: string = `...our journalism is free from the influence of billionaire owners or politicians. No one edits our editor. No one steers our opinion.  This means we can pursue difficult investigations, challenging the powerful and holding them to account. And unlike many others, we have chosen an approach that allows us to keep our journalism open and accessible to all, regardless of where they live or what they can afford. But we depend on voluntary contributions from readers to keep working as we do.`;

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
