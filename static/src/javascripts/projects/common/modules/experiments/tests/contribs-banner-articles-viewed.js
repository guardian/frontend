// @flow

import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import {
    getCountryName,
    getLocalCurrencySymbol,
    getSync as geolocationGetSync,
} from 'lib/geolocation';
import { getArticleViewCountForDays } from 'common/modules/onward/history';
import { buildBannerCopy } from 'common/modules/commercial/contributions-utilities';

// User must have read at least 5 articles in last 30 days
const minArticleViews = 5;
const articleCountDays = 30;

const articleViewCount = getArticleViewCountForDays(articleCountDays);

const geolocation = geolocationGetSync();
const isUSUKAU = ['GB', 'US', 'AU'].includes(geolocation);

const messageText =
    'Unlike many news organisations, we made a choice to keep our journalism free and available for all. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart. Every contribution, big or small, is so valuable – it is essential in protecting our editorial independence.';
const ctaText = `<span class="engagement-banner__highlight"> Support The Guardian from as little as ${getLocalCurrencySymbol(
    geolocation
)}1</span>`;
const USUKAUControlLeadSentence =
    'We chose a different approach. Will you support it?';
const ROWControlLeadSentence =
    'More people in %%COUNTRY_NAME%%, like you, are reading and supporting The Guardian’s independent, investigative journalism.';

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
            id: 'control',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence: buildBannerCopy(
                    isUSUKAU
                        ? USUKAUControlLeadSentence
                        : ROWControlLeadSentence,
                    !isUSUKAU,
                    geolocation
                ),
                messageText,
                ctaText,
                template: acquisitionsBannerControlTemplate,
            },
        },
        {
            id: 'variant',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence: `You’ve read ${articleViewCount} Guardian articles in the last month – if you’ve enjoyed reading, we hope you will consider supporting us today.`,
                messageText,
                ctaText,
                template: acquisitionsBannerControlTemplate,
            },
        },
    ],
};
