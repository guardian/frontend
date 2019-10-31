// @flow

import { acquisitionsBannerMomentTemplate } from 'common/modules/commercial/templates/acquisitions-banner-moment.js';
import { canShowBannerSync } from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const geolocation = geolocationGetSync();
const campaignId = 'climate_pledge_2019';

const finalPushCopy =
    'The climate emergency is the defining issue of our times. Since we published our environmental pledge, Guardian readers from more than 100 countries across the world have supported us. Many of you have told us how much you value our commitment: to be truthful, resolute and undeterred in pursuing this important journalism. ';
const mobileFinalPushCopy =
    'The climate emergency is the defining issue of our times. Since we published our pledge, readers from more than 100 countries across the world have supported us. You have told us how much you value our commitment: to be truthful, resolute and undeterred in pursuing this important journalism.';
const closingSentenceFinalPush =
    'Your support is galvanising – it makes our work possible and is critical for our future. Thank you.';

// These test params must be set on engagementBannerParams *and* passed into canShowBannerSync
// TODO - we need to rethink how banner tests are selected/displayed
const userCohortParam = {
    momentBannerDefault: 'AllNonSupporters',
    momentBannerThankYou: 'AllExistingSupporters',
    momentBannerEveryone: 'Everyone',
};
const minArticlesBeforeShowingBanner = 0;

const linkUrl =
    'https://support.theguardian.com/contribute/climate-pledge-2019';

const secondaryLinkUrl =
    'https://www.theguardian.com/environment/2019/oct/31/guardian-climate-pledge-thank-you-hope-change?INTCMP=climate_pledge_2019';
const secondaryLinkLabel = 'Why support matters';

export const environmentMomentBannerFinalPush: AcquisitionsABTest = {
    id: 'ContributionsBannerEnvironmentMomentFinalPush',
    start: '2019-01-01',
    expiry: '2020-09-30',
    author: 'Thalia Silver',
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
            id: 'stayquiet',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                messageText: finalPushCopy,
                mobileMessageText: mobileFinalPushCopy,
                closingSentence: closingSentenceFinalPush,
                template: acquisitionsBannerMomentTemplate,
                bannerModifierClass: 'moment-banner',
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.momentBannerEveryone,
                titles: ['We will not stay quiet ', 'on the climate crisis'],
                linkUrl,
                secondaryLinkUrl,
                secondaryLinkLabel,
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.momentBannerEveryone
                ),
        },
        {
            id: 'thankyou',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                messageText: finalPushCopy,
                mobileMessageText: mobileFinalPushCopy,
                closingSentence: closingSentenceFinalPush,
                template: acquisitionsBannerMomentTemplate,
                bannerModifierClass: 'moment-banner',
                minArticlesBeforeShowingBanner,
                userCohort: userCohortParam.momentBannerEveryone,
                titles: [
                    'Thank you for supporting ',
                    'our environmental pledge',
                ],
                linkUrl,
                secondaryLinkUrl,
                secondaryLinkLabel,
            },
            canRun: () =>
                canShowBannerSync(
                    minArticlesBeforeShowingBanner,
                    userCohortParam.momentBannerEveryone
                ),
        },
    ],
};
