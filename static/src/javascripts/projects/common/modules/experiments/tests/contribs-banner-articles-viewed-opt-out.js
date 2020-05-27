// @flow

import {
    getCountryName,
    getLocalCurrencySymbol,
    getSync as geolocationGetSync,
} from 'lib/geolocation';
import { getArticleViewCountForWeeks } from 'common/modules/onward/history';
import { acquisitionsBannerArticleCountOptOutTemplate } from "common/modules/commercial/templates/acquisitions-banner-article-count-opt-out-template";

// User must have read at least 5 articles in last 6 months (as 26 weeks)
const minArticleViews = 5;
const articleCountWeeks = 26;
const articleViewCount = getArticleViewCountForWeeks(articleCountWeeks);
const geolocation = geolocationGetSync();
const leadSentence = 'We chose a different approach. Will you support it?'
const messageText = `With news under threat, just when we need it most, the Guardian’s quality, fact-checked news and measured explanation has never mattered more. Our editorial independence is vital. We believe every one of us deserves to read honest reporting – that’s why we remain with you, open to all. And you’re visiting in your millions. You’ve read more than ${articleViewCount - 1} articles in the last six months. But at this crucial moment, advertising revenue is plummeting. We need you to help fill the gap. Every contribution, however big or small, is valuable – in times of crisis and beyond.`
const ctaText = `<span class="engagement-banner__highlight"> Support The Guardian from as little as ${getLocalCurrencySymbol(geolocation)}1.</span>`;

export const contributionsBannerArticlesViewedOptOut: AcquisitionsABTest = {
    id: 'ContributionsBannerArticlesViewedOptOut',
    campaignId: 'contributions_banner_articles_viewed_opt_out',
    start: '2020-05-27',
    expiry: '2020-11-27',
    author: 'Michael Jacobson',
    description: 'show number of articles viewed in contributions banner, along with tooltip allowing opting out',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'variant design performs at least as well as control',
    canRun: () => true, // TODO: remove hard coded true for prod
    // canRun: () =>
    //     articleViewCount >= minArticleViews && !!getCountryName(geolocation),
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    geolocation,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence,
                messageText,
                ctaText,
                template: acquisitionsBannerArticleCountOptOutTemplate,
            },
        },
    ],
};
