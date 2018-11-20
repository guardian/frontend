// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicUsLeadingWithClimateTemplate } from 'common/modules/commercial/templates/acquisitions-epic-us-leading-with-climate';
import type { EpicTemplate } from 'common/modules/commercial/contributions-utilities';

const abTestName = 'AcquisitionsEpicUsPreEndOfYear';

const usEndOfYearCampaignTemplate: EpicTemplate = (
    { options = {} },
    copy: AcquisitionsEpicTemplateCopy
) =>
    acquisitionsEpicUsLeadingWithClimateTemplate({
        copy,
        componentName: options.componentName,
        buttonTemplate: options.buttonTemplate({
            supportUrl: options.supportURL,
        }),
    });

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
                    heading: 'In case you missed it &hellip;',
                    paragraphs: [
                        '&hellip; we recently posted some good news. Three years ago we set out to make The Guardian sustainable by deepening our relationship with our readers. The same technologies that connected us with a global audience had also shifted advertising revenues away from news publishers. We decided to seek an approach that would allow us to keep our journalism open and accessible to everyone, regardless of where they live or what they can afford.',
                        'More than one million readers have now supported our independent, investigative journalism through contributions, membership or subscriptions, which has played such an important part in helping the Guardian has overcome a perilous financial situation globally. We want to thank you for all of your support.  But we have to maintain and build on that support for every year to come.',
                        'Sustained support from our readers enables us to continue pursuing difficult stories in challenging times of political upheaval, when factual reporting has never been more critical. The Guardian is editorially independent - our journalism is free from commercial bias and not influenced by billionaire owners, politicians or shareholders. No one edits our editor. No one steers our opinion. This is important because it enables us to give a voice to those less heard, challenge the powerful and hold them to account. Readers’ support means we can continue bringing The Guardian’s independent journalism to the world.',
                        'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                    ],
                    highlightedText:
                        'For as little as $1, you can support the Guardian – and it only takes a minute. Thank you.',
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
        {
            id: 'leading_with_climate',
            products: [],
            options: {
                template: usEndOfYearCampaignTemplate,
                copy: {
                    paragraphs: [
                        'Help us do that by supporting our high impact reporting that holds our leaders accountable. Just when the need is more critical than ever, and the signs more obvious, millions of Americans – and most powerful political leaders – still question established climate science. The Guardian reports on the environment as a matter of urgent priority, giving the most important stories the space they need.',
                        'And this is not the only important story we need to tell. In 2018, The Guardian broke the story of Cambridge Analytica’s Facebook data breach; we recorded the human fallout from family separations; we charted the rise of the far right, and documented the growing impact of gun violence on Americans’ lives. We reported daily on climate change as a matter of urgent priority.',
                        'We need your ongoing support to continue bringing The Guardian’s independent, high impact journalism to the world.',
                    ],
                    highlightedText:
                        'Help us continue reporting on the stories that matter in 2019 and beyond by making a year-end contribution to The Guardian. Thank you.',
                },
            },
        },
    ],
});
