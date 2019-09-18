// @flow
import {
    makeEpicABTest,
    defaultButtonTemplate,
    buildEpicCopy,
} from 'common/modules/commercial/contributions-utilities';
import { getArticleViewCountForDays } from 'common/modules/onward/history';
import { getCountryName, getSync as geolocationGetSync } from 'lib/geolocation';

// User must have read at least 5 articles in last 14 days
const minArticleViews = 5;
const articleCountDays = 30;

const articleViewCount = getArticleViewCountForDays(articleCountDays);

const highlightedText =
    'Support The Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.';

const USUKControlCopy = {
    heading: 'Since you’re here...',
    paragraphs: [
        '... we have a small favour to ask. More people are reading and supporting The Guardian’s independent, investigative journalism than ever before. And unlike many new organisations, we have chosen an approach that allows us to keep our journalism accessible to all, regardless of where they live or what they can afford. But we need your ongoing support to keep working as we do.',
        'The Guardian will engage with the most critical issues of our time – from the escalating climate catastrophe to widespread inequality to the influence of big tech on our lives. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart.',
        'Our editorial independence means we set our own agenda and voice our own opinions. Guardian journalism is free from commercial and political bias and not influenced by billionaire owners or shareholders. This means we can give a voice to those less heard, explore where others turn away, and rigorously challenge those in power.',
        'We need your support to keep delivering quality journalism, to maintain our openness and to protect our precious independence. Every reader contribution, big or small, is so valuable.',
    ],
    highlightedText,
};

const ROWControlCopy = {
    heading: 'More people in %%COUNTRY_NAME%%...',
    paragraphs: [
        '... like you, are reading and supporting The Guardian’s independent, investigative journalism than ever before. And unlike many new organisations, we have chosen an approach that allows us to keep our journalism accessible to all, regardless of where they live or what they can afford. But we need your ongoing support to keep working as we do.',
        'The Guardian will engage with the most critical issues of our time – from the escalating climate catastrophe to widespread inequality to the influence of big tech on our lives. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart.',
        'Our editorial independence means we set our own agenda and voice our own opinions. Guardian journalism is free from commercial and political bias and not influenced by billionaire owners or shareholders. This means we can give a voice to those less heard, explore where others turn away, and rigorously challenge those in power.',
        'We need your support to keep delivering quality journalism, to maintain our openness and to protect our precious independence. Every reader contribution, big or small, is so valuable.',
    ],
    highlightedText,
};

const geolocation = geolocationGetSync();
const isUSUK = ['GB', 'US'].includes(geolocation);

export const articlesViewed: EpicABTest = makeEpicABTest({
    id: 'ContributionsEpicArticlesViewedMonth',
    campaignId: 'epic_articles_viewed_month',

    start: '2019-06-24',
    expiry: '2020-01-27',

    author: 'Tom Forbes',
    description: 'States how many articles a user has viewed in the epic',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Acquires many Supporters',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    geolocation,
    highPriority: true,

    canRun: () =>
        articleViewCount >= minArticleViews && !!getCountryName(geolocation),

    variants: [
        {
            id: 'control',
            buttonTemplate: defaultButtonTemplate,
            products: [],
            copy: buildEpicCopy(
                isUSUK ? USUKControlCopy : ROWControlCopy,
                !isUSUK,
                geolocation
            ),
        },
        {
            id: 'variant',
            buttonTemplate: defaultButtonTemplate,
            products: [],
            copy: buildEpicCopy(
                {
                    heading: `You’ve read ${articleViewCount} articles...`,
                    paragraphs: [
                        '... in the last month. If you’ve enjoyed reading, we hope you will consider supporting our independent, investigative journalism today. More people around the world are reading and supporting The Guardian than ever before. And unlike many new organisations, we have chosen an approach that allows us to keep our journalism accessible to all, regardless of where they live or what they can afford. But we need your ongoing support to keep working as we do.',
                        'The Guardian will engage with the most critical issues of our time – from the escalating climate catastrophe to widespread inequality to the influence of big tech on our lives. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart.',
                        'Our editorial independence means we set our own agenda and voice our own opinions. Guardian journalism is free from commercial and political bias and not influenced by billionaire owners or shareholders. This means we can give a voice to those less heard, explore where others turn away, and rigorously challenge those in power.',
                        'We need your support to keep delivering quality journalism, to maintain our openness and to protect our precious independence. Every reader contribution, big or small, is so valuable.',
                    ],
                    highlightedText,
                },
                false,
                geolocation
            ),
        },
    ],
});
