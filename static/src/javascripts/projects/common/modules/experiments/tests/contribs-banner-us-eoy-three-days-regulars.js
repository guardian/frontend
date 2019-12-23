// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';
import { getArticleViewCountForWeeks } from 'common/modules/onward/history';
import { canShowBannerSync } from 'common/modules/commercial/contributions-utilities';

// User must have read at least 5 articles in last 4 months (as 17 weeks)
const minArticleViews = 5;
const articleCountWeeks = 17;
const articleViewCount = getArticleViewCountForWeeks(articleCountWeeks);

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['3 days left to give to the Guardian in 2019'];
const messageText = `… and three American billionaires whose family net worth equals the net worth of more than 50% of the US population. The coming year will be an epic one for America and will tell us much about how this country wants to tackle wealth inequality. As we prepare for 2020, we’re asking our US readers to help us raise $1.5 million to cover the issues that matter.`;
const ctaText = 'Support The Guardian';
const tickerHeader = `You've read ${articleViewCount} in the last four months`;

export const contributionsBannerUsEoyThreeDaysRegulars: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyThreeDaysRegulars',
    campaignId: 'USeoy2019',
    start: '2019-12-23',
    expiry: '2020-1-30',
    author: 'Joshua Lieberman',
    description: 'US End of year banner - three day count with articles viewed',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'NA',
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    canRun: () => {
        debugger;
        return isUS && articleViewCount >= minArticleViews;
    },
    geolocation,
    variants: [
        {
            id: 'control',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
                tickerHeader,
                bannerModifierClass: 'useoy2019',
            },
        },
    ],
};
