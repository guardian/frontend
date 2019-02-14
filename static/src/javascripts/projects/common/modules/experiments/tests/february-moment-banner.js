// @flow

import { getSync } from 'lib/geolocation';
import { acquisitionsBannerFivTemplate } from 'common/modules/commercial/templates/acquisitions-banner-fiv';

const defaultCopy =
    'Readers’ support powers our work, giving ' +
    'our reporting impact and safeguarding our ' +
    'essential editorial independence. This approach ' +
    'allows us to keep our journalism accessible to all, ' +
    'so more people, across the world, have access ' +
    'to accurate information with integrity at its heart.';

const thankYouCopy =
    'THANK YOU COPY TBC ' +
    'our reporting impact and safeguarding our ' +
    'essential editorial independence. This approach ' +
    'allows us to keep our journalism accessible to all, ' +
    'so more people, across the world, have access ' +
    'to accurate information with integrity at its heart.';

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
    campaignId: 'february_moment', // TODO check this matches the one used elsewhere
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                messageText: `CONTROL NON UK${defaultCopy}`,
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
                messageText: `VARIANT NON UK${defaultCopy}`,
                // buttonCaption?: string, TO be decided with non engineers
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
    campaignId: 'february_moment', // TODO check this matches the one used elsewhere
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                messageText: `UK${defaultCopy}`,
                // buttonCaption?: string, TO be decided with non engineers
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
    campaignId: 'february_moment', // TODO check this matches the one used elsewhere
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                messageText: thankYouCopy,
                // buttonCaption?: string, TO be decided with non engineers
                template: acquisitionsBannerFivTemplate,
                bannerModifierClass: 'fiv-banner',
                minArticlesBeforeShowingBanner: 0,
                userCohort: 'OnlyExistingSupporters',
            },
        },
    ],
};
