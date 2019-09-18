// @flow

// import { getSync } from 'lib/geolocation';
import { acquisitionsBannerMomentTemplate } from 'common/modules/commercial/templates/acquisitions-banner-moment.js';
import { canShowBannerSync } from 'common/modules/commercial/contributions-utilities';

const defaultBold =
    'This is The\xa0Guardian’s model for open, independent journalism';
const defaultCopy =
    'Our mission is to keep independent journalism accessible to everyone, regardless of where they live or what they can afford. Funding from our readers safeguards our editorial independence. It also powers our work and maintains this openness. It means more people, across the world, can access accurate information with integrity at its heart.';

const thankYouBold =
    'Thank you for supporting The\xa0Guardian’s model for open, independent journalism';
const thankYouCopy =
    'Our mission is to keep independent journalism accessible to everyone, regardless of where they live or what they can afford. Funding from readers like you safeguards our editorial independence, powers our work, and maintains this openness. It means more people, across the world, can access accurate information with integrity at its heart.';

const campaignId = 'environment_campaign';

// These test params must be set on engagementBannerParams *and* passed into canShowBannerSync
// TODO - we need to rethink how banner tests are selected/displayed
const userCohortParam = {
    momentBannerNonUk: 'OnlyNonSupporters',
    momentBannerUk: 'OnlyNonSupporters',
    momentBannerThankYou: 'OnlyExistingSupporters',
};
const minArticlesBeforeShowingBanner = 0;

export const environmentMomentBannerNonSupporters: AcquisitionsABTest = {
    id: 'ContributionsBannerEnvironmentMomentNonSupporters',
    start: '2019-01-01',
    expiry: '2020-09-30',
    author: 'Joshua Lieberman',
    description: 'new moment lorem ipsum',
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
                leadSentence: defaultBold,
                messageText: defaultCopy,
                // buttonCaption?: string, TO be decided with non engineers
                template: acquisitionsBannerMomentTemplate,
                bannerModifierClass: 'moment-banner',
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.momentBannerNonUk,
                titles: [
                    "Free for those who can't afford it",
                    'Supported by those who can',
                ],
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.momentBannerNonUk
                ),
        },
    ],
};

export const environmentMomentBannerSupporters: AcquisitionsABTest = {
    id: 'ContributionsBannerEnvironmentMomentSupporters',
    start: '2019-01-01',
    expiry: '2020-09-30',
    author: 'Joshua Lieberman',
    description: 'new moment lorem ipsum',
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
                template: acquisitionsBannerMomentTemplate,
                bannerModifierClass: 'moment-banner moment-banner-thank-you',
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.momentBannerThankYou,
                titles: [
                    'Thanks to your support',
                    "We're available to everyone",
                ],
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.momentBannerThankYou
                ),
        },
    ],
};
