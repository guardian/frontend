// @flow
import {
    makeEpicABTest,
    defaultButtonTemplate,
    buildEpicCopy,
} from 'common/modules/commercial/contributions-utilities';
import { getArticleViewCountForDays } from 'common/modules/onward/history';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const geolocation = geolocationGetSync();

const highlightedText =
    'Support The Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.';

const controlCopy = {
    heading: 'Since you’re here...',
    paragraphs: [
        '... we have a small favour to ask. More people are reading and supporting The Guardian’s independent, investigative journalism than ever before. And unlike many new organisations, we have chosen an approach that allows us to keep our journalism accessible to all, regardless of where they live or what they can afford. But we need your ongoing support to keep working as we do.',
        'The Guardian will engage with the most critical issues of our time – from the escalating climate catastrophe to widespread inequality to the influence of big tech on our lives. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart.',
        'Our editorial independence means we set our own agenda and voice our own opinions. Guardian journalism is free from commercial and political bias and not influenced by billionaire owners or shareholders. This means we can give a voice to those less heard, explore where others turn away, and rigorously challenge those in power.',
        'We need your support to keep delivering quality journalism, to maintain our openness and to protect our precious independence. Every reader contribution, big or small, is so valuable.',
    ],
    highlightedText,
};

declare type ArticleCountVariantConfig = {
    name: string,
    minArticleViews: number,
    articleCountDays: number,
    periodText: string,
};

const buildArticleCountVariant = ({
    name,
    minArticleViews,
    articleCountDays,
    periodText,
}: ArticleCountVariantConfig): InitEpicABTestVariant => {
    const articleViewCount = getArticleViewCountForDays(articleCountDays);

    return {
        id: name,
        buttonTemplate: defaultButtonTemplate,
        products: [],
        copy: buildEpicCopy(
            {
                heading: `You’ve read ${articleViewCount} articles...`,
                paragraphs: [
                    `... in the last ${periodText}. If you’ve enjoyed reading, we hope you will consider supporting our independent, investigative journalism today. More people around the world are reading and supporting The Guardian than ever before. And unlike many new organisations, we have chosen an approach that allows us to keep our journalism accessible to all, regardless of where they live or what they can afford. But we need your ongoing support to keep working as we do.`,
                    'The Guardian will engage with the most critical issues of our time – from the escalating climate catastrophe to widespread inequality to the influence of big tech on our lives. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart.',
                    'Our editorial independence means we set our own agenda and voice our own opinions. Guardian journalism is free from commercial and political bias and not influenced by billionaire owners or shareholders. This means we can give a voice to those less heard, explore where others turn away, and rigorously challenge those in power.',
                    'We need your support to keep delivering quality journalism, to maintain our openness and to protect our precious independence. Every reader contribution, big or small, is so valuable.',
                ],
                highlightedText,
            },
            false,
            geolocation
        ),
        canRun: () => articleViewCount >= minArticleViews,
    };
};

export const articlesViewed: EpicABTest = makeEpicABTest({
    id: 'ContributionsEpicArticlesViewedRound3',
    campaignId: 'epic_articles_viewed_round_3',

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

    variants: [
        {
            id: 'control',
            buttonTemplate: defaultButtonTemplate,
            products: [],
            copy: buildEpicCopy(controlCopy, false, geolocation),
        },
        buildArticleCountVariant({
            name: '5_articles_in_1_month',
            minArticleViews: 5,
            articleCountDays: 30,
            periodText: 'month',
        }),
        buildArticleCountVariant({
            name: '5_articles_in_2_months',
            minArticleViews: 5,
            articleCountDays: 60,
            periodText: 'two months',
        }),
        buildArticleCountVariant({
            name: '3_articles_in_1_month',
            minArticleViews: 3,
            articleCountDays: 30,
            periodText: 'month',
        }),
    ],
});
