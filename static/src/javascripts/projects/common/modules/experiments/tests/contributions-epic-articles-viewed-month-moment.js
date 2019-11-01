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

const highlightedText =
    'Support us from as little as %%CURRENCY_SYMBOL%%1 – it only takes a minute. Thank you.';

const monthArticleCountParagraph = `You’ve read ${articleViewCount} Guardian articles in the last month – made possible by our choice to keep Guardian journalism open to all. We do not have a paywall because we believe everyone deserves access to factual information, regardless of where they live or what they can afford.`;

export const controlCopy = (articleCountParagraph: string) => ({
    heading: 'As the climate crisis escalates...',
    paragraphs: [
        '... the Guardian will not stay quiet. This is our pledge: we will continue to give global heating, wildlife extinction and pollution the urgent attention and prominence they demand. The Guardian recognises the climate emergency as the defining issue of our times.',
        articleCountParagraph,
        'Our independence means we are free to investigate and challenge inaction by those in power. We will inform our readers about threats to the environment based on scientific facts, not driven by commercial or political interests. And we have made several important changes to our style guide to ensure the language we use accurately reflects the environmental catastrophe.',
        'The Guardian believes that the problems we face on the climate crisis are systemic and that fundamental societal change is needed. We will keep reporting on the efforts of individuals and communities around the world who are fearlessly taking a stand for future generations and the preservation of human life on earth. We want their stories to inspire hope. We will also report back on our own progress as an organisation, as we take important steps to address our impact on the environment.',
        'We hope you will consider supporting the Guardian’s open, independent reporting today. Every contribution from our readers, however big or small, is so valuable.',
    ],
    highlightedText,
});

export const variantCopy = (articleCountParagraph: string) => ({
    heading: 'Since we published our pledge...',
    paragraphs: [
        '... focused on the escalating climate crisis, Guardian readers from more than 100 countries across the world have supported us – thank you. Many of you have told us how much you value our commitment: to be truthful, resolute and undeterred in pursuing this important journalism. We are galvanised by your generous support as it makes our work possible.',
        articleCountParagraph,
        'We will not stay quiet on the escalating climate crisis and we recognise it as the defining issue of our lifetimes. The Guardian will give global heating, wildlife extinction and pollution the urgent attention they demand. Our independence means we can interrogate inaction by those in power. It means Guardian reporting will always be driven by scientific facts, never by commercial or political interests.',
        'We believe that the problems we face on the climate crisis are systemic and that fundamental societal change is needed. We will keep reporting on the efforts of individuals and communities around the world who are fearlessly taking a stand for future generations and the preservation of human life on earth. We want their stories to inspire hope. We will also report back on our own progress as an organisation, as we take important steps to address our impact on the environment.',
        'Thank you again to everyone who supported our pledge. Every contribution from our readers, however big or small, is so valuable. Learn more about why support matters.',
    ],
    highlightedText,
});

const url = 'http://support.theguardian.com/contribute/climate-pledge-2019';

const geolocation = geolocationGetSync();

export const articlesViewedMonthMomentFinal: EpicABTest = makeEpicABTest({
    id: 'ContributionsEpicArticlesViewedMonthMomentFinal',
    campaignId: '2019-10-14_moment_climate_pledge_v2_article_count_month',

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
            copy: buildEpicCopy(
                controlCopy(monthArticleCountParagraph),
                false,
                geolocation
            ),
            classNames: [
                'contributions__epic--2019-10-14_moment_climate_pledge',
            ],
            supportBaseURL: url,
        },
        {
            id: 'variant',
            buttonTemplate: defaultButtonTemplate,
            products: [],
            copy: buildEpicCopy(
                variantCopy(monthArticleCountParagraph),
                false,
                geolocation
            ),
            classNames: [
                'contributions__epic--2019-10-14_moment_climate_pledge',
            ],
            supportBaseURL: url,
        },
    ],
});
