// @flow

import {
    getLocalCurrencySymbol,
    getSync as geolocationGetSync,
} from 'lib/geolocation';
import { getCookie } from "lib/cookies";
import { ARTICLES_VIEWED_OPT_OUT_COOKIE } from "common/modules/commercial/user-features";
import { getArticleViewCountForWeeks } from 'common/modules/onward/history';
import { articlesReadTooltipMarkup } from "common/modules/commercial/articles-read-tooltip-markup";
import { acquisitionsBannerControlTemplate } from "common/modules/commercial/templates/acquisitions-banner-control";

// User must have read at least 5 articles in last year (52 weeks)
const minArticleViews = 5;
const articleCountWeeks = 52;
const articleViewCount = getArticleViewCountForWeeks(articleCountWeeks);
const geolocation = geolocationGetSync();
const leadSentence = 'We chose a different approach. Will you support it?'
const articlesRead = articlesReadTooltipMarkup(articleViewCount)
const variantMessageText = `We believe every one of us deserves to read quality, independent, fact-checked news and measured explanation – that’s why we keep Guardian journalism open to all. Our editorial independence has never been so vital. No one sets our agenda, or edits our editor, so we can keep providing independent reporting each and every day. You’ve read more than ${articlesRead} in the last year. No matter how unpredictable the future feels, we will remain with you. Every contribution, however big or small, makes our work possible – in times of crisis and beyond.`
const ctaText = `<span class="engagement-banner__highlight"> Support the Guardian today from as little as ${getLocalCurrencySymbol(geolocation)}1.</span>`;

export const contributionsBannerArticlesViewedOptOut: AcquisitionsABTest = {
    id: 'ContributionsBannerArticlesViewedOptOut',
    campaignId: 'contributions_banner_articles_viewed_opt_out',
    start: '2020-05-28',
    expiry: '2020-11-28',
    author: 'Paul Brown',
    description: 'show number of articles viewed in contributions banner, along with tooltip allowing opting out',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'variant design performs at least as well as control',
    canRun: () => {
        const minimumNumberOfArticlesViewed = articleViewCount >= minArticleViews;
        const optOutCookieNotSet = !getCookie(ARTICLES_VIEWED_OPT_OUT_COOKIE.name);

        return (minimumNumberOfArticlesViewed && optOutCookieNotSet)
    },
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    geolocation,
    variants: [
        {
            id: 'placeholder',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence,
                messageText: variantMessageText,
                ctaText,
                template: acquisitionsBannerControlTemplate,
            },
        },
    ],
};
