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
        `... we’re asking readers, like you, to make a contribution in support of the Guardian’s open, independent journalism. This is turning into a turbulent year with a succession of international crises. The Guardian is in every corner of the globe, calmly reporting with tenacity, rigour and authority on the most critical events of our lifetimes. At a time when factual information is both scarcer and more essential than ever, we believe that each of us deserves access to accurate reporting with integrity at its heart.`,
        `More people than ever before are reading and supporting our journalism, in more than 180 countries around the world. And this is only possible because we made a different choice: to keep our reporting open for all, regardless of where they live or what they can afford to pay.`,
        `We have upheld our editorial independence in the face of the disintegration of traditional media – with social platforms giving rise to misinformation, the seemingly unstoppable rise of big tech and independent voices being squashed by commercial ownership. The Guardian’s independence means we can set our own agenda and voice our own opinions. Our journalism is free from commercial and political bias – never influenced by billionaire owners or shareholders. This makes us different. It means we can challenge the powerful without fear and give a voice to those less heard.`,
        `None of this would have been attainable without our readers’ generosity – your financial support has meant we can keep investigating, disentangling and interrogating. It has protected our independence, which has never been so critical. We are so grateful.`,
        `We need your support so we can keep delivering quality journalism that’s open and independent. And that is here for the long term. Every reader contribution, however big or small, is so valuable.`,
    ],
    highlightedText,
};

const usCopy = {
    heading: 'America faces an epic choice...',
    paragraphs: [
        `... in the coming year, and the results will define the country for a generation. These are perilous times. Over the last three years, much of what the Guardian holds dear has been threatened – democracy, civility, truth. This US administration is establishing new norms of behaviour. Anger and cruelty disfigure public discourse and lying is commonplace. Truth is being chased away. But with your help we can continue to put it center stage.`,
        `Rampant disinformation, partisan news sources and social media's tsunami of fake news is no basis on which to inform the American public in 2020. The need for a robust, independent press has never been greater, and with your support we can continue to provide fact-based reporting that offers public scrutiny and oversight. Our journalism is free and open for all, but it's made possible thanks to the support we receive from readers like you across America in all 50 states.`,
        `Our journalism relies on our readers’ generosity – your financial support has meant we can keep investigating, disentangling and interrogating. It has protected our independence, which has never been so critical. We are so grateful.`,
        `We hope you will consider supporting us today. We need your support to keep delivering quality journalism that’s open and independent. Every reader contribution, however big or small, is so valuable.`,
    ],
    highlightedText,
};

const copy = isUS
    ? buildEpicCopy(usCopy, false, geolocation)
    : buildEpicCopy(controlCopy, false, geolocation);

export const contributionsEpicPrecontributionReminderRoundTwo: EpicABTest = makeEpicABTest(
    {
        id: 'ContributionsEpicPrecontributionReminderRoundTwo',
        campaignId: 'epic_precontribution_reminder_round_two',

        start: '2020-03-18',
        expiry: '2020-07-01',

        author: 'Joshua Lieberman',
        description:
            'Tests what adding the reminder does to the conversion rate of the epic',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Add reminder feature without hurting conversion rate',

        audienceCriteria: 'All',
        // Run this test for 15% of the audience
        audience: 0.15,
        // Set an offset to not interfere with dotcom's remoteRenderTest
        audienceOffset: 0.1,

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
                id: 'support-us',
                buttonTemplate: epicButtonsTemplate,
                products: [],
                copy,
                showReminderFields: {
                    reminderCTA: 'Support us later',
                    reminderDate: '2020-07-19 00:00:00',
                    reminderDateAsString: 'July 2020',
                },
            },
            {
                id: 'remind-me',
                buttonTemplate: epicButtonsTemplate,
                products: [],
                copy,
                showReminderFields: {
                    reminderCTA: 'Remind me in July',
                    reminderDate: '2020-07-19 00:00:00',
                    reminderDateAsString: 'July 2020',
                },
            },
        ],
    }
);
