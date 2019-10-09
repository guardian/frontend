// @flow
import {
    makeEpicABTest,
    defaultButtonTemplate,
    buildEpicCopy,
} from 'common/modules/commercial/contributions-utilities';
import { getArticleViewCountForDays } from 'common/modules/onward/history';
import { getSync as geolocationGetSync } from 'lib/geolocation';

// User must have read at least 5 articles in last 30 days
const minArticleViews = 5;
const articleCountDays = 30;

const articleViewCount = getArticleViewCountForDays(articleCountDays);

const heading = 'As the climate crisis escalates...';

const highlightedText =
    'Support us from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.';

const controlCopy = {
    heading,
    paragraphs: [
        '... The Guardian will not stay quiet. This is our pledge: we will continue to give global heating, wildlife extinction and pollution the urgent attention and prominence they demand. The Guardian recognises the climate emergency as the defining issue of our times.',
        'Our independence means we are free to investigate and challenge inaction by those in power around the world. We will inform our readers about threats to our environment based on scientific facts, not on commercial or political interests. And we have made an important change to our style guide to ensure the language we use accurately describes the urgent environmental catastrophes facing the world.',
        'The Guardian believes that the problems we face on the climate crisis are structural and that fundamental societal change is needed. We will keep reporting on the efforts of individuals and communities around the world who are fearlessly taking a stand for future generations and the preservation of our planet – and to inspire hope.',
        'The Guardian made a choice: to keep our journalism open to all. We do not have a paywall because we believe everyone deserves access to factual information, regardless of where they live or what they can afford.',
        'We hope you will consider supporting The Guardian’s open, independent reporting today. Every contribution from our readers, however big or small, is so valuable.',
    ],
    highlightedText,
};

const variantCopy = {
    heading,
    paragraphs: [
        '... The Guardian will not stay quiet. This is our pledge: we will continue to give global heating, wildlife extinction and pollution the urgent attention and prominence they demand. The Guardian recognises the climate emergency as the defining issue of our times.',
        'Our independence means we are free to investigate and challenge inaction by those in power around the world. We will inform our readers about threats to our environment based on scientific facts, not on commercial or political interests. And we have made an important change to our style guide to ensure the language we use accurately describes the urgent environmental catastrophes facing the world.',
        'The Guardian believes that the problems we face on the climate crisis are structural and that fundamental societal change is needed. We will keep reporting on the efforts of individuals and communities around the world who are fearlessly taking a stand for future generations and the preservation of our planet – and to inspire hope.',
        `You’ve read ${articleViewCount} Guardian articles in the last month – made possible by our choice to keep Guardian journalism open to all. We do not have a paywall because we believe everyone deserves access to factual information, regardless of where they live or what they can afford.`,
        'We hope you will consider supporting The Guardian’s open, independent reporting today. Every contribution from our readers, however big or small, is so valuable.',
    ],
    highlightedText,
};

const geolocation = geolocationGetSync();

export const articlesViewedMoment: EpicABTest = makeEpicABTest({
    id: 'ContributionsEpicArticlesViewedMonthMoment',
    campaignId: '2019-10-14_moment_climate_pledge_2019_article_count',

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

    canRun: () => articleViewCount >= minArticleViews,

    variants: [
        {
            id: 'control',
            buttonTemplate: defaultButtonTemplate,
            products: [],
            copy: buildEpicCopy(controlCopy, false, geolocation),
        },
        {
            id: 'variant',
            buttonTemplate: defaultButtonTemplate,
            products: [],
            copy: buildEpicCopy(variantCopy, false, geolocation),
        },
    ],
});
