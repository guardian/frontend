// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

import { acquisitionsBannerCovidTemplate } from 'common/modules/commercial/templates/acquisitions-banner-covid';

const geolocation = geolocationGetSync();
const isUSorAU = geolocation === 'US' || geolocation === 'AU';

// Shared parameters:
const titles = [`Trust has never`, `mattered more`];
const ctaText = 'Contribute';

// Shared but geospecific parameters:
const secondaryLinkLabel = isUSorAU ? undefined : `Subscribe`;

// Variant-specific parameters:
const controlLeadSentence = `Thanks to your support we can continue to provide our vital reporting – in times of crisis and beyond. `;
const accuracyLeadSentence = `Thanks to your support we can continue to provide accurate, independent news and calm explanation. `;
const openLeadSentence = `Thanks to your support we can continue to provide quality, independent reporting that’s open to readers across the world. `;

const controlMessageText = `Millions of readers across the world are visiting the Guardian every day for open, independent, accurate journalism. Trusted news has never been so important, and neither has your support.`;
const accuracyMessageText = `No matter how uncertain the future feels, you can rely on us. Quality journalism can help us all make critical decisions about our lives, health and security – based on fact, not fiction. Trusted news has never been so important, and neither has your support.`;
const openMessageText = `We keep our journalism free from a paywall because we believe everyone deserves equal access to accurate news and calm explanation. Trusted news has never been so important, and neither has your support.`;

export const contributionsCovidBannerRoundOne: AcquisitionsABTest = {
    id: 'ContributionsCovidBannerRoundOne',
    campaignId: 'covid_banner_1',
    start: '2020-03-26',
    expiry: '2020-06-26',
    author: 'Joshua Lieberman',
    description: 'custom banner for the public health crisis',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'to learn about copy from how variants perform vs control',
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    canRun: () => true,
    geolocation,
    variants: [
        {
            id: 'control',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText: controlMessageText,
                leadSentence: controlLeadSentence,
                ctaText,
                template: acquisitionsBannerCovidTemplate,
                hasTicker: true,
                bannerModifierClass: 'covid-banner',
                minArticlesBeforeShowingBanner: 2,
                secondaryLinkLabel,
            },
        },
        {
            id: 'accuracy',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText: accuracyMessageText,
                leadSentence: accuracyLeadSentence,
                ctaText,
                template: acquisitionsBannerCovidTemplate,
                hasTicker: true,
                bannerModifierClass: 'covid-banner',
                minArticlesBeforeShowingBanner: 2,
                secondaryLinkLabel,
            },
        },
        {
            id: 'open',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText: openMessageText,
                leadSentence: openLeadSentence,
                ctaText,
                template: acquisitionsBannerCovidTemplate,
                hasTicker: true,
                bannerModifierClass: 'covid-banner',
                minArticlesBeforeShowingBanner: 2,
                secondaryLinkLabel,
            },
        },
    ],
};
