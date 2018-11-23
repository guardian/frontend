// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

const abTestName = 'AcquisitionsEpicUsPreEndOfYear';

export const acquisitionsEpicUsPreEndOfYear: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-04-17',
    expiry: '2019-06-05',

    author: 'Joseph Smith',
    description: 'Tests an epic with custom copy in US',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Alternative copy makes more money than the control',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    locations: ['US'],

    variants: [
        {
            id: 'control',
            products: [],
            options: {
                copy: {
                    heading: 'We have some news &hellip;',
                    paragraphs: [
                        '&hellip; three years ago, we knew we had to try to make The Guardian sustainable by deepening our relationship with our readers. The revenues from our newspaper had diminished and the technologies that connected us with a global audience had moved advertising money away from news organisations. We knew we needed to find a way to keep our journalism open and accessible to everyone, regardless of where they live or what they can afford.',
                        'And so, we have an update for you on some good news. Thanks to all the readers who have supported our independent, investigative journalism through contributions, membership or subscriptions, we are starting to overcome the urgent financial situation we were faced with. Today we have been supported by more than a million readers around the world. Our future is starting to look brighter. But we have to maintain and build on that level of support for every year to come, which means we still need to ask for your help.',
                        'Ongoing financial support from our readers means we can continue pursuing difficult stories in the challenging times we are living through, when factual reporting has never been more critical. The Guardian is editorially independent – our journalism is free from commercial bias and not influenced by billionaire owners, politicians or shareholders. This is important because it enables us to challenge the powerful and hold them to account. With your support, we can continue bringing The Guardian’s independent journalism to the world.',
                        'If everyone who reads our reporting, who likes it, enjoys it, helps to support it, our future would be so much more secure.',
                    ],
                    highlightedText: `For as little as $1, you can support The Guardian – and it only takes a minute. Thank you.`,
                },
            },
        },
        {
            id: 'freedom_of_the_press',
            products: [],
            options: {
                copy: {
                    heading: 'You may have noticed &hellip;',
                    paragraphs: [
                        '&hellip; the free press is under attack. President Trump refuses to condemn those responsible for the murder of Jamal Khashoggi. He revoked a CNN reporter’s White House press pass and attacks mainstream media at his mass rallies. The president recently praised a Congressmen for attacking a Guardian reporter. He has accused the American press of being ‘the enemy of the people’.',
                        'In 2018, The Guardian broke the story of Cambridge Analytica’s Facebook data breach; we recorded the human fallout from family separations; we charted the rise of the far right, and documented the growing impact of gun violence on Americans’ lives. We reported daily on climate change as a matter of urgent priority.',
                        'The Guardian is editorially independent – our journalism is free from commercial bias and not influenced by shareholders or politicians. No one edits our editor. No one steers our opinion. This matters because it enables us to give a voice to those less heard, challenge the powerful and hold them to account. And we don’t have a paywall, meaning The Guardian’s journalism is open and accessible to everyone, regardless of where they live or what they can afford.',
                        'At a time when journalists are under attack, we need your ongoing support to continue bringing The Guardian’s independent journalism to the world.',
                    ],
                    highlightedText:
                        'Support the free press by making a year-end contribution to The Guardian. Thank you.',
                },
            },
        },
        {
            id: 'factual_truthful_reporting',
            products: [],
            options: {
                copy: {
                    heading: 'In 2018, the truth came under attack &hellip;',
                    paragraphs: [
                        '&hellip; help the Guardian set the record straight. In an era of disinformation campaigns and partisan bots, trustworthy news sources that sort facts from lies are more important than ever. This year we pursued difficult stories in challenging times and delivered factual reporting at a critical time in our history.',
                        'In 2018, The Guardian broke the story of Cambridge Analytica’s Facebook data breach; we recorded the human fallout from family separations; we charted the rise of the far right, and documented the growing impact of gun violence on Americans’ lives. We reported daily on climate change as a matter of urgent priority.',
                        'The Guardian is editorially independent – our journalism is free from commercial bias and not influenced by shareholders or politicians. No one edits our editor. No one steers our opinion. This matters because it enables us to give a voice to those less heard, challenge the powerful and hold them to account. And we don’t have a paywall, meaning The Guardian’s journalism is open and accessible to everyone, regardless of where they live or what they can afford.',
                        'At a time when factual reporting is critical, we need your ongoing support to continue bringing The Guardian’s independent journalism to the world.',
                    ],
                    highlightedText:
                        'Help us defend the truth in 2019 and beyond by making a year-end contribution to The Guardian. Thank you.',
                },
            },
        },
    ],
});
