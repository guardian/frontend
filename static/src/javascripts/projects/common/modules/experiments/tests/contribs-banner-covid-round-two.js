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
const controlLeadSentence = `Thanks to your support, we can continue to provide our vital reporting – in times of crisis and beyond. `;
const powerLeadSentence = `Support from our readers allows us to deliver vital, fact-based reporting – in times of crisis and beyond. `;
const independenceLeadSentence = `Thanks to your support, we can remain independent and keep reporting with accuracy and clarity. `;

const controlMessageText = `Millions of readers across the world are visiting the Guardian every day for open, independent, accurate journalism. Trusted news has never been so important, and neither has your support.`;
const powerMessageText = `Millions of readers across the world visit the Guardian every day for open, independent journalism that holds power to account. Trusted news has never been more crucial, and neither has your support.`;
const independenceMessageText = `Now more than ever, the Guardian’s independence matters. Free from commercial or political bias, we bring you fact-checked news and trustworthy commentary each and every day. In these unprecedented times, independent reporting has never been so vital.`;

export const contributionsCovidBannerRoundTwo: AcquisitionsABTest = {
    id: 'ContributionsCovidBannerRoundTwo',
    campaignId: 'covid_banner_2',
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
            id: 'power',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText: powerMessageText,
                leadSentence: powerLeadSentence,
                ctaText,
                template: acquisitionsBannerCovidTemplate,
                hasTicker: true,
                bannerModifierClass: 'covid-banner',
                minArticlesBeforeShowingBanner: 2,
                secondaryLinkLabel,
            },
        },
        {
            id: 'independence',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText: independenceMessageText,
                leadSentence: independenceLeadSentence,
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
