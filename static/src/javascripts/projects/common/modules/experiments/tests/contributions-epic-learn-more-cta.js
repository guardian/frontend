// @flow
import {
    makeEpicABTest,
    defaultButtonTemplate,
    buildEpicCopy,
} from 'common/modules/commercial/contributions-utilities';
import { getArticleViewCountForDays } from 'common/modules/onward/history';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { epicButtonsLearnMoreTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons-learn-more';

// User must not have read fewer than 5 articles in the last 30 days
const maxArticleViews = 5;
const articleCountDays = 30;
const articleViewCount = getArticleViewCountForDays(articleCountDays);

const geolocation = geolocationGetSync();

const highlightedText =
    'Support The Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.';

const copy = {
    heading: 'Since you’re here...',
    paragraphs: [
        '... we have a small favour to ask. More people are reading and supporting The Guardian’s independent, investigative journalism than ever before. And unlike many new organisations, we have chosen an approach that allows us to keep our journalism accessible to all, regardless of where they live or what they can afford. But we need your ongoing support to keep working as we do.',
        'The Guardian will engage with the most critical issues of our time – from the escalating climate catastrophe to widespread inequality to the influence of big tech on our lives. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart.',
        'Our editorial independence means we set our own agenda and voice our own opinions. Guardian journalism is free from commercial and political bias and not influenced by billionaire owners or shareholders. This means we can give a voice to those less heard, explore where others turn away, and rigorously challenge those in power.',
        'We need your support to keep delivering quality journalism, to maintain our openness and to protect our precious independence. Every reader contribution, big or small, is so valuable.',
    ],
    highlightedText,
};

const learnMoreButtonTemplate: (CtaUrls, ctaText?: string) => string = (
    url: CtaUrls,
    ctaText?: string
) => epicButtonsLearnMoreTemplate(url, ctaText);

export const learnMore: EpicABTest = makeEpicABTest({
    id: 'ContributionsEpicLearnMoreCta',
    campaignId: 'epic_learn_more_cta',

    start: '2019-06-24',
    expiry: '2020-01-27',

    author: 'Joshua Lieberman',
    description: 'Encourages users ',
    successMeasure: 'AV & CTA click-through rate',
    idealOutcome:
        'Acquires many Supporters and audience demonstrating engagement',

    audienceCriteria: 'Not Australia',
    audience: 1,
    audienceOffset: 0,

    geolocation,
    highPriority: false,

    canRun: () => articleViewCount < maxArticleViews && geolocation !== 'AU',

    variants: [
        {
            id: 'control',
            buttonTemplate: defaultButtonTemplate,
            products: [],
            copy: buildEpicCopy(copy, false, geolocation),
        },
        {
            id: 'variant',
            buttonTemplate: learnMoreButtonTemplate,
            products: [],
            copy: buildEpicCopy(copy, false, geolocation),
        },
    ],
});
