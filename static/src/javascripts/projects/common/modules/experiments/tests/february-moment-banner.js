// @flow

import { getSync } from 'lib/geolocation';
import { acquisitionsBannerFivTemplate } from 'common/modules/commercial/templates/acquisitions-banner-fiv';

const defaultBold =
    'This is The Guardian’s model for open, independent journalism';
const defaultCopy =
    'Our mission is to keep independent journalism accessible to everyone, regardless of where they live or what they can afford. Funding from our readers safeguards our editorial independence. It also powers our work and maintains this openness. It means more people, across the world, can access accurate information with integrity at its heart.';

const thankYouBold =
    'Thank you for supporting The Guardian’s model for open, independent journalism';
const thankYouCopy =
    'Our mission is to keep independent journalism accessible to everyone, regardless of where they live or what they can afford. Funding from readers like you safeguards our editorial independence, powers our work, and maintains this openness. It means more people, across the world, can access accurate information with integrity at its heart.';

const campaignId = 'empower_campaign';

export const februaryMomentBannerNonUk: AcquisitionsABTest = {
    id: 'FebruaryMomentBannerNonUk',
    start: '2019-01-01',
    expiry: '2019-09-30',
    author: 'John Duffell',
    description: 'test copy on engagement banner outside UK for the feb moment',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'best AV possible',
    canRun: () => getSync() !== 'GB',
    showForSensitive: true,
    campaignId: campaignId,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                leadSentence: defaultBold,
                messageText: defaultCopy,
                // buttonCaption?: string, TO be decided with non engineers
                template: acquisitionsBannerFivTemplate,
                bannerModifierClass: 'fiv-banner',
                minArticlesBeforeShowingBanner: 0,
                userCohort: 'OnlyNonSupporters',
            },
        },
        {
            id: 'variant1',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence: defaultBold,
                messageText: defaultCopy,
                template: acquisitionsBannerFivTemplate,
                bannerModifierClass: 'fiv-banner',
                minArticlesBeforeShowingBanner: 0,
                userCohort: 'OnlyNonSupporters',
            },
        },
    ],
};

export const februaryMomentBannerUk: AcquisitionsABTest = {
    id: 'FebruaryMomentBannerUk',
    start: '2019-01-01',
    expiry: '2019-09-30',
    author: 'John Duffell',
    description: 'enable engagement banner in UK for the feb moment',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'best AV possible',
    canRun: () => getSync() === 'GB',
    showForSensitive: true,
    campaignId: campaignId,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                leadSentence: defaultBold,
                messageText: defaultCopy,
                template: acquisitionsBannerFivTemplate,
                bannerModifierClass: 'fiv-banner',
                minArticlesBeforeShowingBanner: 0,
                userCohort: 'OnlyNonSupporters',
            },
        },
    ],
};

export const februaryMomentBannerThankYou: AcquisitionsABTest = {
    id: 'FebruaryMomentBannerThankYou',
    start: '2019-01-01',
    expiry: '2019-09-30',
    author: 'John Duffell',
    description: 'test copy on engagement banner outside US for the feb moment',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'best AV possible',
    canRun: () => true,
    showForSensitive: true,
    campaignId: campaignId,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                leadSentence: thankYouBold,
                messageText: thankYouCopy,
                template: acquisitionsBannerFivTemplate,
                bannerModifierClass: 'fiv-banner',
                minArticlesBeforeShowingBanner: 0,
                userCohort: 'OnlyExistingSupporters',
            },
        },
    ],
};
