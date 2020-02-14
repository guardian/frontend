// @flow
import {
    makeEpicABTest,
    buildEpicCopy,
} from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const highlightedText =
    'Support The Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.';

const controlCopy = {
    heading: 'Since you’re here...',
    paragraphs: [
        '... we have a small favour to ask. More people, like you, are reading and supporting the Guardian’s independent, investigative journalism than ever before. And unlike many news organisations, we made the choice to keep our reporting open for all, regardless of where they live or what they can afford to pay.',
        'The Guardian will engage with the most critical issues of our time – from the escalating climate emergency to widespread inequality to the influence of big tech on our lives. At a time when factual information is a necessity, we believe that each of us, around the world, deserves access to accurate reporting with integrity at its heart.',
        'Our editorial independence means we set our own agenda and voice our own opinions. Guardian journalism is free from commercial and political bias and not influenced by billionaire owners or shareholders. This means we can give a voice to those less heard, explore where others turn away, and rigorously challenge those in power.',
        'We hope you will consider supporting us today. We need your support to keep delivering quality journalism that’s open and independent. Every reader contribution, however big or small, is so valuable.',
    ],
    highlightedText,
};

const usCopy = {
    heading: 'America faces an epic choice...',
    paragraphs: [
        `... in the coming year, and the results will define the country for a generation. These are perilous times. Over the last three years, much of what the Guardian holds dear has been threatened – democracy, civility, truth. This US administration is establishing new norms of behaviour. Anger and cruelty disfigure public discourse and lying is commonplace. Truth is being chased away. But with your help we can continue to put it center stage.`,
        `Rampant disinformation, partisan news sources and social media's tsunami of fake news is no basis on which to inform the American public in 2020. The need for a robust, independent press has never been greater, and with your support we can continue to provide fact-based reporting that offers public scrutiny and oversight. Our journalism is free and open for all, but it's made possible thanks to the support we receive from readers like you across America in all 50 states.`,
        `On the occasion of its 100th birthday in 1921 the editor of the Guardian said, "Perhaps the chief virtue of a newspaper is its independence. It should have a soul of its own." That is more true than ever. Freed from the influence of an owner or shareholders, the Guardian's editorial independence is our unique driving force and guiding principle.`,
        `We also want to say a huge thank you to everyone who generously supports the Guardian. You provide us with the motivation and financial support to keep doing what we do. Every reader contribution, big or small is so valuable.`,
    ],
    highlightedText,
};

const copy = isUS
    ? buildEpicCopy(usCopy, false, geolocation)
    : buildEpicCopy(controlCopy, false, geolocation);

export const contributionsEpicPrecontributionReminderRoundOne: EpicABTest = makeEpicABTest(
    {
        id: 'ContributionsEpicPrecontributionReminderRoundOne',
        campaignId: 'epic_precontribution_reminder_round_one',

        start: '2020-02-01',
        expiry: '2020-04-01',

        author: 'Joshua Lieberman',
        description:
            'Tests what adding the reminder does to the conversion rate of the epic',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Add reminder feature without hurting conversion rate',

        audienceCriteria: 'All',
        // Run this test for 10% of the audience
        audience: 0.1,
        audienceOffset: 0,

        geolocation,
        highPriority: true,

        variants: [
            {
                id: 'control',
                buttonTemplate: epicButtonsTemplate,
                products: [],
                copy,
            },
            {
                id: 'withReminder',
                buttonTemplate: epicButtonsTemplate,
                products: [],
                copy,
                showReminderFields: {
                    reminderDate: '2020-05-19 00:00:00',
                    reminderDateAsString: 'May 2020',
                },
            },
        ],
    }
);
