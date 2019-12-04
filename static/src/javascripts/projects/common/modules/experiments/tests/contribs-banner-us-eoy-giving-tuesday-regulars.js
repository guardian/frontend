// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';
import { getArticleViewCountForDays } from 'common/modules/onward/history';

// User must have read at least 5 articles in last 60 days
const minArticleViews = 5;
const articleCountDays = 60;
const articleViewCount = getArticleViewCountForDays(articleCountDays);

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';
const testRunConditions = isUS && articleViewCount >= minArticleViews;

const titles = ['Offset fake news this Giving Tuesday'];
const messageText =
    'Help the truth triumph in 2020. Amid a tsunami of disinformation and “alternative facts”, the need for truth has never been greater. Support the Guardian’s independent, fact-based journalism this holiday season. As we look to the challenges of the coming year, we’re hoping to raise $1.5m from our US readers by January. ';
const closingSentence = 'Help us reach our year-end goal.';
const ctaText = 'Support The Guardian';

const tickerHeaderWithArticleCount = `You’ve read ${articleViewCount} articles in the last two months`;

export const contributionsBannerUsEoyGivingTuesdayRegulars: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyGivingTuesdayRegulars',
    campaignId: 'USeoy2019',
    start: '2019-11-15',
    expiry: '2020-1-30',
    author: 'Joshua Lieberman',
    description:
        'banner test for the US EOY campaign for readers who have seen more than 5 articles',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'variant design performs at least as well as control',
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    canRun: () => testRunConditions,
    geolocation,
    variants: [
        {
            id: 'withArticleCount',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText,
                closingSentence,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
                bannerModifierClass: 'useoy2019',
                tickerHeader: tickerHeaderWithArticleCount,
            },
        },
    ],
};
