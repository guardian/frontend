// @flow

import { getSync } from 'lib/geolocation';
import { acquisitionsBannerFivTemplate } from 'common/modules/commercial/templates/acquisitions-banner-fiv';
import { canShowSync } from 'common/modules/commercial/membership-engagement-banner';

export const februaryMomentBannerNonUS: AcquisitionsABTest = {
    id: 'FebruaryMomentBannerNonUs',
    start: '2019-01-01',
    expiry: '2019-09-30',
    author: 'John Duffell',
    description: 'test copy on engagement banner outside US for the feb moment',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'best AV possible',
    canRun: () => getSync() !== 'US',
    showForSensitive: true,
    campaignId: 'february_moment', // TODO check this matches the one used elsewhere
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    variants: [
        {
            id: 'control',
            test: (): void => {}, // banner tests look at the bucket and vary the copy themselves
            engagementBannerParams: {
                messageText:
                    'CONTROL Readers’ support powers our work, giving ' +
                    'our reporting impact and safeguarding our ' +
                    'essential editorial independence. This approach ' +
                    'allows us to keep our journalism accessible to all, ' +
                    'so more people, across the world, have access ' +
                    'to accurate information with integrity at its heart.',
                // buttonCaption?: string, TO be decided with non engineers
                // linkUrl?: string,
                // hasTicker?: boolean,
                // products?: OphanProduct[],
                template: acquisitionsBannerFivTemplate,
                bannerModifierClass: 'fiv-banner',
                // minArticlesBeforeShowingBanner?: number,
            },
            canRun: () => canShowSync(this.engagementBannerParams),
        },
        {
            id: 'variant1',
            test: (): void => {},
            engagementBannerParams: {
                messageText:
                    'VARIANT1 Readers’ support powers our work, giving ' +
                    'our reporting impact and safeguarding our ' +
                    'essential editorial independence. This approach ' +
                    'allows us to keep our journalism accessible to all, ' +
                    'so more people, across the world, have access ' +
                    'to accurate information with integrity at its heart.',
                // buttonCaption?: string, TO be decided with non engineers
                // linkUrl?: string,
                // hasTicker?: boolean,
                // products?: OphanProduct[],
                template: acquisitionsBannerFivTemplate,
                // bannerModifierClass?: string,
                // minArticlesBeforeShowingBanner?: number,
            },
            canRun: () => canShowSync(this.engagementBannerParams),
        },
    ],
};
