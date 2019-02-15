// @flow

import { getSync } from 'lib/geolocation';
import { acquisitionsBannerFivTemplate } from 'common/modules/commercial/templates/acquisitions-banner-fiv';
import { canShowBannerSync } from 'common/modules/commercial/contributions-utilities';

const defaultBold =
    'This is The Guardian’s model for open, independent journalism';
const defaultCopy =
    'Our mission is to keep independent journalism accessible to everyone, regardless of where they live or what they can afford. Funding from our readers safeguards our editorial independence. It also powers our work and maintains this openness. It means more people, across the world, can access accurate information with integrity at its heart.';

const thankYouBold =
    'Thank you for supporting The Guardian’s model for open, independent journalism';
const thankYouCopy =
    'Our mission is to keep independent journalism accessible to everyone, regardless of where they live or what they can afford. Funding from readers like you safeguards our editorial independence, powers our work, and maintains this openness. It means more people, across the world, can access accurate information with integrity at its heart.';

const campaignId = 'empower_campaign';

// These test params must be set on engagementBannerParams *and* passed into canShowBannerSync
// TODO - we need to rethink how banner tests are selected/displayed
const userCohortParam = {
    februaryMomentBannerNonUk: 'OnlyNonSupporters',
    februaryMomentBannerUk: 'OnlyNonSupporters',
    februaryMomentBannerThankYou: 'OnlyExistingSupporters',
};
const minArticlesBeforeShowingBanner = 0;

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
    campaignId,
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
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.februaryMomentBannerNonUk,
                titles: [
                    "Free for those who can't afford it",
                    'Supported by those who can',
                ],
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.februaryMomentBannerNonUk
                ),
        },
        {
            id: 'variant1',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence: defaultBold,
                messageText: defaultCopy,
                template: acquisitionsBannerFivTemplate,
                bannerModifierClass: 'fiv-banner',
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.februaryMomentBannerNonUk,
                titles: [
                    "Free for those who can't afford it",
                    'Supported by those who can',
                ], // TODO: variant on this text, TBC
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.februaryMomentBannerNonUk
                ),
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
    campaignId,
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
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.februaryMomentBannerUk,
                titles: [
                    "We're available for everyone",
                    'Funded by our readers.',
                ],
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.februaryMomentBannerUk
                ),
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
    campaignId,
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
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.februaryMomentBannerThankYou,
                titles: [
                    'Thanks to your support',
                    "We're available to everyone.",
                ],
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.februaryMomentBannerThankYou
                ),
        },
    ],
};
