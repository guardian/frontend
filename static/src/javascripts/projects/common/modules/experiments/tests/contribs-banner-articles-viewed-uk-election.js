// @flow

import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import {
    getLocalCurrencySymbol,
    getSync as geolocationGetSync,
} from 'lib/geolocation';
import { getArticleViewCountForWeeks } from 'common/modules/onward/history';

// User must have read at least 5 articles in last 3 months (as 13 weeks)
const minArticleViews = 5;
const articleCountWeeks = 13;

const articleViewCount = getArticleViewCountForWeeks(articleCountWeeks);
const geolocation = geolocationGetSync();

const leadSentence = `You’ve read ${articleViewCount} Guardian articles in the last three months – so we hope you will consider supporting us today.`;
const messageText =
    'Unlike many news organisations, we made a choice to keep our journalism open for all. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart. Every contribution, however big or small, is so valuable – it is essential in protecting our editorial independence.';

const leadSentenceVariant = 'Britain has voted, and the outcome is clear.';
const messageTextVariant = `Boris Johnson has led the Conservatives to a seismic election win, Labour is left decimated, and a Brexit looks imminent. The Guardian’s independent, measured, authoritative reporting has never been so critical. You’ve read ${articleViewCount} articles in the last three months. Unlike many news organisations, we made a choice to keep our journalism open for all. At a time when factual information is a necessity, we believe everyone deserves access to accurate reporting with integrity at its heart. Every contribution, however big or small, is so valuable.`;

const ctaText = `<span class="engagement-banner__highlight"> Support The Guardian from as little as ${getLocalCurrencySymbol(
    geolocation
)}1</span>`;

export const articlesViewedBannerUkElection: AcquisitionsABTest = {
    id: 'ContributionsBannerArticlesViewedUkElection',
    campaignId: 'contributions_banner_articles_viewed_uk_election',
    start: '2019-12-13',
    expiry: '2020-10-30',
    author: 'Joshua Lieberman',
    description:
        'UK post-election test that shows number of articles viewed in contributions banner',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'variant design performs at least as well as control',
    canRun: () => articleViewCount >= minArticleViews && geolocation === 'GB',
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    geolocation,
    variants: [
        {
            id: 'control',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence,
                messageText,
                ctaText,
                template: acquisitionsBannerControlTemplate,
            },
        },
        {
            id: 'variant',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence: leadSentenceVariant,
                messageText: messageTextVariant,
                ctaText,
                template: acquisitionsBannerControlTemplate,
            },
        },
    ],
};
