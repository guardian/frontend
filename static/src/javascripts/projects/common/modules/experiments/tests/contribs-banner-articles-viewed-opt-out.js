// @flow

import {
    getLocalCurrencySymbol,
    getSync as geolocationGetSync,
} from 'lib/geolocation';
import config from "lib/config";
import { getCookie } from "lib/cookies";
import { ARTICLES_VIEWED_OPT_OUT_COOKIE } from "common/modules/commercial/user-features";
import { getArticleViewCountForWeeks } from 'common/modules/onward/history';
import { articlesReadTooltipMarkup } from "common/modules/commercial/articles-read-tooltip-markup";
import { acquisitionsBannerControlTemplate } from "common/modules/commercial/templates/acquisitions-banner-control";

// User must have read at least 5 articles in last 6 months (as 26 weeks)
const minArticleViews = 5;
const articleCountWeeks = 26;
const articleViewCount = getArticleViewCountForWeeks(articleCountWeeks);
const geolocation = geolocationGetSync();
const leadSentence = 'We chose a different approach. Will you support it?'
const articlesRead = articlesReadTooltipMarkup(articleViewCount)
const variantMessageText = `With news under threat, just when we need it most, the Guardian’s quality, fact-checked news and measured explanation has never mattered more. Our editorial independence is vital. We believe every one of us deserves to read honest reporting – that’s why we remain with you, open to all. And you’re visiting in your millions. You’ve read more than ${articlesRead} in the last six months. But at this crucial moment, advertising revenue is plummeting. We need you to help fill the gap. Every contribution, however big or small, is valuable – in times of crisis and beyond.`
const controlMessageText = `With news under threat, just when we need it most, the Guardian’s quality, fact-checked news and measured explanation has never mattered more. Our editorial independence is vital. We believe every one of us deserves to read honest reporting – that’s why we remain with you, open to all. And you’re visiting in your millions. You’ve read more than ${articleViewCount.toString()} in the last six months. But at this crucial moment, advertising revenue is plummeting. We need you to help fill the gap. Every contribution, however big or small, is valuable – in times of crisis and beyond.`
const ctaText = `<span class="engagement-banner__highlight"> Support The Guardian from as little as ${getLocalCurrencySymbol(geolocation)}1.</span>`;

export const contributionsBannerArticlesViewedOptOut: AcquisitionsABTest = {
    id: 'ContributionsBannerArticlesViewedOptOut',
    campaignId: 'contributions_banner_articles_viewed_opt_out',
    start: '2020-05-28',
    expiry: '2020-11-28',
    author: 'Michael Jacobson',
    description: 'show number of articles viewed in contributions banner, along with tooltip allowing opting out',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'variant design performs at least as well as control',
    canRun: () => {
        const bannerOptOutEnabled = config.get('switches.showArticlesViewedOptOut')
        const minimumNumberOfArticlesViewed = articleViewCount >= minArticleViews
        const optOutCookieNotSet = !getCookie(ARTICLES_VIEWED_OPT_OUT_COOKIE.name)

        return (bannerOptOutEnabled && minimumNumberOfArticlesViewed && optOutCookieNotSet)
    },
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    geolocation,
    variants: [
        {
            id: 'control',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence,
                messageText: controlMessageText,
                ctaText,
                template: acquisitionsBannerControlTemplate
            }
        },
        {
            id: 'variant',
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
