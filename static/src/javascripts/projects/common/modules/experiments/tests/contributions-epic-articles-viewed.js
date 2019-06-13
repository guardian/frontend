// @flow
import {
    makeEpicABTest,
    defaultButtonTemplate,
} from 'common/modules/commercial/contributions-utilities';
import { getArticleViewCount } from 'common/modules/onward/history';

const minArticleViews = 10;
const articleCountDays = 7;

const articleViewCount = getArticleViewCount(articleCountDays);

export const articlesViewed: EpicABTest = makeEpicABTest({
    id: 'ContributionsEpicArticlesViewed',
    campaignId: 'epic_articles_viewed',

    start: '2017-01-24',
    expiry: '2020-01-27',

    author: 'Tom Forbes',
    description: 'States how many articles a user has viewed in the epic',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Acquires many Supporters',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    canRun: () => articleViewCount >= minArticleViews,

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            buttonTemplate: defaultButtonTemplate,
            copy: {
                heading: `You've read ${articleViewCount} articles this week...`,
                paragraphs: [
                    '… we have a small favour to ask. More people are reading and supporting our independent, investigative reporting than ever before. And unlike many news organisations, we have chosen an approach that allows us to keep our journalism accessible to all, regardless of where they live or what they can afford.\n',
                    'The Guardian is editorially independent, meaning we set our own agenda. Our journalism is free from commercial bias and not influenced by billionaire owners, politicians or shareholders. No one edits our editor. No one steers our opinion. This is important as it enables us to give a voice to those less heard, challenge the powerful and hold them to account. It’s what makes us different to so many others in the media, at a time when factual, honest reporting is critical.',
                    'Every contribution we receive from readers like you, big or small, goes directly into funding our journalism. This support enables us to keep working as we do – but we must maintain and build on it for every year to come.',
                ],
                highlightedText:
                    'Support The Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.',
            },
        },
    ],
});
