// @flow
import {
    makeEpicABTest,
    buildEpicCopy,
} from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';

const geolocation = geolocationGetSync();

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

const copy = buildEpicCopy(controlCopy, false, geolocation);

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
        // Run this test for 20% of the audience
        audience: 0.2,
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
