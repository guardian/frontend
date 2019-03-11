// @flow

import { acquisitionsBannerFivTemplate } from 'common/modules/commercial/templates/acquisitions-banner-fiv';
import { canShowBannerSync } from 'common/modules/commercial/contributions-utilities';

const defaultBold =
    'This is The\xa0Guardian’s model for open, independent journalism';
const defaultCopy =
    'Our mission is to keep independent journalism accessible to everyone, regardless of where they live or what they can afford. Funding from our readers safeguards our editorial independence. It also powers our work and maintains this openness. It means more people, across the world, can access accurate information with integrity at its heart.';

const variantCopy =
    'Unlike many news organisations, we made a choice to keep all of our independent, investigative reporting free and available for everyone. We believe that each of us, around the world, deserves access to accurate information with integrity at its heart. At a time when factual reporting is critical, The Guardian’s editorial independence is safeguarded by our readers. If you’re able to, please support The Guardian today.';

const thankYouBold =
    'Thank you for supporting The\xa0Guardian’s model for open, independent journalism';
const thankYouCopy =
    'Our mission is to keep independent journalism accessible to everyone, regardless of where they live or what they can afford. Funding from readers like you safeguards our editorial independence, powers our work, and maintains this openness. It means more people, across the world, can access accurate information with integrity at its heart.';

const campaignId = 'empower_campaign';

// These test params must be set on engagementBannerParams *and* passed into canShowBannerSync
// TODO - we need to rethink how banner tests are selected/displayed
const userCohortParam = {
    onlyNonSupporters: 'OnlyNonSupporters',
    onlyExistingSupporters: 'OnlyExistingSupporters',
};
const minArticlesBeforeShowingBanner = 0;

const bannerShownCallback = () => {
    const circles = document.querySelector('.fiv-banner__circles');
    if (circles) {
        const observer = new window.IntersectionObserver(
            (entries, self) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        self.disconnect();
                        circles.className += ' fiv-banner__circles-animated';
                    }
                });
            },
            { threshold: 1.0 }
        );
        observer.observe(circles);
    }
};

export const februaryMomentBannerCopy: AcquisitionsABTest = {
    id: 'FebruaryMomentBannerCopy',
    start: '2019-03-11',
    expiry: '2019-09-30',
    author: 'Jonathan Rankin',
    description: 'test some moment specific copy on fiv moment engagement banner',
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
                template: acquisitionsBannerFivTemplate,
                bannerModifierClass: 'fiv-banner fiv-banner--yellow',
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.onlyNonSupporters,
                titles: [
                    'We chose a different approach',
                    'Will you support it?',
                ],
                bannerShownCallback,
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.onlyNonSupporters
                ),
        },
        {
            id: 'variant',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                leadSentence: defaultBold,
                messageText: variantCopy,
                // buttonCaption?: string, TO be decided with non engineers
                template: acquisitionsBannerFivTemplate,
                bannerModifierClass: 'fiv-banner fiv-banner--yellow',
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.onlyNonSupporters,
                titles: [
                    'We chose a different approach',
                    'Will you support it?',
                ],
                bannerShownCallback,
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.onlyNonSupporters
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
                bannerModifierClass: 'fiv-banner fiv-banner-thank-you',
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.onlyExistingSupporters,
                titles: [
                    'Thanks to your support',
                    "We're available to everyone",
                ],
                bannerShownCallback,
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.onlyExistingSupporters
                ),
        },
    ],
};
