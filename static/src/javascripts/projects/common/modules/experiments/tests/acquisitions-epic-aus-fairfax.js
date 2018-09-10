// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

const abTestName = 'AcquisitionsEpicAusFairfax';

export const acquisitionsEpicAusFairfax: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-04-17',
    expiry: '2019-06-05',

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
            id: 'control',
            products: [],
        },
        {
            id: 'shrinking_media_landscape',
            products: [],
            options: {
                copy: {
                    paragraphs: [
                        '… we have a small favour to ask. More people are reading the Guardian’s independent, investigative journalism than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So you can see why we need to ask for your help.',
                        'The Guardian is editorially independent, meaning we set our own agenda. Our journalism is free from commercial bias and not influenced by billionaire owners, politicians or shareholders. No one edits our Editor. No one steers our opinion. This is important because it enables us to give a voice to the voiceless, challenge the powerful and hold them to account. The Guardian’s editorial independence makes it stand out in a shrinking media landscape, at a time when factual and honest reporting is more critical than ever.',
                        'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                    ],
                    highlightedLine:
                        'For as little as $1, you can support the Guardian – and it only takes a minute. Thank you.',
                },
            },
        },
        {
            id: 'shrinking_media_landscape_and_plurality_of_voices',
            products: [],
            options: {
                copy: {
                    paragraphs: [
                        '… we have a small favour to ask. More people are reading the Guardian’s independent, investigative journalism than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So you can see why we need to ask for your help.',
                        'The Guardian is editorially independent, meaning we set our own agenda. Our journalism is free from commercial bias and not influenced by billionaire owners, politicians or shareholders. No one edits our Editor. No one steers our opinion. This is important because it enables us to give a voice to the voiceless, challenge the powerful and hold them to account. The Guardian’s editorial independence makes it stand out in a shrinking media landscape, at a time when factual and honest reporting is more critical than ever. The Guardian offers a plurality of voices when the majority of Australian media give voice to the powerful few.',
                        'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                    ],
                    highlightedLine:
                        'For as little as $1, you can support the Guardian – and it only takes a minute. Thank you.',
                },
            },
        },
    ],
});
