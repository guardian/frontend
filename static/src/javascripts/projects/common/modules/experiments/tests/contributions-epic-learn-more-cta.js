// @flow
import {
    makeEpicABTest,
    defaultButtonTemplate,
    buildEpicCopy,
} from 'common/modules/commercial/contributions-utilities';
import { getArticleViewCountForDays } from 'common/modules/onward/history';
import { getCountryName, getSync as geolocationGetSync } from 'lib/geolocation';

// User must not have read fewer than 5 articles in the last 30 days
const maxArticleViews = 5;
const articleCountDays = 30;
const articleViewCount = getArticleViewCountForDays(articleCountDays);

const geolocation = geolocationGetSync();

export const learnMore: EpicABTest = makeEpicABTest({
    id: 'ContributionsEpicLearnMoreCTA',
    campaignId: 'epic_articles_viewed_month',

    start: '2019-06-24',
    expiry: '2020-01-27',

    author: 'Joshua Lieberman',
    description: 'States how many articles a user has viewed in the epic',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Acquires many Supporters',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    geolocation,
    highPriority: true,

    canRun: () => articleViewCount < maxArticleViews,

    variants: [
        {
            id: 'control',
            products: [],
            template
        },
        {
            id: 'variant',
            buttonTemplate: defaultButtonTemplate,
            products: [],
        },
    ],
});
