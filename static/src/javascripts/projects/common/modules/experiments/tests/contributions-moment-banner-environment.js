// @flow

// import { getSync } from 'lib/geolocation';
import { acquisitionsBannerMomentTemplate } from 'common/modules/commercial/templates/acquisitions-banner-moment.js';
import { canShowBannerSync } from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const geolocation = geolocationGetSync();
const campaignId = 'environment_campaign';

const defaultLeadSentence =
    'The climate emergency is the defining issue of our times. ';
const defaultCopy =
    'This is The Guardian’s pledge: we will be truthful, resolute and undeterred in pursuing our journalism on the environment. We will give global heating, wildlife extinction and pollution the urgent attention they demand. Our independence means we can interrogate inaction by those in power. It means our reporting will always be grounded in scientific facts, never in commercial or political interests. Support from our readers makes this work possible.';
const defaultMobileCopy =
    'This is The Guardian’s pledge: we will be truthful, resolute and undeterred in pursuing our journalism on the environment. Support from our readers makes this work possible.';

const thankYouCopy =
    'The climate emergency is the defining issue of our times. This is The Guardian’s pledge: we will be truthful, resolute and undeterred in pursuing our journalism on the environment. We will give global heating, wildlife extinction and pollution the urgent attention they demand. Our independence means we can interrogate inaction by those in power. ';
const thankYouMobileCopy =
    'The climate emergency is the defining issue of our times. This is The Guardian’s pledge: we will be truthful, resolute and undeterred in pursuing our journalism on the environment. ';
const thankYouClosingSentence =
    'Thank you for supporting The Guardian – readers from around the world, like you, make this work possible.';
const thankYouCTA = 'Support us again';

// These test params must be set on engagementBannerParams *and* passed into canShowBannerSync
// TODO - we need to rethink how banner tests are selected/displayed
const userCohortParam = {
    momentBannerDefault: 'AllNonSupporters',
    momentBannerThankYou: 'AllExistingSupporters',
};
const minArticlesBeforeShowingBanner = 0;

export const environmentMomentBannerNonSupporters: AcquisitionsABTest = {
    id: 'ContributionsBannerEnvironmentMomentNonSupporters',
    start: '2019-01-01',
    expiry: '2020-09-30',
    author: 'Joshua Lieberman',
    description: 'environment moment',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'best AV possible',
    canRun: () => true,
    showForSensitive: true,
    campaignId,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    geolocation,
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                leadSentence: defaultLeadSentence,
                messageText: defaultCopy,
                mobileMessageText: defaultMobileCopy,
                template: acquisitionsBannerMomentTemplate,
                bannerModifierClass: 'moment-banner',
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.momentBannerDefault,
                titles: ['We will not be quiet ', 'on the climate crisis'],
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.momentBannerDefault
                ),
        },
    ],
};

export const environmentMomentBannerSupporters: AcquisitionsABTest = {
    id: 'ContributionsBannerEnvironmentMomentSupporters',
    start: '2019-01-01',
    expiry: '2020-09-30',
    author: 'Joshua Lieberman',
    description: 'environment moment',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'best AV possible',
    canRun: () => true,
    showForSensitive: true,
    campaignId,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    geolocation,
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                messageText: thankYouCopy,
                closingSentence: thankYouClosingSentence,
                mobileMessageText: thankYouMobileCopy,
                buttonCaption: thankYouCTA,
                template: acquisitionsBannerMomentTemplate,
                bannerModifierClass: 'moment-banner moment-banner-thank-you',
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.momentBannerThankYou,
                titles: ['We will not be quiet ', 'on the climate crisis'],
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.momentBannerThankYou
                ),
        },
    ],
};
