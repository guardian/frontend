// @flow

import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import {
    getCountryName,
    getLocalCurrencySymbol,
    getSync as geolocationGetSync,
} from 'lib/geolocation';
import { getArticleViewCountForWeeks } from 'common/modules/onward/history';

// User must have read at least 5 articles in last 4 months (as 17 weeks)
const minArticleViews = 5;
const articleCountWeeks = 17;

const articleViewCount = getArticleViewCountForWeeks(articleCountWeeks);
const geolocation = geolocationGetSync();
const messageText =
    'Unlike many news organisations, we made a choice to keep our journalism free and available for all. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart. Every contribution, big or small, is so valuable – it is essential in protecting our editorial independence.';
const ctaText = `<span class="engagement-banner__highlight"> Support The Guardian from as little as ${getLocalCurrencySymbol(
    geolocation
)}1</span>`;

export const articlesViewedBanner: AcquisitionsABTest = {
    id: 'ContributionsBannerArticlesViewed',
    campaignId: 'contributions_banner_articles_viewed',
    start: '2019-07-10',
    expiry: '2020-10-30',
    author: 'Tom Forbes',
    description: 'show number of articles viewed in contributions banner',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'variant design performs at least as well as control',
    canRun: () =>
        articleViewCount >= minArticleViews && !!getCountryName(geolocation),
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    geolocation,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence: `You’ve read ${articleViewCount} Guardian articles in the last two months – so we hope you will consider supporting us today.`,
                messageText,
                ctaText,
                template: acquisitionsBannerControlTemplate,
            },
        },
    ],
};
