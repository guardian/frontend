// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';
import { getArticleViewCountForWeeks } from 'common/modules/onward/history';

// User must have read at least 5 articles in last 60 days
const minArticleViews = 5;
const articleCountWeeks = 26; // Requesting a half year in order to get as many as possible for this and next iterations
const articleViewCount = getArticleViewCountForWeeks(articleCountWeeks);

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';
const testRunConditions = isUS && articleViewCount >= minArticleViews;

// Copy for both variants:
const titles = ['2020 will be a defining year for America'];
const ctaText = 'Support The Guardian';

// Copy specific to 'withArticleCountOnRight'
const messageText =
    'This year, much of what we hold dear has been threatened – democracy, civility, truth. This administration is establishing new norms of behaviour. Truth is being chased away. With your help we can continue put it center stage. As we prepare for 2020, we’re asking our readers to help us raise $1.5 million. ';
const closingSentence = 'Help us reach our year-end goal.';
const articleCountCopy = `You’ve read ${articleViewCount} articles in the last three months`;

// Copy specific to 'withArticleCountInBody'
const articleCountInBody = `${articleCountCopy}. `;
const messageTextBody =
    'This year, much of what we hold dear has been threatened – democracy, civility, truth. This administration is establishing new norms of behaviour. Truth is being chased away. With your help we can continue put it center stage. As we prepare for 2020, we’re asking our readers to help us raise $1.5 million. Help us reach our goal.';
const tickerHeaderDefault = `Help us reach our year-end goal`;

export const contributionsBannerUsEoyGivingTuesdayRegularsRoundTwo: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyGivingTuesdayRegularsRoundTwo',
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
            id: 'withArticleCountOnRight',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText,
                closingSentence,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
                bannerModifierClass: 'useoy2019',
                tickerHeader: articleCountCopy,
            },
        },
        {
            id: 'withArticleCountInBody',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText: messageTextBody,
                leadSentence: articleCountInBody,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
                bannerModifierClass: 'useoy2019',
                tickerHeader: tickerHeaderDefault,
            },
        },
    ],
};
