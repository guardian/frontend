// @flow
import {
    makeEpicABTest,
    defaultButtonTemplate,
    buildEpicCopy,
} from 'common/modules/commercial/contributions-utilities';
import { getArticleViewCountForDays } from 'common/modules/onward/history';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { controlCopy, variantCopy} from "common/modules/experiments/tests/contributions-epic-articles-viewed-month-moment";

// User must have read at least 5 articles in last 60 days
const minArticleViews = 5;
const articleCountDays = 60;

const articleViewCount = getArticleViewCountForDays(articleCountDays);

const articleCountParagraph = `You’ve read ${articleViewCount} Guardian articles in the last two months – made possible by our choice to keep Guardian journalism open to all. We do not have a paywall because we believe everyone deserves access to factual information, regardless of where they live or what they can afford.`;

const url = 'http://support.theguardian.com/contribute/climate-pledge-2019';

const geolocation = geolocationGetSync();

export const articlesViewed60DaysMomentFinal: EpicABTest = makeEpicABTest({
    id: 'ContributionsEpicArticlesViewed60DaysMomentFinal',
    campaignId:
        '2019-10-14_moment_climate_pledge_v2_article_count_60_days',

    start: '2019-06-24',
    expiry: '2020-01-27',

    author: 'Tom Forbes',
    description:
        'Moment epic which also states how many articles a user has viewed',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Acquires many Supporters',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    geolocation,
    highPriority: true,
    useLocalViewLog: true,

    canRun: () => articleViewCount >= minArticleViews,

    variants: [
        {
            id: 'control',
            buttonTemplate: defaultButtonTemplate,
            products: [],
            copy: buildEpicCopy(controlCopy(articleCountParagraph), false, geolocation),
            classNames: [
                'contributions__epic--2019-10-14_moment_climate_pledge',
            ],
            supportBaseURL: url,
        },
        {
            id: 'variant',
            buttonTemplate: defaultButtonTemplate,
            products: [],
            copy: buildEpicCopy(variantCopy(articleCountParagraph), false, geolocation),
            classNames: [
                'contributions__epic--2019-10-14_moment_climate_pledge',
            ],
            supportBaseURL: url,
        },
    ],
});
