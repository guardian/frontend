// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

const abTestName = 'AcquisitionsEpicAu';

export const acquisitionsEpicAu: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-04-17',
    expiry: '2019-11-23',

    author: 'Joseph Smith',
    description: 'Test copy fetched from a Google Doc',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Alternative copy makes more money than the control',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    locations: ['AU'],

    variants: [
        {
            id: 'copy',
            products: [],
            options: {
                copy: {
                    heading: 'Since you’re here &hellip;',
                    paragraphs: [
                        '… we have a small favour to ask. More people are reading the Guardian’s independent, investigative journalism than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So you can see why we need to ask for your help.',
                        'The Guardian is editorially independent, meaning we set our own agenda. Our journalism is free from commercial bias and not influenced by politicians or shareholders. No one edits our Editor. No one steers our opinion. This is important because it enables us to give a voice to the voiceless, challenge the powerful and hold them to account. The Guardian’s editorial independence makes it stand out in a shrinking media landscape, at a time when factual and honest reporting is more critical than ever.',
                        'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                    ],
                    highlightedText: `For as little as ${getLocalCurrencySymbol()}1, you can support The Guardian – and it only takes a minute. Thank you.`,
                },
            },
        },
    ],
});
