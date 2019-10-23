// @flow

// import { getSync } from 'lib/geolocation';
import { acquisitionsBannerMomentTemplate } from 'common/modules/commercial/templates/acquisitions-banner-moment.js';
import { canShowBannerSync } from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const geolocation = geolocationGetSync();
const campaignId = 'climate_pledge_2019';

const defaultLeadSentence =
    'The climate emergency is the defining issue of our times. ';
const defaultCopy =
    'This is the Guardian’s pledge: we will be truthful, resolute and undeterred in pursuing Guardian journalism on the environment. We will give global heating, wildlife extinction and pollution the urgent attention they demand. Our independence means we can interrogate inaction by those in power. It means Guardian reporting will always be driven by scientific facts, never by commercial or political interests. Support from our readers makes this work possible.';
const defaultMobileCopy =
    'This is the Guardian’s pledge: we will be truthful, resolute and undeterred in pursuing our journalism on the environment. Support from our readers makes this work possible.';

const thankYouCopy =
    'The climate emergency is the defining issue of our times. This is the Guardian’s pledge: we will be truthful, resolute and undeterred in pursuing Guardian journalism on the environment. We will give global heating, wildlife extinction and pollution the urgent attention they demand. Our independence means we can interrogate inaction by those in power. ';
const thankYouMobileCopy =
    'The climate emergency is the defining issue of our times. This is the Guardian’s pledge: we will be truthful, resolute and undeterred in pursuing our journalism on the environment. ';
const thankYouClosingSentence =
    'Thank you for supporting the Guardian – readers from around the world, like you, make this work possible.';
const thankYouCTA = 'Support us again';

// These test params must be set on engagementBannerParams *and* passed into canShowBannerSync
// TODO - we need to rethink how banner tests are selected/displayed
const userCohortParam = {
    momentBannerDefault: 'AllNonSupporters',
    momentBannerThankYou: 'AllExistingSupporters',
};
const minArticlesBeforeShowingBanner = 0;

const linkUrl =
    'https://support.theguardian.com/contribute/climate-pledge-2019';

const secondaryLinkUrl =
    geolocation === 'US'
        ? 'https://www.theguardian.com/environment/2019/oct/16/climate-crisis-america-guardian-editor-john-mulholland?acquisitionData=%7B%22source%22%3A%22GUARDIAN_WEB%22%2C%22componentType%22%3A%22ACQUISITIONS_EDITORIAL_LINK%22%2C%22campaignCode%22%3A%22climate_pledge_2019%22%2C%22componentId%22%3A%22climate_pledge_2019_banner%22%7D&INTCMP=climate_pledge_2019'
        : 'https://www.theguardian.com/environment/ng-interactive/2019/oct/16/the-guardians-climate-pledge-2019?acquisitionData=%7B%22source%22%3A%22GUARDIAN_WEB%22%2C%22componentType%22%3A%22ACQUISITIONS_EDITORIAL_LINK%22%2C%22campaignCode%22%3A%22climate_pledge_2019%22%2C%22componentId%22%3A%22climate_pledge_2019_banner%22%7D&INTCMP=climate_pledge_2019';

const secondaryLinkLabel =
    geolocation === 'US' ? 'Hear from our editor' : 'Read our pledge';

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
                titles: ['We will not stay quiet ', 'on the climate crisis'],
                linkUrl,
                secondaryLinkUrl,
                secondaryLinkLabel,
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
                titles: ['We will not stay quiet ', 'on the climate crisis'],
                linkUrl,
                secondaryLinkUrl,
                secondaryLinkLabel,
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.momentBannerThankYou
                ),
        },
    ],
};
