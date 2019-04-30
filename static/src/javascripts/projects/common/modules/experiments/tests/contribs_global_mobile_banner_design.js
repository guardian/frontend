// @flow

import { canShowBannerSync } from 'common/modules/commercial/contributions-utilities';
import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';

export const contributionsGlobalMobileBannerDesign: AcquisitionsABTest = {
    id: 'contributionsGlobalMobileBannerDesign',
    campaignId: '2019-04-30_contributions_global_mobile_banner_design,
    start: '2019-04-30',
    expiry: '2019-05-30',
    author: 'Joshua Lieberman',
    description:
        'test new mobile design on standard acquisitions banner',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'variant design performs at least as well as control',
    canRun: () => true,
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                leadSentence: defaultBold,
                messageText: defaultCopy,
                // buttonCaption?: string, TO be decided with non engineers
                template: acquisitionsBannerControlTemplate,
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
