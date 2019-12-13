// @flow

import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import {
    getLocalCurrencySymbol,
    getSync as geolocationGetSync,
} from 'lib/geolocation';
import { getArticleViewCountForDays } from 'common/modules/onward/history';

// User must have read at least 5 articles in last 60 days
const minArticleViews = 5;
const articleCountDays = 60;

const articleViewCount = getArticleViewCountForDays(articleCountDays);
const geolocation = geolocationGetSync();

const leadSentence = `You’ve read ${articleViewCount} Guardian articles in the last two months – so we hope you will consider supporting us today.`;
const messageText =
    'Unlike many news organisations, we made a choice to keep our journalism free and available for all. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart. Every contribution, big or small, is so valuable – it is essential in protecting our editorial independence.';

const leadSentenceVariant = 'Britain has voted, and the outcome is clear.';
const messageTextVariant = `Boris Johnson has led the Conservatives to a seismic election win, Labour is left decimated, and a Brexit looks imminent. The Guardian’s independent, measured, authoritative reporting has never been so critical. You’ve read ${articleViewCount} articles in the last two months. Unlike many news organisations, we made a choice to keep all of our independent, investigative reporting free and available for everyone. Support from our readers is essential in safeguarding Guardian journalism. If you value our voice, please consider making a contribution now.`;

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
    canRun: () => articleViewCount >= minArticleViews && geolocation === 'UK',
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
